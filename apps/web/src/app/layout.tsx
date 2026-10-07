import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { AuthProvider } from '@/lib/auth';

/**
 * Font loading note (Studio theme):
 * Display uses Archivo, body uses Inter. In production, prefer `next/font/google`
 * or self-hosted woff2 via `next/font/local` for zero layout shift. This build
 * environment blocks the Google Fonts CDN, so the families + system fallbacks are
 * declared in CSS (globals.css `--font-display` / `--font-body`). Those two CSS
 * variables are the only integration points to swap to next/font. See README.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alldocs.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AllDocs — Every document tool, in your browser. Private by default.',
    template: '%s — AllDocs',
  },
  description:
    'Merge, split, compress, convert, rotate and watermark PDFs for free. Lightweight tools run entirely in your browser — your files never leave your device.',
  keywords: [
    'pdf tools',
    'merge pdf',
    'split pdf',
    'compress pdf',
    'pdf to jpg',
    'privacy pdf editor',
    'online pdf tools free',
  ],
  openGraph: {
    type: 'website',
    siteName: 'AllDocs',
    title: 'AllDocs — Every document tool, in your browser.',
    description:
      'Fast, private, free PDF tools. Lightweight tasks run locally — your files never leave your device.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AllDocs — Private PDF tools in your browser',
    description: 'Merge, split, compress and convert PDFs. Lightweight tools run locally.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen font-body antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-accent focus:px-4 focus:py-2 focus:text-text-primary"
        >
          Skip to content
        </a>
        <AuthProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
