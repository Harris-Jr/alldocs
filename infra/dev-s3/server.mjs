/**
 * Minimal S3-compatible object store for LOCAL DEVELOPMENT & TESTS ONLY.
 *
 * It honors exactly what AllDocs uses: PUT (upload), GET (download), HEAD.
 * It deliberately does NOT validate SigV4 signatures — it trusts any request
 * whose path points at a known key. In production you run real S3 or MinIO at
 * S3_ENDPOINT; nothing in the app changes. Do not expose this to a network.
 *
 * Usage: node infra/dev-s3/server.mjs   (listens on :9000, data in ./.data)
 */
import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.DEV_S3_PORT ?? 9000);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '.data');
const BUCKET = process.env.S3_BUCKET ?? 'alldocs';

await fs.mkdir(path.join(ROOT, BUCKET), { recursive: true });

function keyFromUrl(urlPath) {
  // path-style: /bucket/key...  → strip leading slash + bucket
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const parts = decoded.replace(/^\/+/, '').split('/');
  if (parts[0] === BUCKET) parts.shift();
  return parts.join('/');
}

function safePath(key) {
  const p = path.join(ROOT, BUCKET, key);
  if (!p.startsWith(path.join(ROOT, BUCKET))) throw new Error('path traversal');
  return p;
}

const server = http.createServer(async (req, res) => {
  try {
    const key = keyFromUrl(req.url ?? '/');
    const file = safePath(key);

    if (req.method === 'PUT') {
      await fs.mkdir(path.dirname(file), { recursive: true });
      const chunks = [];
      for await (const c of req) chunks.push(c);
      await fs.writeFile(file, Buffer.concat(chunks));
      res.writeHead(200, { ETag: '"dev"' });
      return res.end();
    }

    if (req.method === 'HEAD') {
      try {
        const st = await fs.stat(file);
        res.writeHead(200, { 'Content-Length': String(st.size) });
      } catch {
        res.writeHead(404);
      }
      return res.end();
    }

    if (req.method === 'GET') {
      try {
        const data = await fs.readFile(file);
        const url = new URL(req.url ?? '/', 'http://localhost');
        const disp = url.searchParams.get('response-content-disposition');
        res.writeHead(200, {
          'Content-Length': String(data.length),
          'Content-Type': guessType(key),
          ...(disp ? { 'Content-Disposition': disp } : {}),
        });
        return res.end(data);
      } catch {
        res.writeHead(404);
        return res.end('Not found');
      }
    }

    res.writeHead(405);
    res.end();
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
});

function guessType(key) {
  if (key.endsWith('.pdf')) return 'application/pdf';
  if (key.endsWith('.zip')) return 'application/zip';
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg';
  if (key.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
}

server.listen(PORT, () => {
  console.log(`[dev-s3] S3-compatible dev store on :${PORT}, bucket "${BUCKET}", data at ${ROOT}`);
});
