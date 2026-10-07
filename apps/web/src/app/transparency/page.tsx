import type { Metadata } from 'next';
import { TOOLS } from '@alldocs/config/tools';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Privacy & transparency',
  description:
    'Exactly how AllDocs handles your files, tool by tool. Local tools never upload; server tools encrypt, process, and auto-delete within the hour.',
  alternates: { canonical: '/transparency' },
};

export default function TransparencyPage() {
  const local = TOOLS.filter((t) => t.processing === 'local');
  const server = TOOLS.filter((t) => t.processing === 'server');

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="text-center">
        <span className="eyebrow">Transparency</span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-headline">
          Exactly what happens to your files
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
          No vague promises. Here is the real data flow for every tool, and the principles we hold
          ourselves to.
        </p>
      </header>

      {/* Principles */}
      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: 'lock',
            title: 'Local when possible',
            body: 'If a task can run in your browser, it does. The file never touches a server.',
          },
          {
            icon: 'shield-check',
            title: 'Zero retention',
            body: 'Server-processed files are deleted within the hour by storage lifecycle rules.',
          },
          {
            icon: 'zap',
            title: 'No trackers',
            body: 'No third-party trackers on tool pages. Analytics are self-hosted and aggregate.',
          },
        ].map((p) => (
          <div key={p.title} className="rounded-lg border border-border bg-surface p-5">
            <span className="icon-chip">
              <Icon name={p.icon} size={18} />
            </span>
            <h2 className="mt-3 text-base font-bold">{p.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{p.body}</p>
          </div>
        ))}
      </section>

      {/* Local tools */}
      <section className="mt-14">
        <div className="flex items-center gap-2">
          <Icon name="lock" size={18} className="text-success" />
          <h2 className="text-xl font-extrabold tracking-headline">
            Processed locally — never uploaded
          </h2>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          These tools use WebAssembly in your browser. Your file is read into memory on your
          device, processed, and handed straight back to you.
        </p>
        <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-page/60 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Tool</th>
                <th className="px-4 py-3 font-semibold">Leaves your device?</th>
                <th className="px-4 py-3 font-semibold">Data flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {local.map((t) => (
                <tr key={t.slug}>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                      <Icon name="lock" size={11} /> No
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    Browser memory → processed in-page → download. No network request.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Server tools */}
      <section className="mt-14">
        <div className="flex items-center gap-2">
          <Icon name="shield-check" size={18} className="text-accent" />
          <h2 className="text-xl font-extrabold tracking-headline">
            Processed on our workers — deleted within the hour
          </h2>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          These tasks need more compute than a browser can give. Your file travels over an
          encrypted (TLS 1.3) connection to short-lived storage, is processed, and is purged
          automatically.
        </p>
        <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-page/60 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Tool</th>
                <th className="px-4 py-3 font-semibold">Leaves your device?</th>
                <th className="px-4 py-3 font-semibold">Data flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {server.map((t) => (
                <tr key={t.slug}>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                      <Icon name="shield-check" size={11} /> Encrypted
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    Signed upload → worker processes → download link (1h) → auto-purged.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The details */}
      <section className="mt-14 rounded-lg border border-border bg-surface p-7">
        <h2 className="text-lg font-bold">The technical details</h2>
        <dl className="mt-4 space-y-4 text-sm">
          {[
            ['Encryption in transit', 'All traffic uses TLS 1.3. HSTS is enabled.'],
            [
              'Upload security',
              'Server tools use short-lived signed upload URLs (15 min). Files are validated by magic bytes, not file extension.',
            ],
            [
              'Storage & deletion',
              'Uploaded and generated files live in object storage with a lifecycle rule that purges them within the hour. We keep no file database.',
            ],
            [
              'Job metadata',
              'We store only job metadata (tool, status, timestamps) in an in-memory store with a short TTL. It expires on its own.',
            ],
            [
              'URL imports',
              'When you import from a URL, requests are SSRF-protected: only http/https, with private and link-local address ranges blocked and a size cap enforced.',
            ],
            ['Analytics', 'Self-hosted and aggregate. No third-party trackers on tool pages.'],
          ].map(([term, def]) => (
            <div key={term} className="grid gap-1 sm:grid-cols-3 sm:gap-4">
              <dt className="font-semibold">{term}</dt>
              <dd className="text-text-secondary sm:col-span-2">{def}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
