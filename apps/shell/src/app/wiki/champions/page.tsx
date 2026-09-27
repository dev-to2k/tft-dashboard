'use client';

import { useState } from 'react';

import { useChampions, useStaticData } from '@tft/api';
import type { TftChampion } from '@tft/types';
import { LoadingSkeleton } from '@tft/ui';

const costColors: Record<number, string> = {
  1: 'var(--cost-1)',
  2: 'var(--cost-2)',
  3: 'var(--cost-3)',
  4: 'var(--cost-4)',
  5: 'var(--cost-5)',
};

function getInitials(name: string): string {
  const parts = name.split(/[\s']+/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2);
}

function ChampionAvatar({ champion }: { champion: TftChampion }) {
  const [failed, setFailed] = useState(false);
  const showImage = champion.iconUrl !== '' && !failed;

  return (
    <div
      className="mx-auto mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white shadow-md"
      style={{ backgroundColor: costColors[champion.cost] }}
    >
      {showImage ? (
        <img
          src={champion.iconUrl}
          alt={champion.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(champion.name)
      )}
    </div>
  );
}

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
          <button
            onClick={() => void refetch()}
            className="mt-4 rounded-lg bg-[var(--accent-gold)] px-4 py-2 text-xs font-bold text-[var(--background)] transition-colors hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name or trait..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-[200px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 outline-none focus:border-[var(--accent-gold)] transition-colors"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setCostFilter(null)}
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
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    costFilter === cost
                      ? 'text-white'
                      : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
                  }`}
                  style={
                    costFilter === cost
                      ? { backgroundColor: costColors[cost] }
                      : undefined
                  }
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
                className="group relative overflow-hidden rounded-xl border bg-[var(--card-bg)] p-4 transition-all hover:shadow-lg"
                style={{
                  borderColor: costColors[champ.cost],
                  borderWidth: '2px',
                }}
              >
                <ChampionAvatar champion={champ} />
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
                      className="rounded-full bg-[var(--background)] px-1.5 py-0.5 text-[9px] text-[var(--accent-blue)]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                <div
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded text-[10px] font-black text-white"
                  style={{ backgroundColor: costColors[champ.cost] }}
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
