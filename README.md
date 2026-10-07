# AllDocs

> Every document tool you need, in your browser — with your files never leaving your device unless you ask them to.

AllDocs is a privacy-first, **open-source**, browser-based document toolkit. Lightweight tools (merge, split, rotate, watermark, page numbers) run **entirely client-side** via WebAssembly — the file never touches a server. Heavier tools (compress, PDF↔JPG) run on an elastic worker queue, with files encrypted in transit and auto-deleted within the hour.

Free forever, no signup, no limits, no watermarks — and because the code is public, the privacy claims are verifiable. Self-host the whole stack with one `docker compose up`.

This repository contains the **Phase 1 MVP**.

---

## What's in Phase 1

| Tool | Where it runs | Status |
|---|---|---|
| Merge PDF | 🔒 Browser (WASM) | ✅ |
| Split PDF (range / every-N / extract) | 🔒 Browser (WASM) | ✅ |
| Rotate PDF (per-page, with previews) | 🔒 Browser (WASM) | ✅ |
| Watermark PDF | 🔒 Browser (WASM) | ✅ |
| Page Numbers | 🔒 Browser (WASM) | ✅ |
| Compress PDF (3 tiers) | ☁️ Worker | ✅ |
| PDF → JPG | ☁️ Worker | ✅ |
| JPG → PDF | ☁️ Worker | ✅ |

Plus: SEO landing page, per-tool SEO pages, optional auth (JWT), a job-history dashboard (metadata only), and a per-tool transparency page.

---

## Architecture

```
apps/
  web/      Next.js 14 (App Router) + Tailwind. Landing, tool pages,
            client-side WASM tools (pdf-lib + PDF.js), auth, dashboard.
  api/      NestJS. JWT auth, signed S3 uploads, BullMQ job producer,
            job status, SSRF-protected URL fetch.
  worker/   Python. BullMQ consumers → PyMuPDF / pikepdf / Pillow.
            Compress, PDF→JPG, JPG→PDF.
packages/
  config/   Shared design tokens, tool catalog, limits, queue names.
  pdf-core/ Framework-agnostic pdf-lib operations (unit-tested).
infra/      docker-compose, dev S3, bucket lifecycle init.
```

**Request flow for a server tool:**

```
browser ──① POST /uploads/sign──▶ API ──▶ signed PUT URL
browser ──② PUT bytes───────────▶ S3 (direct, never through the API)
browser ──③ POST /jobs──────────▶ API ──▶ enqueue (BullMQ / Redis)
                                   worker ──▶ pull, process, upload result
browser ──④ GET /jobs/:id (poll)─▶ API ──▶ signed download URL (1h TTL)
```

Client tools skip all of that: the file is read into browser memory, processed in-page with pdf-lib, and handed straight back.

---

## Prerequisites

- **Node.js 22+** and **pnpm 10+** (`corepack enable`)
- **Python 3.12+** (for the worker, if running it outside Docker)
- **Docker + Docker Compose** (for Redis + MinIO + services)

---

## Quick start (Docker Compose — everything)

```bash
cp .env.example .env
pnpm install

# Build & start Redis, MinIO (+ bucket w/ 1-day lifecycle), API, worker
pnpm infra:up           # docker compose -f infra/docker-compose.yml up -d

# Run the web app (hot-reload) against the dockerized API
pnpm dev                # http://localhost:3000
```

MinIO console: http://localhost:9001 (minioadmin / minioadmin).
API health: http://localhost:4000/health.

Stop everything: `pnpm infra:down`.

---

## Quick start (local processes — no Docker for app code)

Useful for development or environments where pulling images is blocked.

```bash
cp .env.example .env
pnpm install

# 1. Redis (native or docker)
redis-server --save "" --appendonly no --daemonize yes

# 2. Object storage. Either MinIO…
#    docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address :9001
#    …or the bundled dev S3 (no external deps, local testing only):
node infra/dev-s3/server.mjs            # listens on :9000

# 3. Build shared packages, then the API
pnpm --filter @alldocs/config build
pnpm --filter @alldocs/api build
node apps/api/dist/main.js              # :4000

# 4. Worker (Python)
cd apps/worker
pip install -r requirements.txt
PYTHONPATH=. python -m alldocs_worker.main

# 5. Web
pnpm dev                                # :3000
```

> **Note on the dev S3** (`infra/dev-s3`): a ~100-line stand-in that implements
> only PUT/GET/HEAD and does **not** validate SigV4 signatures. It exists so the
> full upload→job→download flow runs locally without MinIO. **Never expose it.**
> Production uses real S3 or MinIO at `S3_ENDPOINT`; no app code changes.

> **Fonts:** the app references **Inter** via the `--font-inter` CSS variable with
> a system fallback, so builds don't require network access to Google Fonts. To
> use the real webfont in production, switch `src/app/layout.tsx` to
> `next/font/google` (Inter) or self-host woff2 via `next/font/local` — the CSS
> variable is the only integration point.

---

## Environment variables

See [`.env.example`](./.env.example) for the full list. Key ones:

| Var | Purpose |
|---|---|
| `JWT_SECRET` | **Change in production.** Signs auth tokens. |
| `CORS_ORIGIN` | Allowed browser origin(s) for the API. Must match the web origin exactly (`localhost` ≠ `127.0.0.1`). |
| `S3_ENDPOINT` / `S3_PUBLIC_ENDPOINT` | Internal vs browser-reachable storage URLs. |
| `S3_FORCE_PATH_STYLE` | `true` for MinIO, `false` for AWS S3 virtual-hosted. |
| `DOWNLOAD_URL_TTL` | Signed download link lifetime (1h default). |
| `NEXT_PUBLIC_API_URL` | Where the browser reaches the API. |

---

## Testing

```bash
# Unit — pdf-core operations (Vitest)
pnpm --filter @alldocs/pdf-core test        # 30 tests

# Integration — upload → job → worker → download (needs Redis + dev-s3 + worker)
pnpm --filter @alldocs/api test

# E2E — merge 2 PDFs fully client-side (Playwright)
pnpm --filter @alldocs/web test:e2e
```

See [`docs/TESTING.md`](./docs/TESTING.md) for prerequisites and what each suite covers.

---

## Security & privacy posture

- **Client-first:** anything doable in WASM runs locally; the file is never uploaded.
- **Signed, short-lived URLs:** 15-min uploads, 1-hour downloads.
- **Magic-byte validation:** files are checked by content signature, not extension (both client and worker).
- **SSRF protection** on URL import: http/https only, private/link-local ranges blocked (incl. `169.254.169.254`), DNS resolved and re-checked, size-capped.
- **Zero file retention:** storage lifecycle rule purges objects within the hour; only job *metadata* is kept, with a TTL, in Redis. No file database.
- **No third-party trackers** on tool pages; security headers set in `next.config.mjs`.

---

## Deploy notes

- **Web:** deploy `apps/web` to any Node host or Vercel. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`.
- **API:** container (`apps/api/Dockerfile`). Needs Redis + S3. Put behind TLS (TLS 1.3 + HSTS). Scale horizontally; it's stateless.
- **Worker:** container (`apps/worker/Dockerfile`, includes Ghostscript + Poppler). Scale on queue depth (0→N). Set a memory limit (~4 GB/worker per the spec).
- **Storage:** real S3 or MinIO. **Apply a lifecycle rule** to expire `inputs/` and `outputs/` within 1–24h — this is what enforces zero retention. The compose `minio-init` service shows the rule (`mc ilm rule add --expire-days 1`).
- **Redis:** managed Redis or a container. Only holds job metadata + the BullMQ queue; both expire.

---

## Tech stack

Next.js 14 · TypeScript · Tailwind · pdf-lib · PDF.js · NestJS · BullMQ · Redis · AWS SDK v3 (S3) · Python · PyMuPDF · pikepdf · Pillow · Vitest · Playwright · Docker.

## Roadmap

Phase 2: full Office conversions, OCR, edit suite, unlock/protect, redact, cloud imports.
Phase 3: e-signatures, compare, scan-to-PDF PWA, public API, team workspaces.
Phase 4: desktop app (Tauri), browser extension, white-label embedding.

## License

MIT — see [LICENSE](./LICENSE). Contributions welcome.
