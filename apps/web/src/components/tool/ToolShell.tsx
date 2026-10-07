import Link from 'next/link';
import type { ToolDef } from '@alldocs/config/tools';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { Icon } from '@/components/Icon';

/** Consistent frame for every tool page: breadcrumb, title, badge, workspace. */
export function ToolShell({ tool, children }: { tool: ToolDef; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-text-secondary">{tool.name}</span>
      </nav>

      <header className="text-center">
        <span className="icon-chip mx-auto !h-14 !w-14">
          <Icon name={tool.icon} size={26} />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-headline sm:text-4xl">{tool.name}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-text-secondary">{tool.description}</p>
        <div className="mt-5 flex justify-center">
          <PrivacyBadge processing={tool.processing} />
        </div>
      </header>

      <div className="mt-10">{children}</div>
    </div>
  );
}
