"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

export interface StatBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  label?: string;
  showLabel?: boolean;
  height?: number;
}

export const StatBar = React.forwardRef<HTMLDivElement, StatBarProps>(
  ({ className, value, label, showLabel = true, height = 8, ...props }, ref) => {
    const percentage = Math.min(Math.max(value * 100, 0), 100);
    const barColor = value >= 0.5 ? 'bg-green-500' : 'bg-red-500';

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="mb-1 flex justify-between text-xs">
            {label && (
              <span className="text-[var(--text-secondary)]">{label}</span>
            )}
            <span className="text-[var(--text-primary)]">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
        <div
          className="w-full overflow-hidden rounded-full bg-white/10"
          style={{ height }}
        >
          <div
            className={cn('h-full rounded-full transition-all duration-300', barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  },
);
StatBar.displayName = 'StatBar';
