"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

const tierColors: Record<string, string> = {
  S: 'border-tier-s/40 bg-tier-s/10 text-tier-s',
  A: 'border-tier-a/40 bg-tier-a/10 text-tier-a',
  B: 'border-tier-b/40 bg-tier-b/10 text-tier-b',
  C: 'border-tier-c/40 bg-tier-c/10 text-tier-c',
  D: 'border-tier-d/40 bg-tier-d/10 text-tier-d',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tier?: 'S' | 'A' | 'B' | 'C' | 'D';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tier, children, ...props }, ref) => {
    const tierClass = tier ? tierColors[tier] : 'border-[var(--border)] bg-[var(--foreground)]/5 text-[var(--foreground)]';

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-[0_0_12px_-4px_currentColor] transition-colors',
          tierClass,
          className,
        )}
        {...props}
      >
        {children ?? tier}
      </span>
    );
  },
);
Badge.displayName = 'Badge';
