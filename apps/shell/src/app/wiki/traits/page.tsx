'use client';

import { useState } from 'react';
import { useStaticData } from '@tft/api';
import { Button, LoadingSkeleton, SearchInput } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';

export default function WikiTraitsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = useStaticData();

  const traits = data?.traits ?? [];
  const q = search.trim().toLowerCase();
  const filtered = traits.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)]">Traits</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading ? (
            <span className="block h-4 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
          ) : (
            `Browse all ${traits.length} traits in ${data?.set.name ?? 'the current set'}`
          )}
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="text-sm text-muted-foreground">Failed to load traits.</p>
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
            placeholder="Search traits..."
            value={search}
            onChange={setSearch}
            aria-label="Search traits"
            className="max-w-md"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((trait) => (
              <div
                key={trait.id}
                className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4"
              >
                <ChampionAvatar
                  name={trait.name}
                  iconUrl={trait.iconUrl}
                  size="md"
                  className="rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    {trait.name}
                  </h3>
                  {trait.tiers.length > 0 && (
                    <p className="mt-0.5 text-xs font-semibold text-[var(--accent-gold)]">
                      Bonus at {trait.tiers.map((t) => t.count).join(' / ')}
                    </p>
                  )}
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {trait.description || 'No description available.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[var(--foreground)]/30">
              No traits match your search.
            </div>
          )}
        </>
      )}
    </div>
  );
}
