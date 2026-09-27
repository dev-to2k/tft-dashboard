"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'card' | 'table-row' | 'text' | 'circle' | 'avatar';
  lines?: number;
}

export const LoadingSkeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', lines = 1, ...props }, ref) => {
    if (variant === 'card') {
      return (
        <div
          ref={ref}
          className={cn(
            'skeleton-sheen animate-pulse rounded-xl border border-white/10 bg-[var(--card-bg)] p-6',
            className,
          )}
          {...props}
        >
          <div className="mb-4 h-4 w-3/4 rounded bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-5/6 rounded bg-white/5" />
            <div className="h-3 w-4/6 rounded bg-white/5" />
          </div>
        </div>
      );
    }

    if (variant === 'table-row') {
      return (
        <div
          ref={ref}
          className={cn(
            'flex animate-pulse items-center gap-4 border-b border-white/5 p-4',
            className,
          )}
          {...props}
        >
          <div className="h-8 w-8 rounded bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-white/10" />
            <div className="h-3 w-1/4 rounded bg-white/5" />
          </div>
          <div className="h-4 w-12 rounded bg-white/10" />
        </div>
      );
    }

    if (variant === 'circle' || variant === 'avatar') {
      return (
        <div
          ref={ref}
          className={cn(
            'animate-pulse rounded-full bg-white/10',
            variant === 'avatar' ? 'h-10 w-10' : 'h-8 w-8',
            className,
          )}
          {...props}
        />
      );
    }

    // text variant
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse rounded bg-white/10',
              i === lines! - 1 ? 'h-3 w-2/3' : 'h-3 w-full',
            )}
          />
        ))}
      </div>
    );
  },
);
LoadingSkeleton.displayName = 'LoadingSkeleton';
