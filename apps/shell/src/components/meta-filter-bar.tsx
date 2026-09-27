'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMetaStats } from '@tft/api';
import { usePreferencesStore } from '@tft/store';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';
import { setOrDelete, useSyncSearchParams } from '@/hooks/use-sync-search-params';

const BRACKET_VALUES = ['all', 'diamond_plus', 'master_plus', 'challenger'];

export function MetaFilterBar() {
  // NOTE: the selection is persisted and plumbed into useMetaStats' queryKey.
  // The /api/tft/meta proxy currently serves global histograms, so every
  // bracket shows the same numbers until a tier-scoped upstream exists.
  const params = useSearchParams();
  const eloBracket = usePreferencesStore((s) => s.eloBracket);
  const setEloBracket = usePreferencesStore((s) => s.setEloBracket);
  const { overview, isLoading } = useMetaStats();
  const { dict } = useDictionary();
  const showLoading = !useMounted() || isLoading || !overview;

  // Deep-link ?elo= into the persisted preference on first paint.
  useEffect(() => {
    const elo = params.get('elo');
    if (elo && BRACKET_VALUES.includes(elo) && elo !== usePreferencesStore.getState().eloBracket) {
      usePreferencesStore.getState().setEloBracket(elo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const merged = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    setOrDelete(next, 'elo', eloBracket === 'all' ? null : eloBracket);
    return next.toString();
  }, [params, eloBracket]);
  useSyncSearchParams(merged);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <span className="text-sm font-medium text-muted-foreground">{dict.filter.rank}</span>
      {dict.filter.brackets.map((bracket) => {
        const active = eloBracket === bracket.value;
        return (
          <button
            key={bracket.value}
            type="button"
            aria-pressed={active}
            onClick={() => setEloBracket(bracket.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
              active
                ? 'border-[var(--accent-gold)]/60 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                : 'border-[var(--border)] bg-[var(--background)] text-muted-foreground hover:border-[var(--accent-gold)]/40 hover:text-[var(--accent-gold)]'
            }`}
          >
            {bracket.label}
          </button>
        );
      })}
      <div className="ml-auto">
        {showLoading ? (
          <div className="h-6 w-32 animate-pulse rounded-lg bg-[var(--foreground)]/10" />
        ) : (
          <span className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {dict.filter.setPatch(overview.setNumber, overview.patchId)}
          </span>
        )}
      </div>
    </div>
  );
}
