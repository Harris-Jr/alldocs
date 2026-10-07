import Link from 'next/link';
import { TOOLS } from '@alldocs/config/tools';
import { Icon } from './Icon';

const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL ?? 'https://github.com/alldocs/alldocs';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-text-primary">
                <Icon name="layers" size={18} />
              </span>
              <span className="text-lg font-extrabold tracking-headline">AllDocs</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-text-secondary">
              Every document tool you need, in your browser. Private by default.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold">Tools</h3>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              {TOOLS.slice(0, 5).map((t) => (
                <li key={t.slug}>
                  <Link href={`/${t.slug}`} className="hover:text-accent">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold">More tools</h3>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              {TOOLS.slice(5).map((t) => (
                <li key={t.slug}>
                  <Link href={`/${t.slug}`} className="hover:text-accent">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold">Project</h3>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/transparency" className="hover:text-accent">
                  Privacy &amp; transparency
                </Link>
              </li>
              <li>
                <Link
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-accent">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-text-muted sm:flex-row">
          <p>© {year} AllDocs. Built privacy-first.</p>
          <p className="flex items-center gap-2">
            <Icon name="shield-check" size={16} className="text-success" />
            No third-party trackers on tool pages.
          </p>
        </div>
      </div>
    </footer>
  );
}
