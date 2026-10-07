"""
AllDocs worker — consumes BullMQ queues and runs PDF jobs.

For each tool queue it registers a bullmq.Worker. On each job it:
  1. downloads the input object(s) from S3,
  2. runs the processor,
  3. uploads the result under outputs/<jobId><ext>,
  4. updates the job:<id> metadata hash the API serves to the browser.

Job metadata is the ONLY durable state (Redis, TTL-governed). Files live in
object storage and are purged by lifecycle rules.
"""
import asyncio
import json
import signal

import redis.asyncio as aioredis
from bullmq import Worker

from . import config, storage
from . import processors


def _redis_url() -> str:
    auth = f":{config.REDIS_PASSWORD}@" if config.REDIS_PASSWORD else ""
    return f"redis://{auth}{config.REDIS_HOST}:{config.REDIS_PORT}"


meta_redis: aioredis.Redis = aioredis.from_url(_redis_url(), decode_responses=True)


async def _update_meta(job_id: str, **changes) -> None:
    key = f"job:{job_id}"
    raw = await meta_redis.get(key)
    if not raw:
        return  # expired or gone; nothing to update
    meta = json.loads(raw)
    meta.update(changes)
    ttl = await meta_redis.ttl(key)
    if ttl and ttl > 0:
        await meta_redis.set(key, json.dumps(meta), ex=ttl)
    else:
        await meta_redis.set(key, json.dumps(meta))


def make_handler(tool: str):
    async def handler(job, job_token):
        data = job.data
        job_id = data["jobId"]
        options = data.get("options", {}) or {}
        await _update_meta(job_id, state="active", progress=10)

        try:
            if tool == "jpg-to-pdf":
                keys = options.get("keys") or [data["inputKey"]]
                images = [storage.download(k) for k in keys]
                out, ext, ctype = processors.jpg_to_pdf(images, options)
                out_name = "images.pdf"
            else:
                raw = storage.download(data["inputKey"])
                await _update_meta(job_id, progress=40)
                if tool == "compress-pdf":
                    out, ext, ctype = processors.compress_pdf(raw, options)
                    out_name = "compressed.pdf"
                elif tool == "pdf-to-jpg":
                    out, ext, ctype = processors.pdf_to_jpg(raw, options)
                    out_name = "images.zip"
                else:
                    raise ValueError(f"Unknown tool: {tool}")

            out_key = f"outputs/{job_id}{ext}"
            storage.upload(out_key, out, ctype)
            await _update_meta(
                job_id,
                state="completed",
                progress=100,
                outputKey=out_key,
                outputName=out_name,
            )
            return {"outputKey": out_key, "bytes": len(out)}
        except Exception as exc:  # noqa: BLE001
            await _update_meta(job_id, state="failed", error=str(exc))
            raise

    return handler


async def main() -> None:
    opts = {
        "connection": _redis_url(),
        "concurrency": int(__import__("os").environ.get("WORKER_CONCURRENCY", "4")),
    }
    workers = [
        Worker(queue_name, make_handler(tool), opts)
        for tool, queue_name in config.QUEUES.items()
    ]
    print(f"[worker] listening on queues: {list(config.QUEUES.values())}", flush=True)

    stop = asyncio.Event()

    def _shutdown(*_):
        print("[worker] shutting down…", flush=True)
        stop.set()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, _shutdown)
        except NotImplementedError:
            pass

    await stop.wait()
    for w in workers:
        await w.close()
    await meta_redis.aclose()


if __name__ == "__main__":
    asyncio.run(main())
