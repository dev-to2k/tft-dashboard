'use client';

import { useMetaStats, useStaticData } from '@tft/api';
import { Button, TierBadge } from '@tft/ui';
import { ChampionAvatar } from '../champion-avatar';

const MAX_TRAIT_CHIPS = 4;
const MAX_COMPS = 4;

export function TrendingComps() {
  const { comps, isLoading, isError, refetch } = useMetaStats();
  const { data: staticData } = useStaticData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: MAX_COMPS }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5"
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
          Could not load trending comps.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const topComps = comps.slice(0, MAX_COMPS);

  if (topComps.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
        <p className="text-sm text-muted-foreground">
          No comps available right now.
        </p>
      </div>
    );
  }

  const iconByName = new Map(
    (staticData?.champions ?? []).map((champion) => [champion.name, champion.iconUrl]),
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {topComps.map((comp) => {
        const visibleTraits = comp.primaryTraits.slice(0, MAX_TRAIT_CHIPS);
        const extraTraits = comp.primaryTraits.length - visibleTraits.length;

        return (
          <div
            key={comp.id}
            className="group rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 transition-all hover:border-[var(--accent-gold)]/40 hover:shadow-lg hover:shadow-[var(--accent-gold)]/5"
          >
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
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-sm font-semibold text-[var(--accent-gold)]">
                  {comp.winRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Place</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {comp.avgPlacement.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top 4</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {comp.top4Rate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-1">
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
          </div>
        );
      })}
    </div>
  );
}

