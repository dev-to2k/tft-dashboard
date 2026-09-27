'use client';

import { useEffect } from 'react';

/**
 * Wiki segment error boundary. ChunkLoadError (stale `wiki/layout.js` chunk
 * after a redeploy) previously blank-screened the whole wiki — this shows a
 * retry UI instead. `reset()` re-renders the segment and re-requests chunks.
 */
export default function WikiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Wiki segment error:', error);
  }, [error]);

  const isChunkError =
    error?.name === 'ChunkLoadError' ||
    /chunk|loading/i.test(error?.message ?? '');

  return (
    <div
      role="alert"
      className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center"
    >
      <h2 className="text-lg font-bold text-[var(--foreground)]">
        {isChunkError
          ? 'A new version was just deployed — please reload.'
          : 'Something went wrong loading the wiki.'}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {isChunkError
          ? 'The app updated in the background and the old page chunk expired.'
          : error?.message || 'Please try again.'}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[var(--accent-gold)] px-4 py-2 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}
