'use client';

import { useState } from 'react';
import { useStaticData } from '@tft/api';
import { useTeamBuilderStore } from '@tft/store';
import { Button, SearchInput, costBgClass } from '@tft/ui';
import { ChampionAvatar } from '../champion-avatar';

export function ChampionPool() {
  const [search, setSearch] = useState('');
  const addChampion = useTeamBuilderStore((s) => s.addChampion);
  const board = useTeamBuilderStore((s) => s.board);
  const bench = useTeamBuilderStore((s) => s.bench);
  const { data, isLoading, isError, error, refetch } = useStaticData();

  const champions = data?.champions ?? [];
  const isFull =
    board.length > 0 &&
    bench.length > 0 &&
    board.every(Boolean) &&
    bench.every(Boolean);

  const q = search.trim().toLowerCase();
  const filtered = champions.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.traits.some((t) => t.toLowerCase().includes(q)),
  );

  const groupedByCost = [1, 2, 3, 4, 5].map((cost) => ({
    cost,
    champions: filtered.filter((c) => c.cost === cost),
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Champion Pool
      </h3>

      <SearchInput
        placeholder="Search pool..."
        value={search}
        onChange={setSearch}
        aria-label="Search champion pool"
      />

      {isLoading && (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="h-[68px] animate-pulse rounded-lg bg-[var(--foreground)]/10"
            />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Failed to load champions.
            {error ? ` ${error.message}` : ''}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {isFull && (
            <p
              role="status"
              className="rounded-lg border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10 px-3 py-2 text-xs font-medium text-[var(--accent-gold-text)]"
            >
              Board and bench are full — remove a champion to add another.
            </p>
          )}
          <div className="space-y-3">
            {groupedByCost.map(({ cost, champions: group }) =>
              group.length === 0 ? null : (
                <div key={cost}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black text-white ${costBgClass[cost] ?? ''}`}
                    >
                      {cost}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cost}-cost
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-5">
                    {group.map((champ) => (
                      <button
                        key={champ.id}
                        type="button"
                        onClick={() => addChampion(champ.slug)}
                        disabled={isFull}
                        aria-label={`Add ${champ.name} to board`}
                        title={`${champ.name} (${champ.traits.join(', ')})`}
                        className="group relative flex min-h-[44px] flex-col items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 transition-all hover:border-[var(--accent-gold)]/50 hover:bg-[var(--card-bg)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChampionAvatar
                          name={champ.name}
                          iconUrl={champ.iconUrl}
                          cost={champ.cost}
                          size="sm"
                          className="rounded-md"
                        />
                        <span className="w-full truncate text-center text-[10px] font-medium text-muted-foreground group-hover:text-[var(--foreground)]">
                          {champ.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
          {filtered.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No champions match your search.
            </p>
          )}
        </>
      )}
    </div>
  );
}
