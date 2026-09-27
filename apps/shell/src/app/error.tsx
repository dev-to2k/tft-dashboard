'use client';

import { useEffect } from 'react';
import { Button } from '@tft/ui';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error ]);

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
      <h2 className="text-xl font-bold text-[var(--foreground)]">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This section failed to load. Your team builder data is safe.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-6"
        onClick={() => reset()}
      >
        Try again
      </Button>
    </div>
  );
}
