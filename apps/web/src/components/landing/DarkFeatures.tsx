import { Icon } from '@/components/Icon';

const CARDS = [
  {
    tag: 'Privacy',
    icon: 'lock',
    title: 'Your files stay yours',
    body: 'Merge, split, rotate, watermark and page-number all run in your browser with WebAssembly. The bytes never travel to a server — there is nothing for us to see, store, or leak.',
  },
  {
    tag: 'Speed',
    icon: 'zap',
    title: 'Instant, not eventually',
    body: 'Local tools return results in under two seconds for typical files. No upload queue, no round-trip — the work happens where your file already is.',
  },
  {
    tag: 'Zero retention',
    icon: 'shield-check',
    title: 'Deleted by design',
    body: 'When a job does need a server — compression, image conversion — your file is encrypted in transit and auto-purged within the hour. We keep job metadata only, and even that expires.',
  },
];

export function DarkFeatures() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* oversized decorative shape, clipped by the section edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-shape-yellow/60"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Why AllDocs</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-headline sm:text-4xl">
            Privacy isn&apos;t a setting<span className="accent-dot">.</span> It&apos;s the
            architecture.
          </h2>
          <p className="mt-4 text-text-secondary">
            Most &quot;free online PDF tools&quot; quietly upload your documents to servers you
            can&apos;t see. We built AllDocs the other way around.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {CARDS.map((c) => (
            <article
              key={c.tag}
              className="relative rounded-lg border border-border-card bg-surface p-7 shadow-card"
            >
              <div className="flex items-start justify-between">
                <span className="icon-chip icon-chip-yellow">
                  <Icon name={c.icon} size={22} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-eyebrow text-text-muted">
                  {c.tag}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-headline">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
