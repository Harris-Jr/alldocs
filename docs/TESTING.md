# Testing

Three layers, matching the build.

## 1. Unit — `@alldocs/pdf-core` (Vitest)

Pure pdf-lib operations: merge, split, rotate, watermark, page numbers, page-spec
parsing, magic-byte validation, color parsing.

```bash
pnpm --filter @alldocs/pdf-core test
```

No services required. **30 tests.**

## 2. Integration — API flow (Vitest, HTTP-driven)

Exercises the real server-tool pipeline end to end against a running stack:
sign upload → PUT to storage → create job → worker processes → poll → signed
download → verify the output PDF. Also checks the sign-time guards (invalid tool,
size cap, MIME mismatch).

Bring the stack up, then run with `RUN_INTEGRATION=1` (skipped otherwise):

```bash
# services
redis-server --save "" --appendonly no --daemonize yes
node infra/dev-s3/server.mjs &                 # or MinIO on :9000

# build + run API
pnpm --filter @alldocs/config build
pnpm --filter @alldocs/api build
( cd apps/api && S3_ENDPOINT=http://localhost:9000 S3_PUBLIC_ENDPOINT=http://localhost:9000 \
    REDIS_HOST=127.0.0.1 node dist/main.js ) &

# worker
( cd apps/worker && pip install -r requirements.txt && \
    REDIS_HOST=127.0.0.1 S3_ENDPOINT=http://localhost:9000 PYTHONPATH=. \
    python -m alldocs_worker.main ) &

# the test
RUN_INTEGRATION=1 pnpm --filter @alldocs/api test
```

With Docker Compose the equivalent is `pnpm infra:up`, then point `API_BASE` at
`http://localhost:4000` (the default) and run the same command.

**5 tests.**

## 3. E2E — merge in the browser (Playwright)

Loads `/merge-pdf`, uploads two PDFs, merges, downloads, and asserts the result
is a 5-page PDF — **and that no upload/job request was ever made**, proving the
file stayed on the device. Also checks non-PDF rejection.

```bash
# needs the web server running (pnpm --filter @alldocs/web start) and chromium
pnpm --filter @alldocs/web exec playwright install chromium   # once

# default: Playwright starts the server itself
pnpm --filter @alldocs/web test:e2e

# or reuse a running server + a preinstalled chromium:
PW_BASE_URL=http://localhost:3000 \
PW_CHROMIUM_PATH=/path/to/chrome \
pnpm --filter @alldocs/web test:e2e
```

**2 tests.**

## Everything at once

```bash
pnpm test          # runs each package's `test` script
```

Unit tests run anywhere; integration/e2e need their services (and are skipped or
will report a clear "stack not reachable" error otherwise).
