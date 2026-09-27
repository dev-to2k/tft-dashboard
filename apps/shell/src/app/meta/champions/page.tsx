'use client';

import { useMetaStats } from '@tft/api';
import { Button, LoadingSkeleton, TierBadge, costTextClass } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';

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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void refetch();
            }}
          >
            Retry
          </Button>
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
                          <ChampionAvatar
                            name={champ.name}
                            iconUrl={champ.iconUrl}
                            cost={champ.cost}
                            size="sm"
                            className="rounded-md"
                          />
                          <span className="font-semibold text-[var(--foreground)]">
                            {champ.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${costTextClass[champ.cost] ?? ''}`}>
                          {champ.cost}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <TierBadge tier={champ.tier} size="sm" />
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
