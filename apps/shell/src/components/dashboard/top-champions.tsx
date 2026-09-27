'use client';

import Link from 'next/link';
import { useMetaStats } from '@tft/api';
import { TierBadge, costTextClass } from '@tft/ui';
import { ChampionAvatar } from '../champion-avatar';
import { Reveal } from '../reveal';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';

const MAX_CHAMPIONS = 10;

export function TopChampions() {
  const { champions, isLoading, isError, refetch } = useMetaStats();
  const { dict } = useDictionary();
  const mounted = useMounted();
  const showLoading = !mounted || isLoading;

  if (showLoading) {
    return (
      <div className="flex gap-3 overflow-hidden px-1 py-2">
        {Array.from({ length: MAX_CHAMPIONS }).map((_, index) => (
          <div
            key={index}
            className="w-36 shrink-0 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4"
          >
            <div className="mx-auto h-14 w-14 rounded-full bg-[var(--background)]" />
            <div className="mx-auto mt-2 h-4 w-20 rounded bg-[var(--background)]" />
            <div className="mx-auto mt-2 h-3 w-12 rounded bg-[var(--background)]" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
        <p className="text-sm text-muted-foreground">{dict.stats.loadError}</p>
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

  const top = champions.slice(0, MAX_CHAMPIONS);
  if (top.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
        <p className="text-sm text-muted-foreground">{dict.meta.empty}</p>
      </div>
    );
  }

  return (
    <div className="champ-carousel -mx-1 flex snap-x snap-proximity gap-3 overflow-x-auto scroll-px-1 px-1 py-2 [scrollbar-width:thin] [&>*:last-child]:mr-1">
      {top.map((champ, index) => (
        <Reveal
          key={champ.championId}
          delay={Math.min(index, 5) * 50}
          className="w-36 shrink-0 snap-start overflow-visible"
          style={{ contentVisibility: 'visible' }}
        >
          <Link
            href={`/wiki/champions?q=${encodeURIComponent(champ.name)}`}
            className="group block w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-center transition-[border-color,box-shadow,transform,opacity] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-gold)]/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              #{index + 1}
            </p>
            <ChampionAvatar
              name={champ.name}
              iconUrl={champ.iconUrl}
              cost={champ.cost}
              size="lg"
              className="mx-auto mb-2 mt-1 rounded-full shadow-md"
            />
            <p className="truncate text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--accent-gold)]">
              {champ.name}
            </p>
            <p className={`mt-0.5 text-xs font-semibold ${costTextClass[champ.cost] ?? ''}`}>
              {champ.cost}-cost
            </p>
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <TierBadge tier={champ.tier} size="sm" />
              <span className="text-[11px] font-semibold tabular-nums text-[var(--accent-gold)]">
                {champ.winRate.toFixed(1)}%
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
