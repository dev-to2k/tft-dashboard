'use client';

import { useQuery } from '@tanstack/react-query';
import { usePreferencesStore } from '@tft/store';
import { normalizeGameLocale } from '@tft/api';

export interface CompBuildEntry {
  unit: string;
  itemIds: string[];
  games: number;
  avg: number;
  score: number;
  placeChange: number;
}

export interface CompTrendPoint {
  day: string;
  count: number;
  avg: number;
  pick: number;
}

export interface CompDetailPayload {
  cluster: string;
  /** Raw MetaTFT unit ids from `units_string`. */
  units: string[];
  /** Raw MetaTFT trait ids from `traits_string`. */
  traits: string[];
  levelling: string;
  nameParts: Array<{ name: string; type: string; score?: number }>;
  /** Units commonly played at 3-star. */
  stars: string[];
  stars4: string[];
  builds: CompBuildEntry[];
  trends: CompTrendPoint[];
  overallAvg: number;
  /** Placement histogram buckets Top1..Top8. */
  places: number[];
  games: number;
  updatedAt: string;
}

/**
 * Per-comp detail (histogram, BIS builds, trends) served by
 * `apps/shell/src/app/api/tft/meta/comps/[id]/route.ts`.
 * Follows the app locale so joined names stay localized.
 */
export function useCompDetail(clusterId: string | null) {
  const locale = normalizeGameLocale(usePreferencesStore((s) => s.locale));

  const query = useQuery<CompDetailPayload, Error>({
    queryKey: ['tft', 'meta', 'comp', clusterId, locale],
    queryFn: async () => {
      const response = await fetch(
        `/api/tft/meta/comps/${encodeURIComponent(clusterId ?? '')}?locale=${locale}`,
        { headers: { Accept: 'application/json' } },
      );
      // 400 = malformed/empty cluster id, 404 = unknown cluster. Both are
      // "this comp does not exist" from the UI's point of view, so they must
      // map to the same message the detail page uses to show its not-found card
      // instead of a generic retry/error panel.
      if (response.status === 400 || response.status === 404) {
        throw new Error('Comp not found');
      }
      if (!response.ok) {
        throw new Error(`Failed to load comp detail: HTTP ${response.status}`);
      }
      return (await response.json()) as CompDetailPayload;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: Boolean(clusterId),
    retry: 1,
  });

  return query;
}
