'use client';

import { useState } from 'react';
import { useMetaStats, useStaticData } from '@tft/api';

const tierColors: Record<string, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
};

const MAX_TRAIT_CHIPS = 4;
const MAX_COMPS = 4;

function ChampionAvatar({ name, iconUrl }: { name: string; iconUrl: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = iconUrl !== '' && !imageFailed;

  return (
    <div
      className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-[var(--background)] text-[10px] font-medium text-[var(--foreground)]/70 ring-1 ring-[var(--border)]"
      title={name}
    >
      {showImage ? (
        <img
          src={iconUrl}
          alt={name}
          className="h-8 w-8 object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        name.slice(0, 2)
      )}
    </div>
  );
}

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
        <p className="text-sm text-[var(--foreground)]/60">
          Could not load trending comps.
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

  const topComps = comps.slice(0, MAX_COMPS);

  if (topComps.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
        <p className="text-sm text-[var(--foreground)]/60">
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
                  <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] font-medium text-[var(--foreground)]/60">
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
                    <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--foreground)]/50">
                      +{extraTraits}
                    </span>
                  )}
                </div>
              </div>
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-black"
                style={{
                  backgroundColor: `${tierColors[comp.tier] ?? tierColors.B}20`,
                  color: tierColors[comp.tier] ?? tierColors.B,
                }}
              >
                {comp.tier}
              </span>
            </div>

            <div className="mt-4 flex gap-5">
              <div>
                <p className="text-xs text-[var(--foreground)]/50">Win Rate</p>
                <p className="text-sm font-semibold text-[var(--accent-gold)]">
                  {comp.winRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--foreground)]/50">Avg Place</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {comp.avgPlacement.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--foreground)]/50">Top 4</p>
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
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
