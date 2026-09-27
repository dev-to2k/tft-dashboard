'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMetaStats, useStaticData } from '@tft/api';
import { usePreferencesStore } from '@tft/store';
import { Button, LoadingSkeleton, SearchInput, TierBadge, costBgClass, costTextClass } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';
import { TraitFilter } from '@/components/trait-filter';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';
import { parseListParam, setOrDelete, useSyncSearchParams } from '@/hooks/use-sync-search-params';

type SortKey = 'avgPlacement' | 'winRate' | 'pickRate';

const SORT_KEYS: SortKey[] = ['avgPlacement', 'winRate', 'pickRate'];

function isSortKey(value: string | null): value is SortKey {
  return value === 'avgPlacement' || value === 'winRate' || value === 'pickRate';
}

function MetaChampionsContent() {
  const params = useSearchParams();
  const eloBracket = usePreferencesStore((s) => s.eloBracket);
  const { champions, overview, isLoading, isError, error, refetch } =
    useMetaStats({ eloBracket });
  const { data: staticData, isLoading: isStaticLoading } = useStaticData();
  const mounted = useMounted();
  const showLoading = !mounted || isLoading || isStaticLoading;
  const patch = (mounted ? overview?.patchId : undefined) ?? 'latest';
  const { dict } = useDictionary();
  const t = dict.meta.table;

  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const [costFilter, setCostFilter] = useState<number | null>(() => {
    const cost = Number(params.get('cost'));
    return cost >= 1 && cost <= 5 ? cost : null;
  });
  const [traitFilter, setTraitFilter] = useState<string[]>(() => parseListParam(params.get('traits')));
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    const sort = params.get('sort');
    return isSortKey(sort) ? sort : 'avgPlacement';
  });
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(() =>
    params.get('dir') === 'desc' ? 'desc' : 'asc',
  );

  const merged = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    setOrDelete(next, 'q', search.trim() || null);
    setOrDelete(next, 'cost', costFilter === null ? null : String(costFilter));
    setOrDelete(next, 'traits', traitFilter.length > 0 ? traitFilter.join(',') : null);
    setOrDelete(next, 'sort', sortKey === 'avgPlacement' ? null : sortKey);
    setOrDelete(next, 'dir', sortKey === 'avgPlacement' && sortDir === 'asc' ? null : sortDir);
    return next.toString();
  }, [params, search, costFilter, traitFilter, sortKey, sortDir]);
  useSyncSearchParams(merged);

  const availableTraits = (staticData?.traits ?? []).map((trait) => trait.name);

  const toggleTrait = (trait: string) => {
    setTraitFilter((current) =>
      current.includes(trait) ? current.filter((item) => item !== trait) : [...current, trait],
    );
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      // Sensible default direction per metric: placement asc, rates desc.
      setSortDir(key === 'avgPlacement' ? 'asc' : 'desc');
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = champions
    .filter((champ) => {
      const matchesSearch =
        champ.name.toLowerCase().includes(q) ||
        champ.traits.some((trait) => trait.toLowerCase().includes(q));
      const matchesCost = costFilter === null || champ.cost === costFilter;
      const matchesTraits = traitFilter.every((trait) => champ.traits.includes(trait));
      return matchesSearch && matchesCost && matchesTraits;
    })
    .sort((a, b) =>
      sortDir === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey],
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">
          {dict.meta.tierListTitle}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {dict.meta.tierListSubtitle(patch)}
        </p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="font-semibold text-[var(--foreground)]">
            {dict.meta.loadError}
          </p>
          {error ? (
            <p className="mt-1 text-xs text-muted-foreground">
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
            {dict.common.retry}
          </Button>
        </div>
      ) : null}

      {/* Toolbar */}
      {!showLoading && !isError ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <SearchInput
              placeholder={dict.wiki.championsSearch}
              value={search}
              onChange={setSearch}
              aria-label={dict.wiki.championsSearchLabel}
              className="min-w-[200px] flex-1"
            />
            <div className="flex gap-1.5" role="group" aria-label={dict.common.cost}>
              {[1, 2, 3, 4, 5].map((cost) => (
                <button
                  key={cost}
                  onClick={() => setCostFilter(costFilter === cost ? null : cost)}
                  aria-pressed={costFilter === cost}
                  title={`${dict.common.cost} ${cost}`}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-95 ${
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
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {dict.common.sortBy}
            </span>
            <div className="flex gap-1.5" role="group" aria-label={dict.common.sortBy}>
              {SORT_KEYS.map((key) => {
                const active = sortKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    aria-pressed={active}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-95 ${
                      active
                        ? 'bg-[var(--accent-gold)]/15 font-bold text-[var(--accent-gold)]'
                        : 'border border-[var(--border)] bg-[var(--card-bg)] text-muted-foreground hover:text-[var(--foreground)]'
                    }`}
                  >
                    {t[key === 'avgPlacement' ? 'avgPlace' : key === 'winRate' ? 'winRate' : 'pickRate']}
                    {active ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : ''}
                  </button>
                );
              })}
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
        </div>
      ) : null}

      {/* Data Table */}
      {!isError ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
          {showLoading ? (
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="table-row" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  {dict.meta.tierListCaption}
                </caption>
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-medium">{t.champion}</th>
                    <th scope="col" className="px-4 py-3 font-medium">{t.cost}</th>
                    <th scope="col" className="px-4 py-3 font-medium">{t.tier}</th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">{t.winRate}</th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">{t.avgPlace}</th>
                    <th scope="col" className="hidden px-4 py-3 font-medium text-right sm:table-cell">{t.pickRate}</th>
                    <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">{t.traits}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((champ) => (
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
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {champ.avgPlacement.toFixed(2)}
                      </td>
                      <td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">
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
              {filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  {dict.wiki.championsEmpty}
                </p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function ChampionsTierListPage() {
  return (
    <Suspense>
      <MetaChampionsContent />
    </Suspense>
  );
}
