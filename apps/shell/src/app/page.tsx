import type { Metadata } from 'next';
import Link from 'next/link';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { TrendingComps } from '@/components/dashboard/trending-comps';
import { Hero } from '@/components/dashboard/hero';

function ChartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'TFT Dashboard — Track the Meta, Browse the Wiki, Build Teams',
  description:
    'Live Teamfight Tactics meta stats, champion wiki, and an interactive team builder for the current patch.',
};

const quickLinks = [
  {
    title: 'Meta Tracker',
    description: 'Tier lists, win rates, and comp rankings for the current patch.',
    href: '/meta',
    icon: <ChartIcon />,
    iconClass: 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold-text)]',
  },
  {
    title: 'Champion Wiki',
    description: 'Browse champions, traits, items, and augments with full details.',
    href: '/wiki',
    icon: <BookIcon />,
    iconClass: 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue-text)]',
  },
  {
    title: 'Team Builder',
    description: 'Plan your team composition with an interactive board builder.',
    href: '/builder',
    icon: <TargetIcon />,
    iconClass: 'bg-cost-4/10 text-cost-4',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Hero Section */}
      <Hero />

      {/* Quick Stats */}
      <section>
        <QuickStats />
      </section>

      {/* Trending Comps */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Trending Compositions
          </h2>
          <Link
            href="/meta"
            className="text-sm font-medium text-[var(--accent-gold)] transition-colors hover:text-[var(--accent-blue)]"
          >
            View All &rarr;
          </Link>
        </div>
        <TrendingComps />
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-[var(--foreground)]">
          Explore
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-all hover:border-[var(--accent-gold)]/40 hover:shadow-lg hover:shadow-[var(--accent-gold)]/5"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${link.iconClass}`}
              >
                {link.icon}
              </span>
              <h3 className="mt-3 text-lg font-bold text-[var(--foreground)]">
                {link.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
