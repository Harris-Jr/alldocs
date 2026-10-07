import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUE, redisKey } from '@alldocs/config';
import { RedisService } from '../redis/redis.service';
import { StorageService } from '../storage/storage.service';
import { config } from '../config';

const QUEUE_FOR: Record<string, string> = {
  'compress-pdf': QUEUE.compress,
  'pdf-to-jpg': QUEUE.pdfToJpg,
  'jpg-to-pdf': QUEUE.jpgToPdf,
};

export interface JobMeta {
  id: string;
  tool: string;
  state: 'queued' | 'active' | 'completed' | 'failed';
  inputKey: string;
  outputKey?: string;
  outputName?: string;
  error?: string;
  progress?: number;
  userId?: string;
  createdAt: number;
  expiresAt: number;
}

@Injectable()
export class JobsService implements OnModuleDestroy {
  private readonly queues = new Map<string, Queue>();

  constructor(
    private readonly redis: RedisService,
    private readonly storage: StorageService,
  ) {}

  private queue(tool: string): Queue {
    const name = QUEUE_FOR[tool];
    if (!name) throw new NotFoundException(`Unknown tool: ${tool}`);
    let q = this.queues.get(name);
    if (!q) {
      q = new Queue(name, { connection: this.redis.client });
      this.queues.set(name, q);
    }
    return q;
  }

  async create(input: {
    tool: string;
    key: string;
    options?: Record<string, unknown>;
    userId?: string;
  }): Promise<{ id: string }> {
    const id = crypto.randomUUID();
    const ttl = config.limits.downloadUrlTtl;
    const now = Date.now();
    const meta: JobMeta = {
      id,
      tool: input.tool,
      state: 'queued',
      inputKey: input.key,
      userId: input.userId,
      createdAt: now,
      expiresAt: now + ttl * 1000,
    };

    // Persist metadata with TTL (no file DB — metadata only, auto-expiring).
    await this.redis.client.set(redisKey.job(id), JSON.stringify(meta), 'EX', ttl);
    if (input.userId) {
      await this.redis.client.lpush(redisKey.userJobs(input.userId), id);
      await this.redis.client.ltrim(redisKey.userJobs(input.userId), 0, 99);
      await this.redis.client.expire(redisKey.userJobs(input.userId), 30 * 24 * 60 * 60);
    }

    // Enqueue for the worker. Retry ×2 with backoff (NFR: auto-retry).
    await this.queue(input.tool).add(
      input.tool,
      { jobId: id, tool: input.tool, inputKey: input.key, options: input.options ?? {} },
      {
        jobId: id,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    return { id };
  }

  async get(id: string): Promise<{
    id: string;
    tool: string;
    state: JobMeta['state'];
    progress?: number;
    downloadUrl?: string;
    outputName?: string;
    error?: string;
    expiresAt: number;
  }> {
    const raw = await this.redis.client.get(redisKey.job(id));
    if (!raw) throw new NotFoundException('Job not found or expired.');
    const meta = JSON.parse(raw) as JobMeta;

    let downloadUrl: string | undefined;
    if (meta.state === 'completed' && meta.outputKey) {
      downloadUrl = await this.storage.signDownload(
        meta.outputKey,
        meta.outputName ?? 'result',
      );
    }

    return {
      id: meta.id,
      tool: meta.tool,
      state: meta.state,
      progress: meta.progress,
      downloadUrl,
      outputName: meta.outputName,
      error: meta.error,
      expiresAt: meta.expiresAt,
    };
  }

  async listForUser(userId: string): Promise<JobMeta[]> {
    const ids = await this.redis.client.lrange(redisKey.userJobs(userId), 0, 49);
    if (ids.length === 0) return [];
    const raws = await this.redis.client.mget(ids.map((i) => redisKey.job(i)));
    return raws
      .filter((r): r is string => !!r)
      .map((r) => JSON.parse(r) as JobMeta);
  }

  async onModuleDestroy() {
    await Promise.all([...this.queues.values()].map((q) => q.close()));
  }
}
