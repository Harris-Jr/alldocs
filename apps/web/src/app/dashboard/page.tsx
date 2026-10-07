'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getToken } from '@/lib/auth';
import { API_BASE } from '@/lib/apiClient';
import { getTool } from '@alldocs/config/tools';
import { Icon } from '@/components/Icon';

interface JobRow {
  id: string;
  tool: string;
  state: string;
  outputName?: string;
  createdAt: number;
  expiresAt: number;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const token = getToken();
    fetch(`${API_BASE}/jobs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoadingJobs(false));
  }, [user]);

  if (loading || !user) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-text-muted">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-headline">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-pill border border-border-card bg-surface px-3 py-1.5 text-sm font-semibold text-text-secondary">
            Signed in
          </span>
          <button className="btn-secondary !py-2 text-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-elevated/50 p-4 text-sm text-text-secondary">
        <p className="flex items-center gap-2">
          <Icon name="shield-check" size={16} className="text-success" />
          We store job <strong>metadata</strong> only — never your files. Entries and their
          download links expire automatically.
        </p>
      </div>

      <h2 className="mt-10 text-lg font-bold">Recent jobs</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
        {loadingJobs ? (
          <p className="p-6 text-sm text-text-muted">Loading your history…</p>
        ) : jobs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-text-secondary">No server-processed jobs yet.</p>
            <p className="mt-1 text-xs text-text-muted">
              Client-side tools (merge, split, rotate…) never create a job — they run entirely in
              your browser.
            </p>
            <Link href="/compress-pdf" className="btn-cta mt-5 inline-flex !py-2.5 text-sm">
              Try Compress PDF
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-page/60 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Tool</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Link expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((j) => {
                const tool = getTool(j.tool);
                return (
                  <tr key={j.id}>
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <Icon name={tool?.icon ?? 'file-text'} size={16} className="text-accent" />
                        {tool?.name ?? j.tool}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge state={j.state} />
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{timeAgo(j.createdAt)}</td>
                    <td className="px-4 py-3 text-text-muted">{expiryLabel(j.expiresAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ state }: { state: string }) {
  const map: Record<string, string> = {
    completed: 'bg-success/15 text-success',
    failed: 'bg-danger/15 text-danger',
    active: 'bg-accent/15 text-accent',
    queued: 'bg-warning/15 text-warning',
  };
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-0.5 text-xs font-semibold capitalize ${
        map[state] ?? 'bg-elevated text-text-secondary'
      }`}
    >
      {state}
    </span>
  );
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function expiryLabel(ts: number): string {
  const s = Math.floor((ts - Date.now()) / 1000);
  if (s <= 0) return 'expired';
  if (s < 3600) return `in ${Math.floor(s / 60)}m`;
  return `in ${Math.floor(s / 3600)}h`;
}
