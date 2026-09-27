'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMetaStats } from '@tft/api';
import { LoadingSkeleton } from '@tft/ui';
import type { ChampionMetaStats } from '@tft/types';

const tierColors: Record<string, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
};

const costColors: Record<number, string> = {
  1: 'var(--cost-1)',
  2: 'var(--cost-2)',
  3: 'var(--cost-3)',
  4: 'var(--cost-4)',
  5: 'var(--cost-5)',
};

function ChampionIcon({
  champ,
  className,
}: {
  champ: ChampionMetaStats;
  className: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = champ.iconUrl !== '' && !imgFailed;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden text-sm font-bold text-white ${className}`}
      style={{ backgroundColor: costColors[champ.cost] ?? 'var(--accent-blue)' }}
    >
      {showImage ? (
        <img
          src={champ.iconUrl}
          alt={champ.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        champ.name.slice(0, 2)
      )}
    </div>
  );
}

export default function MetaOverviewPage() {
  const { champions, overview, isLoading, isError, error, refetch } =
    useMetaStats();

  const topChampions = champions.slice(0, 8);
  const patch = overview?.patchId ?? 'latest';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">
          Meta Overview
        </h1>
        <p className="mt-2 text-[var(--foreground)]/50">
          Champion tier list and win rates for Patch {patch}
        </p>
        {overview ? (
          <p className="mt-1 text-xs text-[var(--foreground)]/30">
            Set {overview.setNumber} &mdash; {overview.setName} &middot;{' '}
            {overview.totalGames.toLocaleString('en-US')} matches analysed
          </p>
        ) : null}
      </div>

      {isError ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="font-semibold text-[var(--foreground)]">
            Couldn&rsquo;t load meta stats.
          </p>
          {error ? (
            <p className="mt-1 text-xs text-[var(--foreground)]/40">
              {error.message}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)]/40 hover:text-[var(--accent-gold)]"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Tier Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4"
            >
              <div className="mx-auto h-6 w-6 rounded bg-white/10" />
              <div className="mx-auto mt-2 h-3 w-16 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : !isError ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(['S', 'A', 'B', 'C', 'D'] as const).map((tier) => {
            const count = champions.filter((c) => c.tier === tier).length;
            return (
              <div
                key={tier}
                className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-center"
              >
                <span
                  className="text-2xl font-black"
                  style={{ color: tierColors[tier] }}
                >
                  {tier}
                </span>
                <p className="mt-1 text-xs text-[var(--foreground)]/40">
                  {count} champion{count !== 1 ? 's' : ''}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Champion Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Top Champions
          </h2>
          <Link
            href="/meta/champions"
            className="text-sm font-medium text-[var(--accent-gold)] hover:text-[var(--accent-blue)]"
          >
            Full Tier List &rarr;
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : !isError ? (
          champions.length === 0 ? (
            <p className="py-12 text-center text-sm text-[var(--foreground)]/30">
              No champion data available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topChampions.map((champ) => (
                <div
                  key={champ.championId}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-all hover:border-[var(--accent-gold)]/30"
                >
                  <ChampionIcon champ={champ} className="h-12 w-12 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--foreground)]">
                        {champ.name}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-black"
                        style={{
                          backgroundColor: `${tierColors[champ.tier]}20`,
                          color: tierColors[champ.tier],
                        }}
                      >
                        {champ.tier}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {champ.traits.slice(0, 3).map((trait) => (
                        <span
                          key={trait}
                          className="rounded-full bg-[var(--background)] px-1.5 py-0.5 text-[10px] text-[var(--accent-blue)]"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[var(--accent-gold)]">
                      {champ.winRate.toFixed(1)}% WR
                      <span className="ml-2 font-normal text-[var(--foreground)]/40">
                        {champ.avgPlacement.toFixed(2)} avg
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
