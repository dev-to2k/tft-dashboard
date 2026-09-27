'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileMenu } from './mobile-menu';
import { ThemeToggle } from './theme-toggle';
import { LocaleToggle } from './locale-toggle';
import { navLinks, isActivePath } from './nav-links';
import { PatchBadge } from './patch-badge';
import { useDictionary } from '@/i18n/use-dictionary';

export function Navigation() {
  const pathname = usePathname();
  const { dict } = useDictionary();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card-bg)]/95 backdrop-blur-sm">
      <div className="app-container flex h-16 items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
          <span
            aria-hidden="true"
            className="hex-clip flex h-9 w-9 items-center justify-center bg-gradient-to-br from-[var(--accent-gold)] via-[#e3c478] to-[#a855f7] text-sm font-black text-[#18181b] shadow-[0_0_14px_var(--accent-gold)/35]"
          >
            T
          </span>
          <span className="text-xl font-black tracking-tight text-[var(--foreground)]">
            TFT
            <span className="bg-gradient-to-r from-[var(--accent-gold)] to-[#a855f7] bg-clip-text text-transparent">
              Dash
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label={dict.nav.menu} className="ml-4 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActivePath(pathname ?? '', link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-[color,background-color,box-shadow,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  active
                    ? 'bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] shadow-[0_0_16px_var(--accent-gold)/25,inset_0_0_0_1px_var(--accent-gold)/30]'
                    : 'text-muted-foreground hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                }`}
              >
                {dict.nav[link.key]}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 sm:flex">
            <span className="text-xs text-muted-foreground">{dict.nav.currentPatch}</span>
            <PatchBadge />
          </div>
          <LocaleToggle />
          <ThemeToggle />
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
