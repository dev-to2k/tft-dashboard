'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStaticData } from '@tft/api';
import { useTeamBuilderStore } from '@tft/store';
import { Button, SearchInput, costBgClass } from '@tft/ui';
import { ChampionAvatar } from '../champion-avatar';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';
import { setOrDelete, useSyncSearchParams } from '@/hooks/use-sync-search-params';
import { setDragPayload } from './dnd';

export function ChampionPool() {
  const params = useSearchParams();
  const [search, setSearch] = useState(() => params.get('poolq') ?? '');
  const [dragId, setDragId] = useState<string | null>(null);
  const [costFilter, setCostFilter] = useState<number | null>(() => {
    const cost = Number(params.get('poolcost'));
    return cost >= 1 && cost <= 5 ? cost : null;
  });
  const addChampion = useTeamBuilderStore((s) => s.addChampion);
  const board = useTeamBuilderStore((s) => s.board);
  const bench = useTeamBuilderStore((s) => s.bench);
  const { data, isLoading, isError, error, refetch } = useStaticData();
  const { dict } = useDictionary();
  const t = dict.builder;
  const mounted = useMounted();
  const showLoading = !mounted || isLoading;

  const merged = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    setOrDelete(next, 'poolq', search.trim() || null);
    setOrDelete(next, 'poolcost', costFilter === null ? null : String(costFilter));
    return next.toString();
  }, [params, search, costFilter]);
  useSyncSearchParams(merged);

  const champions = data?.champions ?? [];
  const isFull =
    board.length > 0 &&
    bench.length > 0 &&
    board.every(Boolean) &&
    bench.every(Boolean);

  const q = search.trim().toLowerCase();
  const filtered = champions.filter(
    (c) =>
      (c.name.toLowerCase().includes(q) ||
        c.traits.some((trait) => trait.toLowerCase().includes(q))) &&
      (costFilter === null || c.cost === costFilter),
  );

  const groupedByCost = [1, 2, 3, 4, 5].map((cost) => ({
    cost,
    champions: filtered.filter((c) => c.cost === cost),
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {t.poolTitle}
      </h3>

      <SearchInput
        placeholder={t.poolSearch}
        value={search}
        onChange={setSearch}
        aria-label={t.poolSearchLabel}
      />

      <div className="flex gap-1.5" role="group" aria-label={dict.common.cost}>
        {[1, 2, 3, 4, 5].map((cost) => (
          <button
            key={cost}
            type="button"
            onClick={() => setCostFilter(costFilter === cost ? null : cost)}
            aria-pressed={costFilter === cost}
            title={`${dict.common.cost} ${cost}`}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-95 ${
              costFilter === cost
                ? `text-white ${costBgClass[cost] ?? ''}`
                : 'border border-[var(--border)] bg-[var(--background)] text-muted-foreground hover:text-[var(--foreground)]'
            }`}
          >
            {cost}
          </button>
        ))}
      </div>

      {showLoading && (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="h-[68px] animate-pulse rounded-lg bg-[var(--foreground)]/10"
            />
          ))}
        </div>
      )}

      {!showLoading && isError && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t.poolError}
            {error ? ` ${error.message}` : ''}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void refetch()}
          >
            {dict.common.retry}
          </Button>
        </div>
      )}

      {!showLoading && !isError && (
        <>
          {isFull && (
            <p
              role="status"
              className="rounded-lg border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10 px-3 py-2 text-xs font-medium text-[var(--accent-gold-text)]"
            >
              {t.poolFull}
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
                        draggable={!isFull}
                        onDragStart={(event) => {
                          setDragPayload(event, { kind: 'pool', championId: champ.slug });
                          setDragId(champ.id);
                        }}
                        onDragEnd={() => setDragId(null)}
                        aria-label={t.addToBoard(champ.name)}
                        title={`${champ.name} (${champ.traits.join(', ')})`}
                        className={`group relative flex min-h-[44px] flex-col items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 transition-all hover:border-[var(--accent-gold)]/50 hover:bg-[var(--card-bg)] disabled:cursor-not-allowed disabled:opacity-40 ${dragId === champ.id ? 'opacity-40' : ''} ${!isFull ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
              {t.poolEmpty}
            </p>
          )}
        </>
      )}
    </div>
  );
}
