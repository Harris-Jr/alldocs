/**
 * Integration test: upload → job → worker → download.
 *
 * Drives the REAL running API over HTTP (default http://localhost:4000) against
 * live Redis + object storage, with the Python worker consuming the queue.
 * Gated behind RUN_INTEGRATION=1 because it needs those services up.
 *
 * Bring the stack up first (see README), e.g. locally:
 *   redis-server --save "" --daemonize yes
 *   node infra/dev-s3/server.mjs &
 *   (cd apps/api && node dist/main.js) &
 *   (cd apps/worker && PYTHONPATH=. python -m alldocs_worker.main) &
 *
 * Then:  RUN_INTEGRATION=1 pnpm --filter @alldocs/api test
 */
import { describe, it, beforeAll, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';

const RUN = process.env.RUN_INTEGRATION === '1';
const BASE = process.env.API_BASE ?? 'http://localhost:4000';
const d = RUN ? describe : describe.skip;

async function makePdf(pages: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([400, 600]);
  return Buffer.from(await doc.save());
}

d('upload → job → download (compress-pdf)', () => {
  beforeAll(async () => {
    // Fail fast with a clear message if the stack isn't up.
    const res = await fetch(`${BASE}/health`).catch(() => null);
    if (!res || !res.ok) {
      throw new Error(
        `API not reachable at ${BASE}. Start the stack first (see test header / README).`,
      );
    }
  });

  it('health reports redis up', async () => {
    const body = await fetch(`${BASE}/health`).then((r) => r.json());
    expect(body.status).toBe('ok');
    expect(body.redis).toBe('up');
  });

  it('runs a compress job end to end and yields a working download', async () => {
    const pdf = await makePdf(3);

    const sign = await fetch(`${BASE}/uploads/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'compress-pdf',
        filename: 'in.pdf',
        contentType: 'application/pdf',
        size: pdf.length,
      }),
    }).then((r) => r.json());
    expect(sign.uploadUrl).toBeTruthy();
    expect(sign.key).toBeTruthy();

    const put = await fetch(sign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: pdf,
    });
    expect(put.ok).toBe(true);

    const { id } = await fetch(`${BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'compress-pdf',
        key: sign.key,
        options: { preset: 'recommended' },
      }),
    }).then((r) => r.json());
    expect(id).toBeTruthy();

    let status: any;
    const deadline = Date.now() + 25_000;
    do {
      await new Promise((r) => setTimeout(r, 1000));
      status = await fetch(`${BASE}/jobs/${id}`).then((r) => r.json());
    } while (status.state !== 'completed' && status.state !== 'failed' && Date.now() < deadline);

    expect(status.state, `job ended in ${status.state}: ${status.error ?? ''}`).toBe('completed');
    expect(status.downloadUrl).toBeTruthy();

    const out = Buffer.from(await fetch(status.downloadUrl).then((r) => r.arrayBuffer()));
    expect(out.subarray(0, 4).toString()).toBe('%PDF');
    expect((await PDFDocument.load(out)).getPageCount()).toBe(3);
  });

  it('rejects an invalid tool at sign time', async () => {
    const res = await fetch(`${BASE}/uploads/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'not-a-tool',
        filename: 'x.pdf',
        contentType: 'application/pdf',
        size: 10,
      }),
    });
    expect(res.status).toBe(400);
  });

  it('enforces the free-tier size cap', async () => {
    const res = await fetch(`${BASE}/uploads/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'compress-pdf',
        filename: 'big.pdf',
        contentType: 'application/pdf',
        size: 200 * 1024 * 1024 + 1,
      }),
    });
    expect(res.status).toBe(400);
  });

  it('rejects a mismatched MIME type for the tool', async () => {
    const res = await fetch(`${BASE}/uploads/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'compress-pdf',
        filename: 'x.png',
        contentType: 'image/png',
        size: 10,
      }),
    });
    expect(res.status).toBe(400);
  });
});
