"use client";

import { useQuery } from '@tanstack/react-query';
import type { ChampionMetaStats, CompMetaStats, ApiResponse } from '@tft/types';
import { tftFetch } from '../client';

interface UseMetaStatsParams {
  eloBracket?: string;
  patchId?: string;
}

export function useMetaStats(params: UseMetaStatsParams = {}) {
  const { eloBracket = 'all', patchId = 'latest' } = params;

  const championsQuery = useQuery({
    queryKey: ['tft', 'meta', 'champions', eloBracket, patchId],
    queryFn: () =>
      tftFetch<ChampionMetaStats[]>(
        `/api/meta/champions?elo=${eloBracket}&patch=${patchId}`,
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const compsQuery = useQuery({
    queryKey: ['tft', 'meta', 'comps', eloBracket, patchId],
    queryFn: () =>
      tftFetch<CompMetaStats[]>(
        `/api/meta/comps?elo=${eloBracket}&patch=${patchId}`,
      ),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return {
    champions: championsQuery,
    comps: compsQuery,
    isLoading: championsQuery.isLoading || compsQuery.isLoading,
    isError: championsQuery.isError || compsQuery.isError,
  };
}
