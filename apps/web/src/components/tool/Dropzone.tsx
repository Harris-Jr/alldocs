'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';

export function Dropzone({
  accept,
  multiple = false,
  onFiles,
  hint,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  hint?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-10 text-center transition ${
        dragging ? 'border-accent bg-elevated' : 'border-border bg-surface'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handle(e.target.files)}
      />
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-text-primary">
        <Icon name="upload" size={26} />
      </span>
      <p className="mt-4 text-lg font-semibold">Drag &amp; drop your file{multiple ? 's' : ''} here</p>
      <p className="mt-1 text-sm text-text-secondary">{hint ?? 'or choose from your device'}</p>
      <label htmlFor={id} className="btn-cta mt-5 inline-flex cursor-pointer">
        <Icon name="upload" size={18} />
        Select file{multiple ? 's' : ''}
      </label>
    </div>
  );
}
