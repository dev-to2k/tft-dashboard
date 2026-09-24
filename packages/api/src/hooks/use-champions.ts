"use client";

import { useQuery } from '@tanstack/react-query';
import type { TftChampion } from '@tft/types';
import { fetchChampions } from '../community-dragon';

export function useChampions() {
  return useQuery<TftChampion[], Error>({
    queryKey: ['tft', 'champions'],
    queryFn: fetchChampions,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
