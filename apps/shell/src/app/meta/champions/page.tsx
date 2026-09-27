'use client';

import { useState } from 'react';
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

function ChampionIcon({ champ }: { champ: ChampionMetaStats }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = champ.iconUrl !== '' && !imgFailed;

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md text-xs font-bold text-white"
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

export default function ChampionsTierListPage() {
  const { champions, overview, isLoading, isError, error, refetch } =
    useMetaStats();
  const patch = overview?.patchId ?? 'latest';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">
          Champion Tier List
        </h1>
        <p className="mt-2 text-[var(--foreground)]/50">
          All champions sorted by average placement for Patch {patch}
        </p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="font-semibold text-[var(--foreground)]">
            Couldn&rsquo;t load champion stats.
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

      {/* Data Table */}
      {!isError ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
          {isLoading ? (
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="table-row" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase tracking-wider text-[var(--foreground)]/40">
                    <th className="px-4 py-3 font-medium">Champion</th>
                    <th className="px-4 py-3 font-medium">Cost</th>
                    <th className="px-4 py-3 font-medium">Tier</th>
                    <th className="px-4 py-3 font-medium text-right">Win Rate</th>
                    <th className="px-4 py-3 font-medium text-right">Avg Place</th>
                    <th className="hidden px-4 py-3 font-medium text-right sm:table-cell">Pick Rate</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">Traits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {champions.map((champ) => (
                    <tr
                      key={champ.championId}
                      className="transition-colors hover:bg-[var(--background)]/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ChampionIcon champ={champ} />
                          <span className="font-semibold text-[var(--foreground)]">
                            {champ.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="font-medium"
                          style={{ color: costColors[champ.cost] }}
                        >
                          {champ.cost}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-black"
                          style={{
                            backgroundColor: `${tierColors[champ.tier]}20`,
                            color: tierColors[champ.tier],
                          }}
                        >
                          {champ.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="font-semibold"
                          style={{
                            color:
                              champ.winRate >= 50
                                ? 'var(--accent-gold)'
                                : 'var(--foreground)',
                          }}
                        >
                          {champ.winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--foreground)]/70">
                        {champ.avgPlacement.toFixed(2)}
                      </td>
                      <td className="hidden px-4 py-3 text-right text-[var(--foreground)]/70 sm:table-cell">
                        {champ.pickRate.toFixed(1)}%
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {champ.traits.map((trait) => (
                            <span
                              key={trait}
                              className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] text-[var(--accent-blue)]"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {champions.length === 0 ? (
                <p className="py-12 text-center text-sm text-[var(--foreground)]/30">
                  No champion data available yet.
                </p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
