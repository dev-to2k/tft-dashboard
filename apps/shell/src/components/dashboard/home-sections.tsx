'use client';

import Link from 'next/link';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { TrendingComps } from '@/components/dashboard/trending-comps';
import { TopChampions } from '@/components/dashboard/top-champions';
import { BuilderCta } from '@/components/dashboard/builder-cta';
import { HeroShowcase } from '@/components/dashboard/hero-showcase';
import { useDictionary } from '@/i18n/use-dictionary';

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

const icons = [ChartIcon, BookIcon, TargetIcon];
const iconClasses = [
  'bg-[var(--accent-gold)]/10 text-[var(--accent-gold-text)]',
  'bg-[var(--accent-blue)]/10 text-[var(--accent-blue-text)]',
  'bg-cost-4/10 text-cost-4',
];

export function HomeSections() {
  const { dict } = useDictionary();

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-10">
      {/* Live meta spotlight */}
      <HeroShowcase />

      {/* Quick Stats */}
      <section aria-label={dict.stats.gamesAnalysed}>
        <QuickStats />
      </section>

      {/* Trending Comps */}
      <section aria-labelledby="trending-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="trending-heading" className="text-xl font-bold text-[var(--foreground)]">
            {dict.home.trending}
          </h2>
          <Link
            href="/meta"
            className="rounded text-sm font-medium text-[var(--accent-gold)] transition-colors hover:text-[var(--accent-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {dict.common.viewAll}
          </Link>
        </div>
        <TrendingComps />
      </section>

      {/* Top Champions */}
      <section aria-labelledby="top-champions-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="top-champions-heading" className="text-xl font-bold text-[var(--foreground)]">
            {dict.home.topChampions}
          </h2>
          <Link
            href="/meta/champions"
            className="rounded text-sm font-medium text-[var(--accent-gold)] transition-colors hover:text-[var(--accent-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {dict.common.viewAll}
          </Link>
        </div>
        <TopChampions />
      </section>

      {/* Builder CTA */}
      <BuilderCta />

      {/* Quick Links */}
      <section aria-labelledby="explore-heading">
        <h2 id="explore-heading" className="mb-4 text-xl font-bold text-[var(--foreground)]">
          {dict.home.explore}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {dict.home.quickLinks.map((link, index) => {
            const Icon = icons[index] ?? ChartIcon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--accent-gold)]/40 hover:shadow-lg hover:shadow-[var(--accent-gold)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClasses[index] ?? ''}`}
                >
                  <Icon />
                </span>
                <h3 className="mt-3 text-lg font-bold text-[var(--foreground)]">
                  {link.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
