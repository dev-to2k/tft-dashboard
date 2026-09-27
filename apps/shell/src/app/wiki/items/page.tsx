'use client';

import { useState } from 'react';
import { useStaticData } from '@tft/api';
import { Button, LoadingSkeleton, SearchInput } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';

export default function WikiItemsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = useStaticData();

  const items = data?.items ?? [];
  const nameById = new Map(items.map((item) => [item.id, item.name]));
  const q = search.trim().toLowerCase();
  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)]">Items</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading ? (
            <span className="block h-4 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
          ) : (
            `Browse all ${items.length} items in ${data?.set.name ?? 'the current set'}`
          )}
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="text-sm text-muted-foreground">Failed to load items.</p>
          {error && (
            <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
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
          <SearchInput
            placeholder="Search items..."
            value={search}
            onChange={setSearch}
            aria-label="Search items"
            className="max-w-md"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4"
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
                    {item.description || 'No description available.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[var(--foreground)]/30">
              No items match your search.
            </div>
          )}
        </>
      )}
    </div>
  );
}
