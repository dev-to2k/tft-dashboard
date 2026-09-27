'use client';

import { useEffect, useState } from 'react';
import { tierVar } from '@tft/ui';
import { fixed, intText, percent, safeNumber, toArray } from '@tft/utils';
import { useCountUp } from '@/hooks/use-count-up';

interface PlacementHistogramProps {
  /** Buckets Top1..Top8 (raw game counts). */
  places: number[];
  tier?: 'S' | 'A' | 'B' | 'C' | 'D';
  locale?: string;
}

/**
 * Top1-8 placement histogram. Horizontal bars animate with scaleX
 * (origin-left, staggered delay) once mounted.
 */
export function PlacementHistogram({ places, tier = 'B', locale = 'en-US' }: PlacementHistogramProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Buckets can be missing / non-numeric when the payload is partial.
  const buckets = toArray<unknown>(places)
    .slice(0, 8)
    .map((value) => safeNumber(value));
  while (buckets.length < 8) buckets.push(0);
  const total = buckets.reduce((sum, value) => sum + value, 0) || 1;
  const max = Math.max(1, ...buckets);
  const tierColor = tierVar[tier] ?? 'var(--tier-b)';
  const animatedTotal = useCountUp(total, { duration: 800 });

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Placement distribution
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-black tabular-nums text-[var(--foreground)]">
            {intText(animatedTotal, locale)}
          </span>{' '}
          games
        </p>
      </div>
      <ol className="space-y-1.5">
        {buckets.map((count, index) => {
          const pct = (count / total) * 100;
          const place = index + 1;
          const isWin = place === 1;
          const isTop4 = place <= 4;
          return (
            <li key={place} className="flex items-center gap-2">
              <span
                className={`w-9 shrink-0 text-right text-xs font-black tabular-nums ${
                  isWin ? 'text-[var(--accent-gold)]' : isTop4 ? 'text-[var(--foreground)]' : 'text-muted-foreground'
                }`}
              >
                #{place}
              </span>
              <span
                className="h-5 min-w-0 flex-1 overflow-hidden rounded-md bg-[var(--background)]"
                role="img"
                aria-label={`Top ${place}: ${fixed(pct, 1)}% (${intText(count, locale)} games)`}
              >
                <span
                  className="block h-full w-full origin-left rounded-md transition-transform duration-700 ease-out"
                  style={{
                    transform: mounted ? `scaleX(${percent(count / max)})` : 'scaleX(0)',
                    transitionDelay: `${index * 70}ms`,
                    background: isWin
                      ? 'linear-gradient(90deg, var(--gold-deep), var(--accent-gold))'
                      : isTop4
                        ? tierColor
                        : 'var(--border)',
                    opacity: isWin || isTop4 ? 1 : 0.7,
                  }}
                />
              </span>
              <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                <span className="font-bold text-[var(--foreground)]">{fixed(pct, 1)}%</span>{' '}
                · {intText(count, locale)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
