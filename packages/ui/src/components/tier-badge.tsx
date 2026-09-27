"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

const tierStyles: Record<string, string> = {
  S: 'hex-clip border-tier-s/60 bg-tier-s/20 text-tier-s font-display drop-shadow-[0_0_8px_var(--tier-s)] motion-safe:animate-gold-shimmer',
  A: 'rounded-md border-tier-a/40 bg-tier-a/10 text-tier-a shadow-[0_0_12px_-3px_currentColor]',
  B: 'rounded-md border-tier-b/40 bg-tier-b/10 text-tier-b shadow-[0_0_12px_-3px_currentColor]',
  C: 'rounded-md border-tier-c/40 bg-tier-c/10 text-tier-c shadow-[0_0_12px_-3px_currentColor]',
  D: 'rounded-md border-tier-d/40 bg-tier-d/10 text-tier-d shadow-[0_0_12px_-3px_currentColor]',
};

export interface TierBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'min-w-[1.5rem] h-6 text-xs px-1.5',
  md: 'min-w-[2rem] h-8 text-sm px-2',
  lg: 'min-w-[2.5rem] h-10 text-base px-3',
};

export const TierBadge = React.forwardRef<HTMLSpanElement, TierBadgeProps>(
  ({ className, tier, size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border font-black font-display tabular-nums',
          tierStyles[tier] ?? tierStyles['C'],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {tier}
      </span>
    );
  },
);
TierBadge.displayName = 'TierBadge';
