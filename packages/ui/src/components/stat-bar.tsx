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
    const clamped = Math.min(Math.max(value, 0), 1);
    const percentage = clamped * 100;
    const barColor = value >= 0.5 ? 'bg-success' : 'bg-danger';

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="mb-1 flex justify-between text-xs">
            {label && (
              <span className="text-muted-foreground">{label}</span>
            )}
            <span className="text-[var(--foreground)] tabular-nums">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
        <div
          className="w-full overflow-hidden rounded-full bg-[var(--foreground)]/10"
          style={{ height }}
        >
          <div
            className={cn(
              'h-full w-full origin-left rounded-full bg-gradient-to-b from-white/25 to-transparent transition-transform duration-300',
              barColor,
            )}
            style={{ transform: `scaleX(${clamped})` }}
          />
        </div>
      </div>
    );
  },
);
StatBar.displayName = 'StatBar';
