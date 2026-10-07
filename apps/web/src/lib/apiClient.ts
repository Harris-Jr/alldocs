'use client';

/**
 * Client for the upload → job → download flow (compress, PDF↔JPG).
 * Talks to the NestJS API. All heavy processing happens server-side; this
 * module only orchestrates signed upload, job creation, and polling.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface JobStatus {
  id: string;
  tool: string;
  state: 'queued' | 'active' | 'completed' | 'failed';
  progress?: number;
  downloadUrl?: string;
  outputName?: string;
  error?: string;
  expiresAt?: number;
}

async function jfetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status}).`);
  }
  return res.json() as Promise<T>;
}

/** Step 1: ask API for a signed upload URL + object key. */
export async function requestUpload(input: {
  tool: string;
  filename: string;
  contentType: string;
  size: number;
}): Promise<{ uploadUrl: string; key: string; method: 'PUT' | 'POST'; fields?: Record<string, string> }> {
  return jfetch('/uploads/sign', { method: 'POST', body: JSON.stringify(input) });
}

/** Step 2: PUT the bytes straight to object storage (never through our API). */
export async function uploadToStorage(
  uploadUrl: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<void> {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: ab,
    headers: { 'Content-Type': contentType },
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status}).`);
}

/** Step 3: create the processing job. */
export async function createJob(input: {
  tool: string;
  key: string;
  options?: Record<string, unknown>;
}): Promise<{ id: string }> {
  return jfetch('/jobs', { method: 'POST', body: JSON.stringify(input) });
}

/** Step 4: poll until completed/failed. */
export async function getJob(id: string): Promise<JobStatus> {
  return jfetch(`/jobs/${id}`);
}

export async function pollJob(
  id: string,
  onUpdate: (s: JobStatus) => void,
  { intervalMs = 1000, timeoutMs = 120000 } = {},
): Promise<JobStatus> {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const s = await getJob(id);
    onUpdate(s);
    if (s.state === 'completed' || s.state === 'failed') return s;
    if (Date.now() - start > timeoutMs) throw new Error('Timed out waiting for the job.');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export { API_BASE };
