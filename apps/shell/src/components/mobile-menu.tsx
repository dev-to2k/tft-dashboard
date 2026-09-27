'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navLinks, isActivePath } from './nav-links';
import { PatchBadge } from './patch-badge';
import { useDictionary } from '@/i18n/use-dictionary';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { dict } = useDictionary();

  const isActive = (href: string) => isActivePath(pathname, href);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open ]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[var(--background)] hover:text-[var(--accent-gold)]"
        aria-label={dict.nav.openMenu}
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={dict.nav.closeMenu}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-sm md:hidden"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.menu}
            className="absolute right-0 top-11 z-50 w-60 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3 shadow-2xl md:hidden"
          >
            <nav aria-label={dict.nav.menu} className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                    isActive(link.href)
                      ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                      : 'text-muted-foreground hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {dict.nav[link.key]}
                </Link>
              ))}
            </nav>

            <div className="mt-2 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2">
              <p className="text-xs text-muted-foreground">{dict.nav.patch}</p>
              <PatchBadge />
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--foreground)]"
            >
              {dict.nav.closeMenu}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
