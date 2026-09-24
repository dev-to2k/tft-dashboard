"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

const tierColors: Record<string, string> = {
  S: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  A: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  B: 'bg-green-500/20 text-green-400 border-green-500/40',
  C: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  D: 'bg-red-500/20 text-red-400 border-red-500/40',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tier?: 'S' | 'A' | 'B' | 'C' | 'D';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tier, children, ...props }, ref) => {
    const tierClass = tier ? tierColors[tier] : 'bg-white/10 text-[var(--text-primary)] border-white/10';

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
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
