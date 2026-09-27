'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStaticData } from '@tft/api';
import { Button, LoadingSkeleton, SearchInput } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';
import { setOrDelete, useSyncSearchParams } from '@/hooks/use-sync-search-params';

function WikiTraitsContent() {
  const params = useSearchParams();
  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const { data, isLoading, isError, error, refetch } = useStaticData();
  const { dict } = useDictionary();
  const showLoading = !useMounted() || isLoading;

  const merged = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    setOrDelete(next, 'q', search.trim() || null);
    return next.toString();
  }, [params, search]);
  useSyncSearchParams(merged);

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
        <h2 className="text-2xl font-black text-[var(--foreground)]">{dict.wiki.traitsTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {showLoading ? (
            <span className="block h-4 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
          ) : (
            dict.wiki.traitsSubtitle(traits.length, data?.set.name ?? dict.wiki.currentSet)
          )}
        </p>
      </div>

      {showLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {!showLoading && isError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="text-sm text-muted-foreground">{dict.wiki.traitsError}</p>
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
            placeholder={dict.wiki.traitsSearch}
            value={search}
            onChange={setSearch}
            aria-label={dict.wiki.traitsSearchLabel}
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
                      {dict.wiki.bonusAt} {trait.tiers.map((t) => t.count).join(' / ')}
                    </p>
                  )}
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {trait.description || dict.wiki.noDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {dict.wiki.traitsEmpty}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function WikiTraitsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      }
    >
      <WikiTraitsContent />
    </Suspense>
  );
}

