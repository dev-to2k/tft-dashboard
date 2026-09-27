'use client';

import { useMetaStats, useStaticData } from '@tft/api';
import { Button, TierBadge, tierVar, type Tier } from '@tft/ui';
import { ChampionAvatar } from '../champion-avatar';
import { CompSpotlight } from '../comp-spotlight';
import { TierChips } from '../tier-chips';
import { Reveal } from '../reveal';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';
import { useState } from 'react';
import type { CompMetaStats } from '@tft/types';

const MAX_TRAIT_CHIPS = 4;
const MAX_COMPS = 4;

export function TrendingComps() {
  const { comps, isLoading, isError, refetch } = useMetaStats();
  const { data: staticData } = useStaticData();
  const { dict } = useDictionary();
  const mounted = useMounted();
  const showLoading = !mounted || isLoading;
  const [tierFilter, setTierFilter] = useState<Tier | null>(null);
  const [spotlight, setSpotlight] = useState<CompMetaStats | null>(null);

  if (showLoading) {
    return (
      <div className="flex gap-4 overflow-hidden px-1 py-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="w-[300px] flex-none animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:w-[380px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 rounded bg-[var(--background)]" />
                <div className="h-4 w-56 rounded bg-[var(--background)]" />
              </div>
              <div className="h-10 w-10 rounded-lg bg-[var(--background)]" />
            </div>
            <div className="mt-4 flex gap-6">
              <div className="space-y-2">
                <div className="h-3 w-14 rounded bg-[var(--background)]" />
                <div className="h-4 w-10 rounded bg-[var(--background)]" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-[var(--background)]" />
                <div className="h-4 w-10 rounded bg-[var(--background)]" />
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((__, champIndex) => (
                <div
                  key={champIndex}
                  className="h-8 w-8 rounded-md bg-[var(--background)]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
        <p className="text-sm text-muted-foreground">
          {dict.comps.loadError}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
        >
          {dict.common.retry}
        </Button>
      </div>
    );
  }

  const visibleComps = tierFilter ? comps.filter((c) => c.tier === tierFilter) : comps;
  const topComps = visibleComps.slice(0, MAX_COMPS);

  if (topComps.length === 0) {
    return (
      <div className="space-y-3">
        <TierChips
          value={tierFilter}
          onChange={setTierFilter}
          label={dict.common.tier}
          tierLabel={(tier) => `${dict.common.tier} ${tier}`}
        />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
          <p className="text-sm text-muted-foreground">
            {dict.comps.empty}
          </p>
        </div>
      </div>
    );
  }

  const iconByName = new Map(
    (staticData?.champions ?? []).map((champion) => [champion.name, champion.iconUrl]),
  );

  return (
    <div className="space-y-3">
      <TierChips
        value={tierFilter}
        onChange={setTierFilter}
        label={dict.common.tier}
        tierLabel={(tier) => `${dict.common.tier} ${tier}`}
      />
      <div className="trending-carousel -mx-1 flex snap-x snap-proximity gap-4 overflow-x-auto scroll-px-1 px-1 py-2 [scrollbar-width:thin] [&>*:last-child]:mr-1">
      {topComps.map((comp, index) => {
        const visibleTraits = comp.primaryTraits.slice(0, MAX_TRAIT_CHIPS);
        const extraTraits = comp.primaryTraits.length - visibleTraits.length;

        return (
          <Reveal
            key={comp.id}
            delay={Math.min(index, 5) * 60}
            className="w-[300px] flex-none snap-start overflow-visible sm:w-[380px]"
            style={{ contentVisibility: 'visible' }}
          >
            <button
              type="button"
              onClick={() => setSpotlight(comp)}
              className="group relative isolate w-full min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 text-left transition-[border-color,box-shadow,transform,opacity] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-gold)]/40 hover:shadow-lg hover:shadow-[var(--accent-gold)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, transparent, ${tierVar[comp.tier]}, transparent)` }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">
                      {comp.name}
                    </h3>
                    <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {comp.style}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {visibleTraits.map((trait) => (
                      <span
                        key={trait}
                        className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--accent-blue)]"
                      >
                        {trait}
                      </span>
                    ))}
                    {extraTraits > 0 && (
                      <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-muted-foreground">
                        +{extraTraits}
                      </span>
                    )}
                  </div>
                </div>
                <TierBadge tier={comp.tier} size="lg" />
              </div>

              <div className="mt-4 flex gap-5">
                <div>
                  <p className="text-xs text-muted-foreground">{dict.comps.winRate}</p>
                  <p className="text-sm font-semibold tabular-nums text-[var(--accent-gold)]">
                    {comp.winRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{dict.comps.avgPlace}</p>
                  <p className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
                    {comp.avgPlacement.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{dict.comps.top4}</p>
                  <p className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
                    {comp.top4Rate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mt-3 flex min-w-0 gap-1 overflow-hidden">
                {comp.champions.map((champ) => (
                  <ChampionAvatar
                    key={champ}
                    name={champ}
                    iconUrl={iconByName.get(champ) ?? ''}
                    size="sm"
                    className="rounded-md"
                  />
                ))}
              </div>
            </button>
          </Reveal>
        );
      })}
    </div>
    <CompSpotlight comp={spotlight} onClose={() => setSpotlight(null)} />
    </div>
  );
}
