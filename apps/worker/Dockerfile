FROM python:3.12-slim

# System deps: Ghostscript (aggressive compression), poppler (utilities),
# and build tools for any wheels that need compiling.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ghostscript \
      poppler-utils \
      libjpeg62-turbo \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY apps/worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/worker/alldocs_worker ./alldocs_worker

# Memory ceiling guidance (NFR: 4 GB per-worker) is enforced by the
# orchestrator (compose/k8s), not here.
ENV PYTHONUNBUFFERED=1
CMD ["python", "-m", "alldocs_worker.main"]
