"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

const buttonVariants = {
  primary:
    'bg-[var(--accent-gold)] text-[var(--bg-primary)] hover:bg-[var(--accent-gold)]/90 font-semibold',
  secondary:
    'bg-[var(--accent-blue)] text-[var(--bg-primary)] hover:bg-[var(--accent-blue)]/90 font-semibold',
  ghost:
    'bg-transparent text-[var(--text-primary)] hover:bg-white/10',
  outline:
    'border border-[var(--accent-gold)]/40 text-[var(--text-primary)] hover:bg-[var(--accent-gold)]/10',
};

const buttonSizes = {
  sm: 'h-8 px-3 text-xs rounded',
  md: 'h-10 px-4 text-sm rounded-md',
  lg: 'h-12 px-6 text-base rounded-lg',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] disabled:pointer-events-none disabled:opacity-50',
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
