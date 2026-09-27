'use client';

import { tierTextClass, type Tier } from '@tft/ui';

interface TierChipsProps {
  value: Tier | null;
  onChange: (tier: Tier | null) => void;
  label: string;
  tierLabel: (tier: Tier) => string;
}

/** Compact S/A/B/C/D filter chips with tier colors. */
export function TierChips({ value, onChange, label, tierLabel }: TierChipsProps) {
  return (
    <div className="flex gap-1" role="group" aria-label={label}>
      {(['S', 'A', 'B', 'C', 'D'] as const).map((tier) => (
        <button
          key={tier}
          type="button"
          onClick={() => onChange(value === tier ? null : tier)}
          aria-pressed={value === tier}
          title={tierLabel(tier)}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-95 ${
            value === tier
              ? 'bg-[var(--accent-gold)] text-[var(--gold-foreground)]'
              : `border border-[var(--border)] bg-[var(--card-bg)] ${tierTextClass[tier]} hover:border-current`
          }`}
        >
          {tier}
        </button>
      ))}
    </div>
  );
}
