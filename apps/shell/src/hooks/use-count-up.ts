'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

interface UseCountUpOptions {
  /** Animation duration in ms. Default 800. */
  duration?: number;
  /** Decimals to keep. Default 0. */
  decimals?: number;
  /** When false, jumps straight to target. Default true. */
  enabled?: boolean;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Count-up number driven by requestAnimationFrame (800ms default).
 * Respects prefers-reduced-motion: returns target instantly.
 * Only callers animate opacity/transform; this hook only returns a number.
 */
export function useCountUp(target: number, options: UseCountUpOptions = {}): number {
  const { duration = 800, decimals = 0, enabled = true } = options;
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(() =>
    !enabled || reduced || !Number.isFinite(target) ? target : 0,
  );
  const rafRef = useRef<number>(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setValue(target);
      return;
    }
    if (!enabled || reduced || duration <= 0) {
      setValue(target);
      return;
    }
    const from = fromRef.current;
    // Small targets restart from 0 so the motion is visible.
    const start = Math.abs(target - from) < 1e-9 ? 0 : from;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = start + (target - start) * eased;
      setValue(Number(current.toFixed(decimals)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, decimals, enabled, reduced]);

  return value;
}
