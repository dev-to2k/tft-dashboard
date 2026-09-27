import type { Metadata } from 'next';
import Link from 'next/link';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { TrendingComps } from '@/components/dashboard/trending-comps';

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
    icon: '📊',
    color: 'var(--accent-gold)',
  },
  {
    title: 'Champion Wiki',
    description: 'Browse champions, traits, items, and augments with full details.',
    href: '/wiki',
    icon: '📖',
    color: 'var(--accent-blue)',
  },
  {
    title: 'Team Builder',
    description: 'Plan your team composition with an interactive board builder.',
    href: '/builder',
    icon: '🎯',
    color: 'var(--cost-4)',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card-bg)] to-[var(--background)] p-8 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--accent-gold)_0%,_transparent_50%)] opacity-[0.07]" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent-gold)]">
            Set 18 &mdash; Enchanted Wilds
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--foreground)] lg:text-5xl">
            TFT Dashboard
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--foreground)]/60">
            Your all-in-one Teamfight Tactics companion. Track the meta, explore
            champions and traits, and build winning compositions.
          </p>
        </div>
      </section>

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
              <span className="text-3xl">{link.icon}</span>
              <h3
                className="mt-3 text-lg font-bold"
                style={{ color: link.color }}
              >
                {link.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/50">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
