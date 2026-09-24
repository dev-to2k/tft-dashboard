import Link from 'next/link';
import { MobileMenu } from './mobile-menu';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/meta', label: 'Meta' },
  { href: '/wiki', label: 'Wiki' },
  { href: '/builder', label: 'Builder' },
];

export function Navigation() {
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--foreground)]/70 transition-colors hover:bg-[var(--background)] hover:text-[var(--accent-gold)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center">
            <p className="text-xs text-[var(--foreground)]/40">Current Patch</p>
            <p className="text-sm font-bold text-[var(--accent-gold)]">15.8</p>
          </div>
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
        <MobileMenu />
      </header>
    </>
  );
}
