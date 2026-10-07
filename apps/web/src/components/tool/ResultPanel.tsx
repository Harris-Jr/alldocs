'use client';

import { Icon } from '@/components/Icon';
import { humanFileSize } from '@alldocs/pdf-core';

export function ResultPanel({
  filename,
  size,
  onDownload,
  onReset,
  extra,
}: {
  filename: string;
  size: number;
  onDownload: () => void;
  onReset: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="card-surface p-8 text-center" role="status" aria-live="polite">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
        <Icon name="check" size={28} />
      </span>
      <h2 className="mt-4 text-xl font-bold">Your file is ready</h2>
      <p className="mt-1 text-sm text-text-secondary">
        {filename} · {humanFileSize(size)}
      </p>
      {extra}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button className="btn-cta" onClick={onDownload} data-testid="download-result">
          <Icon name="download" size={18} />
          Download
        </button>
        <button className="btn-secondary" onClick={onReset}>
          Start over
        </button>
      </div>
    </div>
  );
}
