'use client';

import Link from 'next/link';
import { useMetaStats, useStaticData } from '@tft/api';
import { TierBadge } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';
import { WikiSearch } from '@/components/wiki-search';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';

const categoryMeta = [
  {
    key: 'champions' as const,
    href: '/wiki/champions',
    color: 'var(--accent-gold)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'traits' as const,
    href: '/wiki/traits',
    color: 'var(--accent-blue)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    key: 'items' as const,
    href: '/wiki/items',
    color: 'var(--cost-4)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    key: 'augments' as const,
    href: '/wiki/augments',
    color: 'var(--tier-s)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

function previewIcons(key: (typeof categoryMeta)[number]['key'], data: NonNullable<ReturnType<typeof useStaticData>['data']>) {
  switch (key) {
    case 'champions':
      return data.champions.slice(0, 5).map((c) => ({ name: c.name, iconUrl: c.iconUrl }));
    case 'traits':
      return data.traits.slice(0, 5).map((t) => ({ name: t.name, iconUrl: t.iconUrl }));
    case 'items':
      return data.items.slice(0, 5).map((i) => ({ name: i.name, iconUrl: i.iconUrl }));
    case 'augments':
      return data.augments.slice(0, 5).map((a) => ({ name: a.name, iconUrl: a.iconUrl }));
  }
}

export default function WikiHubPage() {
  const { data } = useStaticData();
  const { champions: metaChampions, isLoading: isMetaLoading } = useMetaStats();
  const { dict } = useDictionary();
  const mounted = useMounted();

  const counts =
    mounted && data
      ? {
          champions: data.champions.length,
          traits: data.traits.length,
          items: data.items.length,
          augments: data.augments.length,
        }
      : null;

  const collage = mounted && data ? data.champions.slice(0, 10) : [];
  const hotChampions = mounted && !isMetaLoading ? metaChampions.filter((c) => c.tier === 'S').slice(0, 4) : [];
  const showHot = mounted && !isMetaLoading && hotChampions.length > 0;

  return (
    <div className="space-y-8">
      {/* Live search */}
      <WikiSearch />

      {/* Hot in meta */}
      {mounted && (isMetaLoading || showHot) ? (
        <section aria-labelledby="wiki-hot-heading">
          <div className="mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="h-2 w-2 animate-gold-shimmer rounded-full bg-[var(--accent-gold)]" />
            <h2 id="wiki-hot-heading" className="text-lg font-bold text-[var(--foreground)]">
              {dict.wiki.inMeta}
            </h2>
          </div>
          {isMetaLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[76px] animate-pulse rounded-xl bg-[var(--foreground)]/10" />
              ))}
            </div>
          ) : (
            <div className="wiki-grid grid grid-cols-2 gap-3 lg:grid-cols-4">
              {hotChampions.map((champ) => (
                <Link
                  key={champ.championId}
                  href={`/wiki/champions?q=${encodeURIComponent(champ.name)}`}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[var(--accent-gold)]/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <ChampionAvatar
                    name={champ.name}
                    iconUrl={champ.iconUrl}
                    cost={champ.cost}
                    size="md"
                    className="rounded-lg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--accent-gold)]">
                      {champ.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-semibold text-[var(--accent-gold)]">
                      {champ.winRate.toFixed(1)}% WR
                    </span>
                  </span>
                  <TierBadge tier={champ.tier} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Category list */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
        {categoryMeta.map((cat, index) => {
          const text = dict.wiki.categories[index] ?? { title: cat.key, description: '', href: cat.href };
          const previews = mounted && data ? previewIcons(cat.key, data) : [];
          return (
            <Link
              key={cat.href}
              href={cat.href}
              className={`group flex items-center gap-4 p-4 transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--accent-gold)]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] motion-reduce:transition-none sm:p-5 ${index > 0 ? 'border-t border-[var(--border)]' : ''}`}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--background)] transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                style={{ color: cat.color }}
              >
                {cat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--accent-gold)]">
                    {text.title}
                  </h3>
                  <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {counts ? dict.wiki.entries(counts[cat.key]) : dict.wiki.entries(0).replace('0', '\u2026')}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground sm:whitespace-normal">
                  {text.description}
                </p>
                {previews.length > 0 ? (
                  <div className="mt-2 hidden flex-wrap gap-1 sm:flex" aria-hidden="true">
                    {previews.map((preview, previewIndex) => (
                      <ChampionAvatar
                        key={`${cat.key}-${previewIndex}`}
                        name={preview.name}
                        iconUrl={preview.iconUrl}
                        size="sm"
                        className="h-7 w-7 rounded-md text-[9px]"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <span
                aria-hidden="true"
                className="shrink-0 text-lg text-muted-foreground transition-[transform,opacity,color] duration-200 group-hover:translate-x-1 group-hover:text-[var(--accent-gold)]"
              >
                &rarr;
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
