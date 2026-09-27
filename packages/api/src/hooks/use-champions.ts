"use client";

import { useQuery } from '@tanstack/react-query';
import { usePreferencesStore } from '@tft/store';
import type { TftChampion } from '@tft/types';
import type { TftStaticData } from '../community-dragon';
import { normalizeGameLocale } from '../tft-strings';

export const STATIC_DATA_URL = '/api/tft/static';

/**
 * Full trimmed Community Dragon payload (current set only), served by
 * `apps/shell/src/app/api/tft/static/route.ts`.
 * Follows the app locale: switching language refetches localized names.
 */
export function useStaticData() {
  const locale = normalizeGameLocale(usePreferencesStore((s) => s.locale));
  return useQuery<TftStaticData, Error>({
    queryKey: ['tft', 'static', locale],
    queryFn: async () => {
      const response = await fetch(`${STATIC_DATA_URL}?locale=${locale}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to load static data: HTTP ${response.status}`);
      }
      return (await response.json()) as TftStaticData;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useChampions() {
  const query = useStaticData();
  return {
    ...query,
    data: query.data?.champions as TftChampion[] | undefined,
  };
}
