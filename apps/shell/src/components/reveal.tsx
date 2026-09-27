'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms (kept small to stay snappy, max ~300ms). */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Scroll-triggered entrance (transform/opacity only).
 * SSR/first paint render without the animation class (content visible,
 * hydration-safe); the animation runs once the element scrolls into view.
 * Offscreen sections use content-visibility: auto to skip rendering work.
 * Respects prefers-reduced-motion: content appears instantly.
 */
export function Reveal({ children, delay = 0, className = '', style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setVisible(true);
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={`${visible ? 'reveal' : 'opacity-0'} ${className}`}
      style={
        {
          '--reveal-delay': `${reduced ? 0 : delay}ms`,
          contentVisibility: 'auto',
          containIntrinsicSize: 'auto 140px',
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
