'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileMenu } from './mobile-menu';
import { ThemeToggle } from './theme-toggle';
import { navLinks, isActivePath } from './nav-links';
import { PatchBadge } from './patch-badge';

export function Navigation() {
  const pathname = usePathname();
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[var(--border)] bg-[var(--card-bg)] p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-gold)] text-sm font-black text-[var(--background)]">
            T
          </div>
          <span className="text-xl font-black tracking-tight text-[var(--foreground)]">
            TFT<span className="text-[var(--accent-gold)]">Dash</span>
          </span>
        </Link>

        <nav className="mt-10 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                    : 'text-muted-foreground hover:bg-[var(--background)] hover:text-[var(--accent-gold)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-end gap-2 pt-8">
          <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Current Patch</p>
            <PatchBadge />
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card-bg)]/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-gold)] text-xs font-black text-[var(--background)]">
            T
          </div>
          <span className="text-lg font-black tracking-tight text-[var(--foreground)]">
            TFT<span className="text-[var(--accent-gold)]">Dash</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <MobileMenu />
        </div>
      </header>
    </>
  );
}
