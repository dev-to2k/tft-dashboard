'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMetaStats, useStaticData } from '@tft/api';
import { Button, TierBadge, tierVar } from '@tft/ui';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';

const MAX_SLIDES = 5;
const AUTOPLAY_MS = 6000;

/**
 * Live meta spotlight slider. Slides are built from the current top comps,
 * so the banner art (carry splash) and rankings follow the meta automatically.
 */
export function HeroShowcase() {
  const router = useRouter();
  const { comps, overview, isLoading, isError, refetch } = useMetaStats();
  const { data: staticData } = useStaticData();
  const { dict, numberLocale } = useDictionary();
  const mounted = useMounted();

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = comps.slice(0, MAX_SLIDES);
  const showSkeleton = !mounted || isLoading || slides.length === 0;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setActive(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  // Autoplay (client-only effect: never affects SSR/hydration).
  useEffect(() => {
    if (reducedMotion || paused || slides.length < 2) return;
    timerRef.current = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, paused, slides.length]);

  // Keep the active index in range when the meta payload changes.
  useEffect(() => {
    setActive((current) => (slides.length === 0 ? 0 : current % slides.length));
  }, [slides.length]);

  const iconByName = new Map(
    (staticData?.champions ?? []).map((champion) => [champion.name, champion.iconUrl]),
  );
  const splashByName = new Map(
    (staticData?.champions ?? []).map((champion) => [champion.name, champion.splashUrl]),
  );

  if (showSkeleton) {
    return (
      <section
        aria-label={dict.home.trending}
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-8 lg:p-12"
      >
        <div className="h-5 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
        <div className="mt-3 h-12 w-2/3 animate-pulse rounded bg-[var(--foreground)]/10" />
        <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-[var(--foreground)]/10" />
        <div className="mt-6 flex gap-3">
          <div className="h-10 w-36 animate-pulse rounded-md bg-[var(--foreground)]/10" />
          <div className="h-10 w-36 animate-pulse rounded-md bg-[var(--foreground)]/10" />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center lg:p-12">
        <p className="text-sm text-muted-foreground">{dict.stats.loadError}</p>
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
          {dict.common.retry}
        </Button>
      </section>
    );
  }

  const current = slides[active] ?? slides[0]!;
  const carryArt =
    splashByName.get(current.carry) ??
    splashByName.get(current.champions[0] ?? '') ??
    iconByName.get(current.carry) ??
    iconByName.get(current.champions[0] ?? '') ??
    '';

  return (
    <section
      aria-label={dict.home.trending}
      className="relative min-h-[540px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] lg:min-h-[600px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Carry splash art */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse 60% 90% at 85% 40%, ${tierVar[current.tier]}, transparent)` }}
        />
        {carryArt ? (
          <Image
            key={carryArt}
            src={carryArt}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-90 [mask-image:linear-gradient(to_right,transparent_30%,black_62%)]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--card-bg)] via-[var(--card-bg)]/40 to-transparent" />
      </div>

      <div className="relative flex min-h-[inherit] flex-col justify-center p-8 lg:p-16">
        <div className="flex flex-wrap items-center gap-2">
          <span className="animate-gold-shimmer rounded-full bg-[var(--accent-gold)] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[var(--gold-foreground)]">
            {dict.home.hotBadge} #{active + 1}
          </span>
          {overview ? (
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Set {overview.setNumber} &middot; Patch {overview.patchId}
            </p>
          ) : null}
          <TierBadge tier={current.tier} size="sm" />
        </div>

        <h1
          key={current.id}
          className="mt-4 max-w-3xl text-5xl font-black tracking-tight text-[var(--foreground)] lg:text-7xl"
        >
          {current.name}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
          {current.primaryTraits.slice(0, 3).join(' \u00B7 ')}
          {overview
            ? dict.home.rankedMatches(overview.totalGames.toLocaleString(numberLocale))
            : ''}
        </p>

        <div className="mt-4 flex flex-wrap gap-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{dict.comps.winRate}</p>
            <p className="text-2xl font-black text-[var(--accent-gold)]">
              {current.winRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{dict.comps.avgPlace}</p>
            <p className="text-2xl font-black text-[var(--foreground)]">
              {current.avgPlacement.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{dict.comps.top4}</p>
            <p className="text-2xl font-black text-[var(--foreground)]">
              {current.top4Rate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="primary" onClick={() => router.push('/meta')}>
            {dict.home.exploreMeta}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/builder')}>
            {dict.home.openBuilder}
          </Button>
        </div>

        {/* Controls */}
        {slides.length > 1 ? (
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label={dict.home.prevSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)]/80 text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
            >
              <span aria-hidden="true">&larr;</span>
            </button>
            <div className="flex gap-1.5" role="tablist" aria-label={dict.home.trending}>
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  aria-label={dict.home.goToSlide(index + 1)}
                  onClick={() => goTo(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === active
                      ? 'w-8 bg-[var(--accent-gold)]'
                      : 'w-3 bg-[var(--foreground)]/20 hover:bg-[var(--foreground)]/40'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label={dict.home.nextSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)]/80 text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
