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
      <div className="flex h-16 w-full items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-gold)] text-sm font-black text-[var(--gold-foreground)] shadow-sm shadow-[var(--accent-gold)]/30">
            T
          </div>
          <span className="text-xl font-black tracking-tight text-[var(--foreground)]">
            TFT<span className="text-[var(--accent-gold)]">Dash</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label={dict.nav.menu} className="ml-4 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  active
                    ? 'text-[var(--accent-gold)]'
                    : 'text-muted-foreground hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                }`}
              >
                {dict.nav[link.key]}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-[var(--accent-gold)] transition-all ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
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
