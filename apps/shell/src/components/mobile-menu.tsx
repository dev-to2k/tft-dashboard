'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navLinks, isActivePath } from './nav-links';
import { PatchBadge } from './patch-badge';
import { useDictionary } from '@/i18n/use-dictionary';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { dict } = useDictionary();
  const panelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => isActivePath(pathname ?? '', href);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (!open) return;
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
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

      {/* Keep mounted for enter/exit transitions; inert + pointer-events gate interaction when closed. */}
      <div inert={!open} className={open ? undefined : 'invisible'}>
        <button
          type="button"
          aria-label={dict.nav.closeMenu}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={`fixed inset-0 z-40 cursor-default bg-black/60 transition-opacity duration-150 ease-out motion-reduce:transition-none md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={dict.nav.menu}
          aria-hidden={!open}
          className={`absolute right-0 top-11 z-50 w-60 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3 shadow-2xl transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none md:hidden ${open ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-3 opacity-0'}`}
        >
          <nav aria-label={dict.nav.menu} className="flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                style={{ transitionDelay: open ? `${i * 25}ms` : '0ms' }}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-[transform,opacity,background-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] motion-reduce:transition-none ${
                  open ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
                } ${
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
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--foreground)]"
          >
            {dict.nav.closeMenu}
          </button>
        </div>
      </div>
    </div>
  );
}
