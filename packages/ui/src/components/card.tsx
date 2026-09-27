"use client";

import * as React from 'react';
import { cn } from '../lib/utils';

type CardVariant = 'default' | 'glass' | 'glow-border';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const cardVariants: Record<CardVariant, string> = {
  default:
    'border-[var(--border)] bg-gradient-to-b from-white/[0.04] to-transparent bg-[var(--card-bg)] shadow-[0_12px_32px_-16px_rgba(0,0,0,0.8)]',
  glass:
    'border-white/15 bg-white/[0.06] backdrop-blur-md shadow-[0_12px_32px_-16px_rgba(0,0,0,0.8)]',
  'glow-border':
    'border-[var(--accent-gold)]/40 bg-[var(--card-bg)] shadow-[0_0_24px_-8px_var(--accent-gold)]',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border text-[var(--foreground)] transition-transform duration-300 will-change-transform motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.01]',
        cardVariants[variant],
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-[var(--foreground)]',
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
