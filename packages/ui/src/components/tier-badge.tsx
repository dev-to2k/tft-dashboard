"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

const tierStyles: Record<string, string> = {
  S: 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold shadow-[0_0_10px_rgba(234,179,8,0.4)]',
  A: 'bg-blue-500 text-white font-semibold shadow-[0_0_8px_rgba(59,130,246,0.3)]',
  B: 'bg-green-500 text-white font-medium',
  C: 'bg-gray-500 text-white',
  D: 'bg-red-500 text-white',
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
          'inline-flex items-center justify-center rounded-md',
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
