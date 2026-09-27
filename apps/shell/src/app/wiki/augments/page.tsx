'use client';

import { useState } from 'react';
import { useStaticData } from '@tft/api';
import { Button, LoadingSkeleton, SearchInput } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';

const tiers = ['Silver', 'Gold', 'Prismatic'] as const;
type AugmentTier = (typeof tiers)[number];

const tierTextClass: Record<string, string> = {
  silver: 'text-muted-foreground',
  gold: 'text-[var(--accent-gold-text)]',
  prismatic: 'text-[var(--accent-blue)]',
};

export default function WikiAugmentsPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<AugmentTier | null>(null);
  const { data, isLoading, isError, error, refetch } = useStaticData();

  const augments = data?.augments ?? [];
  const q = search.trim().toLowerCase();
  const filtered = augments.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q);
    const matchesTier =
      tierFilter === null ||
      a.tier.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)]">Augments</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading ? (
            <span className="block h-4 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
          ) : (
            `Browse all ${augments.length} augments in ${data?.set.name ?? 'the current set'}`
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
          <p className="text-sm text-muted-foreground">
            Failed to load augments.
          </p>
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
          <div className="flex flex-wrap gap-3">
            <SearchInput
              placeholder="Search augments..."
              value={search}
              onChange={setSearch}
              aria-label="Search augments"
              className="min-w-[200px] flex-1"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setTierFilter(null)}
                aria-pressed={tierFilter === null}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  tierFilter === null
                    ? 'bg-[var(--accent-gold)] text-[var(--gold-foreground)]'
                    : 'border border-[var(--border)] bg-[var(--card-bg)] text-muted-foreground hover:text-[var(--foreground)]'
                }`}
              >
                All
              </button>
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() =>
                    setTierFilter(tierFilter === tier ? null : tier)
                  }
                  aria-pressed={tierFilter === tier}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    tierFilter === tier
                      ? 'bg-[var(--accent-gold)] text-[var(--gold-foreground)]'
                      : 'border border-[var(--border)] bg-[var(--card-bg)] text-muted-foreground hover:text-[var(--foreground)]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((augment) => (
              <div
                key={augment.id}
                className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4"
              >
                <ChampionAvatar
                  name={augment.name}
                  iconUrl={augment.iconUrl}
                  size="md"
                  className="rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    {augment.name}
                  </h3>
                  <p
                    className={`mt-0.5 text-xs font-semibold capitalize ${tierTextClass[augment.tier] ?? ''}`}
                  >
                    {augment.tier}
                  </p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {augment.description || 'No description available.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[var(--foreground)]/30">
              No augments match your filters.
            </div>
          )}
        </>
      )}
    </div>
  );
}
