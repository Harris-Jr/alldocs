'use client';

import { useState } from 'react';
import { addPageNumbers, type PageNumberPosition } from '@alldocs/pdf-core';
import { SinglePdfLoader } from './SinglePdfLoader';
import { ResultPanel } from './ResultPanel';
import { downloadBytes, type LoadedFile } from '@/lib/browser';

const POSITIONS: { id: PageNumberPosition; label: string }[] = [
  { id: 'top-left', label: 'Top left' },
  { id: 'top-center', label: 'Top center' },
  { id: 'top-right', label: 'Top right' },
  { id: 'bottom-left', label: 'Bottom left' },
  { id: 'bottom-center', label: 'Bottom center' },
  { id: 'bottom-right', label: 'Bottom right' },
];

export function PageNumbersTool() {
  return (
    <SinglePdfLoader hint="Add a PDF to number">
      {(file) => <PageNumbersInner file={file} />}
    </SinglePdfLoader>
  );
}

function PageNumbersInner({ file }: { file: LoadedFile }) {
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [format, setFormat] = useState('{n}');
  const [startAt, setStartAt] = useState(1);
  const [skip, setSkip] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const skipPages = skip
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0);
      const bytes = await addPageNumbers(
        { name: file.name, bytes: file.bytes },
        { position, format, startAt, skipPages },
      );
      setResult(bytes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Adding page numbers failed.');
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const out = file.name.replace(/\.pdf$/i, '') + '-numbered.pdf';
    return (
      <ResultPanel
        filename={out}
        size={result.length}
        onDownload={() => downloadBytes(result, out)}
        onReset={() => setResult(null)}
      />
    );
  }

  return (
    <div className="card-surface space-y-5 p-6">
      <fieldset>
        <legend className="text-sm font-medium">Position</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p.id}
              aria-pressed={position === p.id}
              onClick={() => setPosition(p.id)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                position === p.id
                  ? 'border-accent bg-accent text-text-primary'
                  : 'border-border bg-page hover:border-accent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm font-medium sm:col-span-1">
          Start at
          <input
            type="number"
            min={0}
            value={startAt}
            onChange={(e) => setStartAt(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-border bg-page px-3 py-2 focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          Format
          <input
            type="text"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            placeholder="{n} or Page {n} of {total}"
            className="mt-1 block w-full rounded-md border border-border bg-page px-3 py-2 focus:border-accent focus:outline-none"
          />
          <span className="mt-1 block text-xs text-text-muted">
            Use {'{n}'} for the number and {'{total}'} for the page count.
          </span>
        </label>
      </div>

      <label className="block text-sm font-medium">
        Skip pages (optional)
        <input
          type="text"
          value={skip}
          onChange={(e) => setSkip(e.target.value)}
          placeholder="e.g. 1,2"
          className="mt-1 block w-full rounded-md border border-border bg-page px-3 py-2 focus:border-accent focus:outline-none"
        />
      </label>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <button className="btn-cta w-full" disabled={busy} onClick={run} data-testid="pagenum-run">
        {busy ? 'Adding…' : 'Add page numbers'}
      </button>
    </div>
  );
}
