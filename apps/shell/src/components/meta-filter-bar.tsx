'use client';

import { useMetaStats } from '@tft/api';
import { usePreferencesStore } from '@tft/store';

const brackets = [
  { value: 'all', label: 'All' },
  { value: 'diamond_plus', label: 'Diamond+' },
  { value: 'master_plus', label: 'Master+' },
  { value: 'challenger', label: 'Challenger' },
];

export function MetaFilterBar() {
  // NOTE: the selection is persisted and plumbed into useMetaStats' queryKey.
  // The /api/tft/meta proxy currently serves global histograms, so every
  // bracket shows the same numbers until a tier-scoped upstream exists.
  const eloBracket = usePreferencesStore((s) => s.eloBracket);
  const setEloBracket = usePreferencesStore((s) => s.setEloBracket);
  const { overview, isLoading } = useMetaStats();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <span className="text-sm font-medium text-muted-foreground">Rank:</span>
      {brackets.map((bracket) => {
        const active = eloBracket === bracket.value;
        return (
          <button
            key={bracket.value}
            type="button"
            aria-pressed={active}
            onClick={() => setEloBracket(bracket.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
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
        {isLoading || !overview ? (
          <div className="h-6 w-32 animate-pulse rounded-lg bg-[var(--foreground)]/10" />
        ) : (
          <span className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Set {overview.setNumber} &middot; Patch {overview.patchId}
          </span>
        )}
      </div>
    </div>
  );
}
