'use client';

import { useState } from 'react';

import { useChampions, useStaticData } from '@tft/api';
import { Button, LoadingSkeleton, SearchInput, costBgClass, costBorderClass } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';

export default function WikiChampionsPage() {
  const [search, setSearch] = useState('');
  const [costFilter, setCostFilter] = useState<number | null>(null);

  const { isLoading, isError, error, refetch, data } = useChampions();
  const { data: staticData } = useStaticData();

  const champions = data ?? [];
  const set = staticData?.set;

  const filtered = champions.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.traits.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCost = costFilter === null || c.cost === costFilter;
    return matchesSearch && matchesCost;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)]">Champions</h2>
        <p className="mt-1 text-sm text-[var(--foreground)]/50">
          {isLoading ? (
            <span className="block h-4 w-64 animate-pulse rounded bg-white/10" />
          ) : (
            `Browse all ${champions.length} champions in ${set?.name ?? 'the current set'}`
          )}
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="text-sm text-[var(--foreground)]/70">Failed to load champions.</p>
          {error && (
            <p className="mt-1 text-xs text-[var(--foreground)]/40">{error.message}</p>
          )}
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <SearchInput
              placeholder="Search by name or trait..."
              value={search}
              onChange={setSearch}
              aria-label="Search champions by name or trait"
              className="min-w-[200px] flex-1"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setCostFilter(null)}
                aria-pressed={costFilter === null}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  costFilter === null
                    ? 'bg-[var(--accent-gold)] text-[var(--background)]'
                    : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
                }`}
              >
                All
              </button>
              {[1, 2, 3, 4, 5].map((cost) => (
                <button
                  key={cost}
                  onClick={() => setCostFilter(costFilter === cost ? null : cost)}
                  aria-pressed={costFilter === cost}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    costFilter === cost
                      ? `text-white ${costBgClass[cost] ?? ''}`
                      : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
                  }`}
                >
                  {cost}
                </button>
              ))}
            </div>
          </div>

          {/* Champion Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((champ) => (
              <div
                key={champ.id}
                className={`group relative overflow-hidden rounded-xl border-2 bg-[var(--card-bg)] p-4 transition-all hover:shadow-lg ${costBorderClass[champ.cost] ?? 'border-[var(--border)]'}`}
              >
                <ChampionAvatar
                  name={champ.name}
                  iconUrl={champ.iconUrl}
                  cost={champ.cost}
                  size="lg"
                  className="mx-auto mb-3 rounded-full shadow-md"
                />
                <h3 className="text-center text-sm font-bold text-[var(--foreground)]">
                  {champ.name}
                </h3>
                {champ.ability.name && (
                  <p className="mt-0.5 text-center text-[10px] text-[var(--foreground)]/40">
                    {champ.ability.name}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {champ.traits.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full bg-[var(--background)] px-1.5 py-0.5 text-[10px] text-[var(--accent-blue)]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                <div
                  className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded text-[10px] font-black text-white ${costBgClass[champ.cost] ?? ''}`}
                >
                  {champ.cost}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-[var(--foreground)]/30">
              No champions match your filters.
            </div>
          )}
        </>
      )}
    </div>
  );
}
