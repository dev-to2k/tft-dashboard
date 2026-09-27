'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStaticData } from '@tft/api';
import { Button, LoadingSkeleton, SearchInput } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';
import { setOrDelete, useSyncSearchParams } from '@/hooks/use-sync-search-params';

function WikiItemsContent() {
  const params = useSearchParams();
  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const { data, isLoading, isError, error, refetch } = useStaticData();
  const { dict } = useDictionary();
  const mounted = useMounted();
  const showLoading = !mounted || isLoading;

  const merged = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    setOrDelete(next, 'q', search.trim() || null);
    return next.toString();
  }, [params, search]);
  useSyncSearchParams(merged);

  const items = data?.items ?? [];
  const nameById = new Map(items.map((item) => [item.id, item.name]));
  const q = search.trim().toLowerCase();
  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--foreground)]">{dict.wiki.itemsTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {showLoading ? (
            <span className="block h-4 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
          ) : (
            dict.wiki.itemsSubtitle(items.length, data?.set.name ?? dict.wiki.currentSet)
          )}
        </p>
      </div>

      {showLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {!showLoading && isError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="text-sm text-muted-foreground">{dict.wiki.itemsError}</p>
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
          <SearchInput
            placeholder={dict.wiki.itemsSearch}
            value={search}
            onChange={setSearch}
            aria-label={dict.wiki.itemsSearchLabel}
            className="max-w-md"
          />
          <div className="wiki-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[var(--accent-gold)]/30 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
              >
                <ChampionAvatar
                  name={item.name}
                  iconUrl={item.iconUrl}
                  size="md"
                  className="rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    {item.name}
                  </h3>
                  {item.components.length > 0 && (
                    <p className="mt-0.5 text-xs font-medium text-[var(--accent-blue)]">
                      {item.components
                        .map((c) => nameById.get(c) ?? c)
                        .join(' + ')}
                    </p>
                  )}
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {item.description || dict.wiki.noDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {dict.wiki.itemsEmpty}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function WikiItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      }
    >
      <WikiItemsContent />
    </Suspense>
  );
}

