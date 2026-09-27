"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

const tierStyles: Record<string, string> = {
  S: 'border-tier-s/40 bg-tier-s/10 text-tier-s animate-gold-shimmer',
  A: 'border-tier-a/40 bg-tier-a/10 text-tier-a',
  B: 'border-tier-b/40 bg-tier-b/10 text-tier-b',
  C: 'border-tier-c/40 bg-tier-c/10 text-tier-c',
  D: 'border-tier-d/40 bg-tier-d/10 text-tier-d',
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
          'inline-flex items-center justify-center rounded-md border font-black shadow-[0_0_12px_-3px_currentColor]',
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
