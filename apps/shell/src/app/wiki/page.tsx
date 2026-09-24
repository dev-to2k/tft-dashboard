import Link from 'next/link';

const categories = [
  {
    title: 'Champions',
    description: 'Browse all champions with stats, abilities, and recommended items.',
    href: '/wiki/champions',
    count: 58,
    color: 'var(--accent-gold)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Traits',
    description: 'Explore all traits, their thresholds, and synergy effects.',
    href: '/wiki/traits',
    count: 32,
    color: 'var(--accent-blue)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: 'Items',
    description: 'Item combinations, component stats, and best-in-slot recommendations.',
    href: '/wiki/items',
    count: 45,
    color: 'var(--cost-4)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    title: 'Augments',
    description: 'All augments categorized by tier with detailed effect descriptions.',
    href: '/wiki/augments',
    count: 120,
    color: 'var(--tier-s)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

export default function WikiHubPage() {
  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search champions, traits, items..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 pl-11 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 outline-none focus:border-[var(--accent-gold)] transition-colors"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="group rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-all hover:border-[var(--accent-gold)]/40 hover:shadow-lg hover:shadow-[var(--accent-gold)]/5"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors group-hover:bg-[var(--background)]"
                style={{ color: cat.color }}
              >
                {cat.icon}
              </div>
              <span className="rounded-full bg-[var(--background)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]/40">
                {cat.count} entries
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">
              {cat.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/50">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
