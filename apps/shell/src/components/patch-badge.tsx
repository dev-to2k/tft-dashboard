'use client';

import { useMetaStats } from '@tft/api';
import { useMounted } from '@/hooks/use-mounted';

export function PatchBadge() {
  const { overview, isLoading } = useMetaStats();
  const mounted = useMounted();
  const showLoading = !mounted || isLoading || !overview;

  return (
    <p className="text-sm font-bold text-[var(--accent-gold)]">
      {showLoading ? '…' : overview.patchId}
    </p>
  );
}
