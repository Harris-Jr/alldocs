/** Centralized env config with local-dev defaults. */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',

  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT ?? 'http://127.0.0.1:9000',
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'alldocs',
    accessKeyId: process.env.S3_ACCESS_KEY ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
    // MinIO needs path-style; real S3 uses virtual-hosted. Toggle via env.
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
    // Public base used to hand download URLs back to the browser.
    publicEndpoint: process.env.S3_PUBLIC_ENDPOINT ?? 'http://127.0.0.1:9000',
  },

  limits: {
    // server job cap (free tier) — mirrors packages/config
    maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES ?? 100 * 1024 * 1024),
    uploadUrlTtl: Number(process.env.UPLOAD_URL_TTL ?? 15 * 60),
    downloadUrlTtl: Number(process.env.DOWNLOAD_URL_TTL ?? 60 * 60),
  },
} as const;
