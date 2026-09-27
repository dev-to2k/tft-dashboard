'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useChampions, useStaticData } from '@tft/api';
import { Button, LoadingSkeleton, SearchInput, costBgClass, costBorderClass } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';
import { TraitFilter } from '@/components/trait-filter';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';
import { parseListParam, setOrDelete, useSyncSearchParams } from '@/hooks/use-sync-search-params';

function WikiChampionsContent() {
  const params = useSearchParams();
  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const [costFilter, setCostFilter] = useState<number | null>(() => {
    const cost = Number(params.get('cost'));
    return cost >= 1 && cost <= 5 ? cost : null;
  });
  const [traitFilter, setTraitFilter] = useState<string[]>(() => parseListParam(params.get('traits')));
  const { dict } = useDictionary();

  const { isLoading, isError, error, refetch, data } = useChampions();
  const { data: staticData } = useStaticData();
  const showLoading = !useMounted() || isLoading;

  const merged = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    setOrDelete(next, 'q', search.trim() || null);
    setOrDelete(next, 'cost', costFilter === null ? null : String(costFilter));
    setOrDelete(next, 'traits', traitFilter.length > 0 ? traitFilter.join(',') : null);
    return next.toString();
  }, [params, search, costFilter, traitFilter]);
  useSyncSearchParams(merged);

  const champions = data ?? [];
  const set = staticData?.set;
  const availableTraits = (staticData?.traits ?? []).map((t) => t.name);

  const toggleTrait = (trait: string) => {
    setTraitFilter((current) =>
      current.includes(trait) ? current.filter((t) => t !== trait) : [...current, trait],
    );
  };

  const filtered = champions.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.traits.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCost = costFilter === null || c.cost === costFilter;
    const matchesTraits = traitFilter.every((t) => c.traits.includes(t));
    return matchesSearch && matchesCost && matchesTraits;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)]">{dict.wiki.championsTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {showLoading ? (
            <span className="block h-4 w-64 animate-pulse rounded bg-white/10" />
          ) : (
            dict.wiki.championsSubtitle(champions.length, set?.name ?? dict.wiki.currentSet)
          )}
        </p>
      </div>

      {showLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {!showLoading && isError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="text-sm text-muted-foreground">{dict.wiki.championsError}</p>
          {error && (
            <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
          )}
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => void refetch()}
          >
            {dict.common.retry}
          </Button>
        </div>
      )}

      {!showLoading && !isError && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <SearchInput
              placeholder={dict.wiki.championsSearch}
              value={search}
              onChange={setSearch}
              aria-label={dict.wiki.championsSearchLabel}
              className="min-w-[200px] flex-1"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setCostFilter(null)}
                aria-pressed={costFilter === null}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  costFilter === null
                    ? 'bg-[var(--accent-gold)] text-[var(--background)]'
                    : 'border border-[var(--border)] bg-[var(--card-bg)] text-muted-foreground hover:text-[var(--foreground)]'
                }`}
              >
                {dict.common.all}
              </button>
              {[1, 2, 3, 4, 5].map((cost) => (
                <button
                  key={cost}
                  onClick={() => setCostFilter(costFilter === cost ? null : cost)}
                  aria-pressed={costFilter === cost}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                    costFilter === cost
                      ? `text-white ${costBgClass[cost] ?? ''}`
                      : 'border border-[var(--border)] bg-[var(--card-bg)] text-muted-foreground hover:text-[var(--foreground)]'
                  }`}
                >
                  {cost}
                </button>
              ))}
            </div>
          </div>
          <TraitFilter
            available={availableTraits}
            selected={traitFilter}
            onToggle={toggleTrait}
            onClear={() => setTraitFilter([])}
            label={dict.common.traits}
            clearLabel={dict.common.clear}
          />

          {/* Champion Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((champ) => (
              <Link
                key={champ.id}
                href={`/wiki/champions/${champ.slug}`}
                className={`group relative overflow-hidden rounded-xl border-2 bg-[var(--card-bg)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${costBorderClass[champ.cost] ?? 'border-[var(--border)]'}`}
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
                  <p className="mt-0.5 text-center text-[10px] text-muted-foreground">
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
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {dict.wiki.championsEmpty}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function WikiChampionsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      }
    >
      <WikiChampionsContent />
    </Suspense>
  );
}
