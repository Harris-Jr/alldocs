/**
 * Per-tier limits and job constants, shared across web/api/worker.
 * Numbers come straight from the concept + features docs.
 */

export const TIER = {
  free: {
    maxFiles: 10,
    maxTotalBytes: 200 * 1024 * 1024, // 200 MB
    linkTtlSeconds: 60 * 60, // 1 hour
    maxFileBytesServer: 100 * 1024 * 1024, // server jobs ≤ 100 MB free
  },
  pro: {
    maxFiles: 100,
    maxTotalBytes: 2 * 1024 * 1024 * 1024, // 2 GB
    linkTtlSeconds: 24 * 60 * 60, // 24 hours
    maxFileBytesServer: 2 * 1024 * 1024 * 1024,
  },
} as const;

export type TierName = keyof typeof TIER;

/**
 * BullMQ queue names — must match api (producer) and worker (consumer).
 * Note: BullMQ v5 forbids ':' in queue names (reserved for its Redis keys).
 */
export const QUEUE = {
  compress: 'alldocs-compress',
  pdfToJpg: 'alldocs-pdf-to-jpg',
  jpgToPdf: 'alldocs-jpg-to-pdf',
} as const;

export type QueueName = (typeof QUEUE)[keyof typeof QUEUE];

/** Redis key helpers for job metadata (TTL-governed, no file DB). */
export const redisKey = {
  job: (id: string) => `job:${id}`,
  userJobs: (userId: string) => `user:${userId}:jobs`,
};

/** Signed upload URL lifetime. */
export const UPLOAD_URL_TTL_SECONDS = 15 * 60; // 15 min

/** Compression presets exposed to users; mapped to engine settings in the worker. */
export const COMPRESS_PRESETS = ['extreme', 'recommended', 'less-loss'] as const;
export type CompressPreset = (typeof COMPRESS_PRESETS)[number];

/** Accepted upload MIME types by tool, validated server-side by magic bytes. */
export const ACCEPTED_MIME: Record<string, string[]> = {
  'compress-pdf': ['application/pdf'],
  'pdf-to-jpg': ['application/pdf'],
  'jpg-to-pdf': ['image/jpeg', 'image/png'],
};

/** Magic-byte signatures used for server-side validation. */
export const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
};
