"""Worker configuration from env, mirroring the API's defaults."""
import os

REDIS_HOST = os.environ.get("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD") or None

S3_ENDPOINT = os.environ.get("S3_ENDPOINT", "http://127.0.0.1:9000")
S3_REGION = os.environ.get("S3_REGION", "us-east-1")
S3_BUCKET = os.environ.get("S3_BUCKET", "alldocs")
S3_ACCESS_KEY = os.environ.get("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.environ.get("S3_SECRET_KEY", "minioadmin")
S3_FORCE_PATH_STYLE = os.environ.get("S3_FORCE_PATH_STYLE", "true") == "true"

DOWNLOAD_URL_TTL = int(os.environ.get("DOWNLOAD_URL_TTL", str(60 * 60)))

# Queue names — MUST match packages/config/limits.ts QUEUE.
QUEUES = {
    "compress-pdf": "alldocs-compress",
    "pdf-to-jpg": "alldocs-pdf-to-jpg",
    "jpg-to-pdf": "alldocs-jpg-to-pdf",
}

# Per-worker memory ceiling note (NFR): enforce via container limits (4 GB).
MAX_INPUT_BYTES = int(os.environ.get("MAX_INPUT_BYTES", str(2 * 1024 * 1024 * 1024)))
