'use client';

import { useMetaStats } from '@tft/api';

export function QuickStats() {
  const { comps, champions, overview, isLoading, isError, refetch } = useMetaStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5"
          >
            <div className="h-4 w-24 rounded bg-[var(--background)]" />
            <div className="mt-2 h-7 w-20 rounded bg-[var(--background)]" />
            <div className="mt-2 h-3 w-28 rounded bg-[var(--background)]" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
        <p className="text-sm text-muted-foreground">
          Could not load stats.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-[var(--accent-gold)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--accent-gold)] transition-colors hover:bg-[var(--accent-gold)]/25"
        >
          Retry
        </button>
      </div>
    );
  }

  const topComp = comps[0];
  const bestChampion = champions[0];

  const stats = [
    {
      label: 'Current Patch',
      value: overview?.patchId ?? '—',
      subtext: overview?.setName ?? 'Set data unavailable',
      color: 'var(--accent-gold)',
    },
    {
      label: 'Games Analysed',
      value: overview ? overview.totalGames.toLocaleString('en-US') : '—',
      subtext: overview ? `${overview.trackedComps} comps tracked` : 'No data',
      color: 'var(--tier-b)',
    },
    {
      label: 'Top Comp',
      value: topComp?.name ?? '—',
      subtext: topComp ? `${topComp.winRate.toFixed(1)}% win rate` : 'No data',
      color: 'var(--accent-blue)',
    },
    {
      label: 'Best Champion',
      value: bestChampion?.name ?? '—',
      subtext: bestChampion
        ? `${bestChampion.cost}-cost | ${bestChampion.traits[0] ?? '—'}`
        : 'No data',
      color: 'var(--cost-4)',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 transition-all hover:border-[var(--accent-gold)]/40"
        >
          <p className="text-sm font-medium text-muted-foreground">
            {stat.label}
          </p>
          <p
            className="mt-1 text-2xl font-bold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stat.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}

