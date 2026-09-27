'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

/**
 * Lazy-load the heavy WikiHeader (react-query + store + dictionaries +
 * next/image avatar collage) in its own chunk with SSR disabled.
 *
 * `app/wiki/layout.tsx` stays a pure Server Component whose only static
 * client reference is this tiny, stable slot. That keeps the layout chunk
 * hash stable across data/UI changes and prevents ChunkLoadError on
 * `wiki/layout.js` from stale chunk manifests. A header chunk failure only
 * shows the skeleton fallback instead of breaking the whole wiki segment.
 */
const WikiHeaderFallback = () => (
  <div
    aria-hidden="true"
    className="rounded-xl border border-[var(--border)] bg-gradient-to-r from-[var(--card-bg)] to-[var(--background)] p-6"
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="h-7 w-40 animate-pulse rounded bg-[var(--foreground)]/10" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
      </div>
      <div className="flex">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-12 animate-pulse rounded-full bg-[var(--foreground)]/10 ring-2 ring-[var(--card-bg)] [&:not(:first-child)]:-ml-3"
          />
        ))}
      </div>
    </div>
  </div>
);

const WikiHeaderLazy = dynamic(
  () => import('@/components/wiki-header').then((m) => m.WikiHeader),
  {
    ssr: false,
    loading: () => <WikiHeaderFallback />,
  },
);

/**
 * `<Suspense>` around the dynamic header: the lazy component resolves its own
 * `useSearchParams`/query suspense, and without a boundary that throw used to
 * bubble to the segment root and blank the page on a cold navigate. The
 * boundary is a no-op on the happy path (it only renders during suspense).
 */
export function WikiHeaderSlot() {
  return (
    <Suspense fallback={<WikiHeaderFallback />}>
      <WikiHeaderLazy />
    </Suspense>
  );
}
