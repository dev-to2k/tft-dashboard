'use client';

import { useQuery } from '@tanstack/react-query';

export interface AugmentStatRow {
  name: string;
  places: number[];
  games: number;
}

/**
 * Global item/augment placement histograms served by
 * `apps/shell/src/app/api/tft/meta/augments/route.ts`.
 */
export function useAugmentStats(enabled = true) {
  const query = useQuery<{ rows: AugmentStatRow[] }, Error>({
    queryKey: ['tft', 'meta', 'augments'],
    queryFn: async () => {
      const response = await fetch('/api/tft/meta/augments', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to load augment stats: HTTP ${response.status}`);
      }
      return (await response.json()) as { rows: AugmentStatRow[] };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled,
    retry: 1,
  });

  return { ...query, rows: query.data?.rows ?? [] };
}
