import Link from 'next/link';
import { Icon } from '@/components/Icon';

const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL ?? 'https://github.com/alldocs/alldocs';

export function OpenSource() {
  return (
    <section id="open-source" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="relative overflow-hidden rounded-lg bg-surface p-10 shadow-card sm:p-14">
        {/* oversized decorative shapes */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-shape-yellow/70"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-shape-orange/40"
        />

        <div className="relative max-w-2xl">
          <span className="eyebrow">Open source</span>
          <h2 className="mt-3 text-3xl font-extrabold uppercase tracking-headline sm:text-4xl">
            Free, and free to inspect<span className="accent-dot">.</span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            AllDocs is fully open source. Every tool is free with no signup, no page limits and no
            watermarks — and because the code is public, the privacy claims aren&apos;t something
            you have to take on faith. Read it, run it yourself, or contribute.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href={REPO_URL} className="btn-cta" target="_blank" rel="noopener noreferrer">
              <Icon name="layers" size={18} />
              View on GitHub
            </Link>
            <Link href="/transparency" className="btn-link">
              How we handle your files
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Self-host it', 'Run the whole stack with one docker compose up.'],
              ['Audit it', 'The client-side tools provably never upload — see for yourself.'],
              ['Extend it', 'Add tools, languages or integrations. PRs welcome.'],
            ].map(([title, body]) => (
              <li key={title} className="rounded-md border border-border-card bg-page p-4">
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-sm text-text-secondary">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
