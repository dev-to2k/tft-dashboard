'use client';

import { useMetaStats } from '@tft/api';

export function PatchBadge() {
  const { overview, isLoading } = useMetaStats();

  return (
    <p className="text-sm font-bold text-[var(--accent-gold)]">
      {isLoading ? '…' : (overview?.patchId ?? '—')}
    </p>
  );
}
