# Infra

Local development stack for AllDocs.

## Services (`docker-compose.yml`)

| Service | Purpose | Ports |
|---|---|---|
| `redis` | BullMQ queue + job metadata (TTL) | 6379 |
| `minio` | S3-compatible object storage | 9000 (API), 9001 (console) |
| `minio-init` | One-shot: creates the bucket + **1-day lifecycle purge** rule | — |
| `api` | NestJS API | 4000 |
| `worker` | Python processing worker | — |

```bash
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml logs -f worker
docker compose -f infra/docker-compose.yml down
```

## Zero-retention: the lifecycle rule

Auto-deletion is enforced by **object storage lifecycle rules**, not application
code — so even a crashed job leaves nothing behind. The `minio-init` service runs:

```
mc ilm rule add --expire-days 1 local/alldocs
```

On AWS S3, apply the equivalent lifecycle configuration to the bucket, scoped to
the `inputs/` and `outputs/` prefixes, expiring objects after 1 day (or less).
For sub-hour purging, run a scheduled sweep or use S3 Object Expiration with a
short rule plus signed-URL TTLs (the app already caps download links at 1 hour).

## Dev S3 (`dev-s3/`)

When you can't run MinIO (e.g. image pulls blocked), use the bundled stand-in:

```bash
node infra/dev-s3/server.mjs      # :9000, data in infra/dev-s3/.data
```

It implements only PUT/GET/HEAD and **does not validate SigV4 signatures**. It is
for local testing of the upload→job→download flow only. Never expose it.

## Notes

- `S3_ENDPOINT` is the **internal** URL services use (`minio:9000` in compose).
- `S3_PUBLIC_ENDPOINT` is what the **browser** uses for signed URLs
  (`localhost:9000`), so presigned links resolve from outside the docker network.
- The worker image bundles Ghostscript + Poppler for production-grade compression.
