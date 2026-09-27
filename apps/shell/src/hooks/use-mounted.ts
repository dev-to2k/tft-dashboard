'use client';

import { useEffect, useState } from 'react';

/**
 * True only after the component has mounted on the client.
 * Gate any branch that renders differently with cached/persisted data
 * (react-query cache, zustand persist) to avoid hydration mismatches:
 * render the loading/fallback state on the server AND on first client render.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
