"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

const buttonVariants = {
  primary:
    'bg-gradient-to-b from-[var(--accent-gold)] to-[var(--gold-deep)] text-[var(--gold-foreground)] font-bold uppercase tracking-wider shadow-[0_2px_16px_-4px_var(--accent-gold)] hover:brightness-110',
  secondary:
    'bg-gradient-to-b from-[var(--accent-blue)] to-[#087a71] text-white font-semibold uppercase tracking-wider shadow-[0_2px_16px_-4px_var(--accent-blue)] hover:brightness-110',
  ghost:
    'bg-transparent text-[var(--foreground)] uppercase tracking-wider hover:bg-[var(--foreground)]/10',
  outline:
    'border border-[var(--accent-gold)]/40 text-[var(--foreground)] uppercase tracking-wider hover:bg-[var(--accent-gold)]/10',
};

const buttonSizes = {
  sm: 'h-8 px-3 text-xs rounded-md',
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
          'inline-flex items-center justify-center transition-transform transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] motion-safe:active:translate-y-px motion-safe:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
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
