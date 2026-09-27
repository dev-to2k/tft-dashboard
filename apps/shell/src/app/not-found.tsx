import Link from 'next/link';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/meta', label: 'Meta' },
  { href: '/wiki', label: 'Wiki' },
  { href: '/builder', label: 'Builder' },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
      <p className="text-5xl font-black text-[var(--accent-gold)]">404</p>
      <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
        Page not found
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This page doesn&rsquo;t exist or was moved. Pick a section to continue.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)]/40 hover:text-[var(--accent-gold)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
