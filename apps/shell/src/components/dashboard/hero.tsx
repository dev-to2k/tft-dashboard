'use client';

import { useRouter } from 'next/navigation';
import { useMetaStats } from '@tft/api';
import { Button } from '@tft/ui';

export function Hero() {
  const router = useRouter();
  const { overview, isLoading } = useMetaStats();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card-bg)] to-[var(--background)] p-8 lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--accent-gold)_0%,_transparent_50%)] opacity-[0.07]" />
      <div className="relative">
        {isLoading || !overview ? (
          <div className="h-5 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
        ) : (
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent-gold-text)]">
            Set {overview.setNumber} &mdash; {overview.setName} &middot; Patch{' '}
            {overview.patchId}
          </p>
        )}
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--foreground)] lg:text-5xl">
          TFT Dashboard
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Your all-in-one Teamfight Tactics companion. Track the meta, explore
          champions and traits, and build winning compositions.
          {overview && !isLoading
            ? ` Based on ${overview.totalGames.toLocaleString('en-US')} ranked matches.`
            : ''}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push('/meta')}
          >
            Explore the Meta
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/builder')}
          >
            Open Team Builder
          </Button>
        </div>
      </div>
    </section>
  );
}
