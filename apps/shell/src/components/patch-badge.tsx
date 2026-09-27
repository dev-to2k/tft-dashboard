'use client';

import { useMetaStats } from '@tft/api';
import { useMounted } from '@/hooks/use-mounted';

export function PatchBadge() {
  const { overview, isLoading } = useMetaStats();
  const showLoading = !useMounted() || isLoading || !overview;

  return (
    <p className="text-sm font-bold text-[var(--accent-gold)]">
      {showLoading ? '…' : overview.patchId}
    </p>
  );
}
