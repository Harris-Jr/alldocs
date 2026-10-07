'use client';

import { useState } from 'react';
import { splitPdf, zipResults, type SplitMode } from '@alldocs/pdf-core';
import { SinglePdfLoader } from './SinglePdfLoader';
import { downloadBytes, type LoadedFile } from '@/lib/browser';
import { Icon } from '@/components/Icon';

type Mode = 'ranges' | 'everyN' | 'extract';

export function SplitTool() {
  return (
    <SinglePdfLoader hint="Add a PDF to split">
      {(file, reset) => <SplitInner file={file} reset={reset} />}
    </SinglePdfLoader>
  );
}

function SplitInner({ file, reset }: { file: LoadedFile; reset: () => void }) {
  const [mode, setMode] = useState<Mode>('ranges');
  const [spec, setSpec] = useState('1-3');
  const [n, setN] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ count: number } | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const m: SplitMode =
        mode === 'everyN' ? { kind: 'everyN', n } : { kind: mode, spec };
      const results = await splitPdf({ name: file.name, bytes: file.bytes }, m);
      if (results.length === 1) {
        downloadBytes(results[0]!.bytes, results[0]!.name);
      } else {
        const zip = await zipResults(results);
        downloadBytes(zip, file.name.replace(/\.pdf$/i, '') + '-split.zip', 'application/zip');
      }
      setDone({ count: results.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Split failed.');
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: Mode; label: string }[] = [
    { id: 'ranges', label: 'Page range' },
    { id: 'everyN', label: 'Every N pages' },
    { id: 'extract', label: 'Extract pages' },
  ];

  return (
    <div className="card-surface p-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Split mode">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={mode === t.id}
            className="tab-pill"
            onClick={() => {
              setMode(t.id);
              setDone(null);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {mode === 'everyN' ? (
          <label className="block text-sm font-medium">
            Pages per file
            <input
              type="number"
              min={1}
              value={n}
              onChange={(e) => setN(Math.max(1, Number(e.target.value)))}
              className="mt-1 block w-32 rounded-md border border-border bg-page px-3 py-2 focus:border-accent focus:outline-none"
            />
          </label>
        ) : (
          <label className="block text-sm font-medium">
            {mode === 'ranges' ? 'Pages to keep (one new PDF)' : 'Pages to extract (one PDF each)'}
            <input
              type="text"
              value={spec}
              placeholder="e.g. 1-3,5,8"
              onChange={(e) => setSpec(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-page px-3 py-2 focus:border-accent focus:outline-none"
            />
            <span className="mt-1 block text-xs text-text-muted">
              Use ranges (1-3) and single pages (5), separated by commas.
            </span>
          </label>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      {done && (
        <p className="mt-4 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          <Icon name="check" size={16} />
          Downloaded {done.count === 1 ? 'your split PDF' : `${done.count} files as a zip`}.
        </p>
      )}

      <button className="btn-cta mt-6 w-full" disabled={busy} onClick={run} data-testid="split-run">
        {busy ? 'Splitting…' : 'Split PDF'}
      </button>
    </div>
  );
}
