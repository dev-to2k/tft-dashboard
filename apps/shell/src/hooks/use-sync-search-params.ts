'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Mirror filter state into the URL (?key=value) with router.replace so
 * filters are shareable and survive back/forward navigation.
 *
 * Callers build `merged` from the live search params plus their state, e.g.:
 *
 *   const params = useSearchParams();
 *   const merged = useMemo(() => {
 *     const next = new URLSearchParams(params.toString());
 *     setOrDelete(next, 'tier', tierFilter);
 *     return next.toString();
 *   }, [params, tierFilter]);
 *   useSyncSearchParams(merged);
 *
 * State must be initialised FROM useSearchParams (lazy useState) so the
 * first client paint matches the server and no replace fires on mount.
 * Unknown keys (e.g. `share`) are preserved untouched.
 */
export function useSyncSearchParams(merged: string): void {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (merged === params.toString()) return;
    router.replace(merged ? `?${merged}` : '?', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged]);
}

export function setOrDelete(params: URLSearchParams, key: string, value: string | null | undefined): void {
  if (value === null || value === undefined || value === '') {
    params.delete(key);
  } else {
    params.set(key, value);
  }
}

export function parseListParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
