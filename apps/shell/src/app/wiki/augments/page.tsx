'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStaticData } from '@tft/api';
import { Button, LoadingSkeleton, SearchInput } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';
import { setOrDelete, useSyncSearchParams } from '@/hooks/use-sync-search-params';

const tiers = ['Silver', 'Gold', 'Prismatic'] as const;
type AugmentTier = (typeof tiers)[number];

const tierTextClass: Record<string, string> = {
  silver: 'text-muted-foreground',
  gold: 'text-[var(--accent-gold-text)]',
  prismatic: 'text-[var(--accent-blue)]',
};

function WikiAugmentsContent() {
  const params = useSearchParams();
  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const [tierFilter, setTierFilter] = useState<AugmentTier | null>(() => {
    const tier = params.get('tier');
    return tier === 'Silver' || tier === 'Gold' || tier === 'Prismatic' ? tier : null;
  });
  const { data, isLoading, isError, error, refetch } = useStaticData();
  const { dict } = useDictionary();
  const mounted = useMounted();
  const showLoading = !mounted || isLoading;

  const merged = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    setOrDelete(next, 'q', search.trim() || null);
    setOrDelete(next, 'tier', tierFilter);
    return next.toString();
  }, [params, search, tierFilter]);
  useSyncSearchParams(merged);
  const tierLabels: Record<AugmentTier, string> = {
    Silver: dict.wiki.tiers.silver,
    Gold: dict.wiki.tiers.gold,
    Prismatic: dict.wiki.tiers.prismatic,
  };

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
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[var(--foreground)]">{dict.wiki.augmentsTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {showLoading ? (
            <span className="block h-4 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
          ) : (
            dict.wiki.augmentsSubtitle(augments.length, data?.set.name ?? dict.wiki.currentSet)
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
          <p className="text-sm text-muted-foreground">
            {dict.wiki.augmentsError}
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
            {dict.common.retry}
          </Button>
        </div>
      )}

      {!showLoading && !isError && (
        <>
          <div className="flex flex-wrap gap-3">
            <SearchInput
              placeholder={dict.wiki.augmentsSearch}
              value={search}
              onChange={setSearch}
              aria-label={dict.wiki.augmentsSearchLabel}
              className="min-w-[200px] flex-1"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setTierFilter(null)}
                aria-pressed={tierFilter === null}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  tierFilter === null
                    ? 'bg-[var(--accent-gold)] text-[var(--gold-foreground)]'
                    : 'border border-[var(--border)] bg-[var(--card-bg)] text-muted-foreground hover:text-[var(--foreground)]'
                }`}
              >
                {dict.common.all}
              </button>
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() =>
                    setTierFilter(tierFilter === tier ? null : tier)
                  }
                  aria-pressed={tierFilter === tier}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                    tierFilter === tier
                      ? 'bg-[var(--accent-gold)] text-[var(--gold-foreground)]'
                      : 'border border-[var(--border)] bg-[var(--card-bg)] text-muted-foreground hover:text-[var(--foreground)]'
                  }`}
                >
                  {tierLabels[tier]}
                </button>
              ))}
            </div>
          </div>
          <div className="wiki-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((augment, index) => (
              <div
                key={`${augment.id}-${index}`}
                className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[var(--accent-gold)]/30 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
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
                    {augment.description || dict.wiki.noDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {dict.wiki.augmentsEmpty}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function WikiAugmentsPage() {
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
      <WikiAugmentsContent />
    </Suspense>
  );
}

