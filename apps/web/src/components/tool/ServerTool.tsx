'use client';

import { useState } from 'react';
import { humanFileSize } from '@alldocs/pdf-core';
import { Dropzone } from './Dropzone';
import { Icon } from '@/components/Icon';
import {
  createJob,
  pollJob,
  requestUpload,
  uploadToStorage,
  API_BASE,
  type JobStatus,
} from '@/lib/apiClient';
import { fileToLoaded, validatePdf, validateImage, type LoadedFile } from '@/lib/browser';

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export interface ServerToolConfig {
  tool: string;
  accept: string;
  multiple?: boolean;
  kind: 'pdf' | 'image';
  /** optional options UI; returns the options object sent to the job */
  renderOptions?: (
    options: Record<string, unknown>,
    setOptions: (o: Record<string, unknown>) => void,
  ) => React.ReactNode;
  defaultOptions?: Record<string, unknown>;
}

export function ServerTool({ config }: { config: ServerToolConfig }) {
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Record<string, unknown>>(config.defaultOptions ?? {});

  async function onFiles(incoming: File[]) {
    setError(null);
    const out: LoadedFile[] = [];
    for (const f of incoming) {
      const err =
        config.kind === 'pdf' ? await validatePdf(f) : await validateImage(f);
      if (err) {
        setError(err);
        continue;
      }
      out.push(await fileToLoaded(f));
    }
    setFiles(config.multiple ? (prev) => [...prev, ...out] : out.slice(0, 1));
  }

  async function run() {
    if (files.length === 0) return;
    setError(null);
    try {
      setPhase('uploading');
      // For multi-file tools (jpg-to-pdf) we upload each and pass keys.
      const keys: string[] = [];
      for (const f of files) {
        const contentType = config.kind === 'pdf' ? 'application/pdf' : guessImageType(f.name);
        const sign = await requestUpload({
          tool: config.tool,
          filename: f.name,
          contentType,
          size: f.size,
        });
        await uploadToStorage(sign.uploadUrl, f.bytes, contentType);
        keys.push(sign.key);
      }

      setPhase('processing');
      const { id } = await createJob({
        tool: config.tool,
        key: keys[0]!,
        options: { ...options, keys },
      });
      const final = await pollJob(id, setStatus);
      if (final.state === 'failed') {
        setPhase('error');
        setError(final.error ?? 'Processing failed.');
      } else {
        setStatus(final);
        setPhase('done');
      }
    } catch (e) {
      setPhase('error');
      setError(
        e instanceof Error
          ? `${e.message} — is the API running? (${API_BASE})`
          : 'Something went wrong.',
      );
    }
  }

  function reset() {
    setFiles([]);
    setPhase('idle');
    setStatus(null);
    setError(null);
  }

  if (phase === 'done' && status?.downloadUrl) {
    return (
      <div className="card-surface p-8 text-center" role="status" aria-live="polite">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <Icon name="check" size={28} />
        </span>
        <h2 className="mt-4 text-xl font-bold">Your file is ready</h2>
        <p className="mt-1 text-sm text-text-secondary">{status.outputName}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          <Icon name="shield-check" size={13} />
          Auto-deletes within the hour
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a className="btn-cta" href={status.downloadUrl} data-testid="download-result">
            <Icon name="download" size={18} />
            Download
          </a>
          <button className="btn-secondary" onClick={reset}>
            Start over
          </button>
        </div>
      </div>
    );
  }

  const busy = phase === 'uploading' || phase === 'processing';

  return (
    <div className="space-y-5">
      <Dropzone accept={config.accept} multiple={config.multiple} onFiles={onFiles} />

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="card-surface space-y-4 p-6">
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-md border border-border bg-page/50 px-3 py-2.5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-text-primary">
                  <Icon name={config.kind === 'pdf' ? 'file-text' : 'image'} size={16} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.name}</span>
                <span className="text-xs text-text-muted">{humanFileSize(f.size)}</span>
              </li>
            ))}
          </ul>

          {config.renderOptions?.(options, setOptions)}

          {busy && (
            <div className="rounded-md bg-elevated px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="h-2 w-2 animate-ping rounded-full bg-accent" />
                {phase === 'uploading' ? 'Encrypting & uploading…' : 'Processing on our workers…'}
                {status?.progress != null && ` ${status.progress}%`}
              </p>
            </div>
          )}

          <button className="btn-cta w-full" disabled={busy} onClick={run} data-testid="server-run">
            {busy ? 'Working…' : 'Process file'}
          </button>
        </div>
      )}
    </div>
  );
}

function guessImageType(name: string): string {
  return /\.png$/i.test(name) ? 'image/png' : 'image/jpeg';
}
