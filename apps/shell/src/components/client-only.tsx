'use client';

import type { ReactNode } from 'react';
import { useMounted } from '@/hooks/use-mounted';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/** Render children only after client mount (identical SSR + first paint). */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const mounted = useMounted();
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
