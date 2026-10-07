'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LOCAL_TOOLS, SERVER_TOOLS } from '@alldocs/config/tools';
import { Icon } from './Icon';

const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL ?? 'https://github.com/alldocs/alldocs';

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-page/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="AllDocs home">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-text-primary">
            <Icon name="layers" size={18} />
          </span>
          <span className="text-lg font-extrabold tracking-headline">AllDocs</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          <div className="group relative">
            <button
              className="rounded-pill px-3 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
              aria-haspopup="true"
            >
              All tools
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="card-surface grid grid-cols-2 gap-1 p-3">
                {[...LOCAL_TOOLS, ...SERVER_TOOLS].map((t) => (
                  <Link
                    key={t.slug}
                    href={`/${t.slug}`}
                    className="flex items-start gap-3 rounded-md p-2.5 hover:bg-elevated"
                  >
                    <span className="icon-chip !h-9 !w-9 shrink-0">
                      <Icon name={t.icon} size={16} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="block text-xs text-text-muted">{t.tagline}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link
            href="/transparency"
            className="rounded-pill px-3 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            Privacy
          </Link>
          <Link
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-pill px-3 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            GitHub
          </Link>
          <Link
            href="/login"
            className="ml-2 rounded-pill px-3 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            Log in
          </Link>
          <Link href="/#tools" className="btn-cta ml-1 !px-5 !py-2.5 text-sm">
            Get started
          </Link>
        </nav>

        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <Icon name={open ? 'x' : 'grip'} size={22} aria-hidden={false} />
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <div className="grid grid-cols-1 gap-1">
            {[...LOCAL_TOOLS, ...SERVER_TOOLS].map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                className="flex items-center gap-3 rounded-md p-2.5 hover:bg-elevated"
                onClick={() => setOpen(false)}
              >
                <span className="icon-chip !h-8 !w-8">
                  <Icon name={t.icon} size={15} />
                </span>
                <span className="text-sm font-semibold">{t.name}</span>
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link href="/login" className="btn-secondary flex-1 !py-2.5 text-sm">
                Log in
              </Link>
              <Link
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta flex-1 !py-2.5 text-sm"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
