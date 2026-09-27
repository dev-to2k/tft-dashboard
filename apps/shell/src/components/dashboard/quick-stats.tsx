'use client';

import { useMetaStats } from '@tft/api';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';

export function QuickStats() {
  const { comps, champions, overview, isLoading, isError, refetch } = useMetaStats();
  const { dict, numberLocale } = useDictionary();
  const showLoading = !useMounted() || isLoading;

  if (showLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-4 w-24 rounded bg-[var(--foreground)]/10" />
            <div className="mt-2 h-7 w-20 rounded bg-[var(--foreground)]/10" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
        <p className="text-sm text-muted-foreground">
          {dict.stats.loadError}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-[var(--accent-gold)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--accent-gold)] transition-colors hover:bg-[var(--accent-gold)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {dict.common.retry}
        </button>
      </div>
    );
  }

  const topComp = comps[0];
  const bestChampion = champions[0];

  const stats = [
    {
      label: dict.stats.currentPatch,
      value: overview?.patchId ?? '—',
      subtext: overview?.setName ?? dict.stats.setUnavailable,
      color: 'var(--accent-gold)',
    },
    {
      label: dict.stats.gamesAnalysed,
      value: overview ? overview.totalGames.toLocaleString(numberLocale) : '—',
      subtext: overview ? dict.stats.compsTracked(overview.trackedComps) : dict.common.noData,
      color: 'var(--tier-b)',
    },
    {
      label: dict.stats.topComp,
      value: topComp?.name ?? '—',
      subtext: topComp ? dict.stats.winRate(topComp.winRate.toFixed(1)) : dict.common.noData,
      color: 'var(--accent-blue)',
    },
    {
      label: dict.stats.bestChampion,
      value: bestChampion?.name ?? '—',
      subtext: bestChampion
        ? `${bestChampion.cost}-cost | ${bestChampion.traits[0] ?? '—'}`
        : dict.common.noData,
      color: 'var(--cost-4)',
    },
  ];

  // Stat band (no boxes): dividers separate the four figures.
  return (
    <dl className="grid grid-cols-2 gap-y-6 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={index > 0 ? 'lg:border-l lg:border-[var(--border)] lg:pl-6' : ''}
        >
          <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {stat.label}
          </dt>
          <dd
            className="mt-1 text-3xl font-black tracking-tight"
            style={{ color: stat.color }}
          >
            {stat.value}
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground">
            {stat.subtext}
          </dd>
        </div>
      ))}
    </dl>
  );
}
