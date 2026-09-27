import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MetaFilterBar } from '@/components/meta-filter-bar';

export const metadata: Metadata = {
  title: 'Meta Overview — TFT Dashboard',
  description:
    'Live TFT meta tier lists, champion win rates, and top compositions for the current patch.',
};

/**
 * Filter-bar placeholder. `MetaFilterBar` reads `useSearchParams` and the
 * preferences store; a `Suspense` boundary without a fallback falls back to
 * rendering nothing, which produced a layout jump (and, on a cold navigate,
 * a blank frame) before the bar hydrated. An explicit skeleton keeps the
 * layout height stable and degrades gracefully if the chunk is still loading.
 */
function MetaFilterBarFallback() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3"
    >
      <div className="h-8 w-32 animate-pulse rounded-lg bg-[var(--foreground)]/10" />
      <div className="h-8 w-24 animate-pulse rounded-lg bg-[var(--foreground)]/10" />
      <div className="h-8 w-24 animate-pulse rounded-lg bg-[var(--foreground)]/10" />
      <div className="ml-auto h-8 w-28 animate-pulse rounded-lg bg-[var(--foreground)]/10" />
    </div>
  );
}

export default function MetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<MetaFilterBarFallback />}>
        <MetaFilterBar />
      </Suspense>

      {children}
    </div>
  );
}
