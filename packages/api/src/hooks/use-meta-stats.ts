"use client";

import { useQuery } from '@tanstack/react-query';
import type { MetaStatsPayload } from '../metatft';

export const META_STATS_URL = '/api/tft/meta';

export interface UseMetaStatsParams {
  eloBracket?: string;
  patchId?: string;
  enabled?: boolean;
}

/**
 * Live champion/comp statistics (win rate, top 4, average placement, pick rate)
 * served by `apps/shell/src/app/api/tft/meta/route.ts`.
 */
export function useMetaStats(params: UseMetaStatsParams = {}) {
  const { eloBracket = 'all', patchId = 'latest', enabled = true } = params;

  const query = useQuery<MetaStatsPayload, Error>({
    queryKey: ['tft', 'meta', eloBracket, patchId],
    queryFn: async () => {
      const response = await fetch(META_STATS_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        throw new Error(`Failed to load meta stats: HTTP ${response.status}`);
      }
      return (await response.json()) as MetaStatsPayload;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled,
  });

  return {
    ...query,
    champions: query.data?.champions ?? [],
    comps: query.data?.comps ?? [],
    overview: query.data?.overview,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
