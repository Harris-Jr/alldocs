'use client';

import { useState } from 'react';
import { humanFileSize } from '@alldocs/pdf-core';
import { Dropzone } from './Dropzone';
import { Icon } from '@/components/Icon';
import { fileToLoaded, validatePdf, type LoadedFile } from '@/lib/browser';

/**
 * Renders a dropzone until a single valid PDF is loaded, then renders
 * children with the loaded file + a change/remove control.
 */
export function SinglePdfLoader({
  children,
  hint,
}: {
  children: (file: LoadedFile, reset: () => void) => React.ReactNode;
  hint?: string;
}) {
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: File[]) {
    setError(null);
    const f = files[0];
    if (!f) return;
    const err = await validatePdf(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(await fileToLoaded(f));
  }

  if (!file) {
    return (
      <div className="space-y-4">
        <Dropzone accept="application/pdf,.pdf" onFiles={onFiles} hint={hint} />
        {error && (
          <p className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-text-primary">
          <Icon name="file-text" size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{file.name}</span>
          <span className="block text-xs text-text-muted">{humanFileSize(file.size)}</span>
        </span>
        <button
          className="rounded-md px-2 py-1 text-xs font-semibold text-accent hover:bg-elevated"
          onClick={() => setFile(null)}
        >
          Change
        </button>
      </div>
      {children(file, () => setFile(null))}
    </div>
  );
}
