'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMetaStats, useStaticData } from '@tft/api';
import { Button, TierBadge, tierVar } from '@tft/ui';
import { safeImageSrc, fixed, intText, toArray } from '@tft/utils';
import { useDictionary } from '@/i18n/use-dictionary';
import { IMAGE_BLUR_DATA_URL } from '../image-placeholder';
import { useMounted } from '@/hooks/use-mounted';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useCountUp } from '@/hooks/use-count-up';

const MAX_SLIDES = 5;
const AUTOPLAY_MS = 6000;

// Display face for hero titles (system stack, no webfont download).
const DISPLAY_FONT = "'Space Grotesk','Be Vietnam Pro',Inter,system-ui,sans-serif";

/**
 * Live meta spotlight slider. Slides are built from the current top comps,
 * so the banner art (carry splash) and rankings follow the meta automatically.
 * Art crossfades with opacity only (no large-image translate); text uses a
 * small fade-slide. Stats count up via rAF and respect reduced-motion.
 */
export function HeroShowcase() {
  const router = useRouter();
  const { comps, overview, isLoading, isError, refetch } = useMetaStats();
  const { data: staticData } = useStaticData();
  const { dict, numberLocale } = useDictionary();
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Upstream splash tiles (e.g. Nidalee) can time out — remember failed URLs
  // so the layer falls back to the square icon, then to the local gradient.
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(() => new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = comps.slice(0, MAX_SLIDES);
  const showSkeleton = !mounted || isLoading || slides.length === 0;

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

  // Only allowlisted remote URLs reach <Image>; anything else is dropped so
  // `next/image` cannot throw on an unconfigured hostname.
  const iconByName = new Map(
    toArray(staticData?.champions).map((champion) => [champion.name, safeImageSrc(champion.iconUrl)]),
  );
  const splashByName = new Map(
    toArray(staticData?.champions).map((champion) => [champion.name, safeImageSrc(champion.splashUrl)]),
  );

  const markFailed = useCallback((url: string) => {
    if (!url) return;
    setFailedUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);

  const artFor = useCallback(
    (carry: string, first: string) => {
      const splash = splashByName.get(carry) ?? splashByName.get(first) ?? '';
      if (splash && !failedUrls.has(splash)) return splash;
      const icon = iconByName.get(carry) ?? iconByName.get(first) ?? '';
      if (icon && !failedUrls.has(icon)) return icon;
      // Every upstream URL failed — caller renders nothing and the local
      // gradient underneath remains as the fallback.
      return '';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [staticData, failedUrls],
  );

  const current = slides[active] ?? slides[0];

  // Count-up hero stats (rAF 800ms, instant when reduced-motion).
  const winRateTarget = current?.winRate ?? 0;
  const top4Target = current?.top4Rate ?? 0;
  const avgTarget = current?.avgPlacement ?? 0;
  const winRate = useCountUp(winRateTarget, { duration: 800, decimals: 1, enabled: !showSkeleton });
  const top4Rate = useCountUp(top4Target, { duration: 800, decimals: 1, enabled: !showSkeleton });
  const avgPlace = useCountUp(avgTarget, { duration: 800, decimals: 2, enabled: !showSkeleton });

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

  if (!current) return null;

  return (
    <section
      aria-label={dict.home.trending}
      className="relative min-h-[540px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] lg:min-h-[600px]"
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 560px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Carry splash art — stacked layers crossfade via opacity only */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 55% 60% at 82% 22%, rgba(168,85,247,0.28), transparent 70%), radial-gradient(ellipse 50% 55% at 72% 85%, rgba(10,200,185,0.18), transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse 60% 90% at 85% 40%, ${tierVar[current.tier] ?? 'var(--tier-b)'}, transparent)` }}
        />
        {slides.map((slide, index) => {
          const art = artFor(slide.carry, toArray<string>(slide.champions)[0] ?? '');
          if (!art) return null;
          const isActive = index === active;
          return (
            <Image
              key={slide.id}
              src={art}
              alt=""
              fill
              priority={index === 0}
              fetchPriority={index === 0 ? 'high' : 'low'}
              loading={index === 0 ? undefined : 'lazy'}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
              quality={70}
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              onError={() => markFailed(art)}
              aria-hidden={!isActive}
              className={`object-cover object-center transition-opacity duration-700 ease-out [mask-image:linear-gradient(to_right,transparent_30%,black_62%)] ${
                isActive ? 'opacity-90' : 'opacity-0'
              }`}
            />
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--card-bg)] via-[var(--card-bg)]/40 to-transparent" />
      </div>

      <div className="relative flex min-h-[inherit] flex-col justify-center p-8 lg:p-16" style={{ padding: 'var(--hero-pad)' }}>
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

        <div key={current.id} className={reducedMotion ? '' : 'slide-enter'}>
          <h1
            className="hero-title mt-4 max-w-3xl font-black uppercase text-[var(--foreground)]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {current.name}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
            {toArray(current.primaryTraits).slice(0, 3).join(' \u00B7 ')}
            {overview
              ? dict.home.rankedMatches(intText(overview.totalGames, numberLocale))
              : ''}
          </p>

          <div className="mt-4 flex flex-wrap gap-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{dict.comps.winRate}</p>
              <p className="text-2xl font-black tabular-nums text-[var(--accent-gold)]">
                {fixed(winRate, 1)}%
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{dict.comps.avgPlace}</p>
              <p className="text-2xl font-black tabular-nums text-[var(--foreground)]">
                {fixed(avgPlace, 2)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{dict.comps.top4}</p>
              <p className="text-2xl font-black tabular-nums text-[var(--foreground)]">
                {fixed(top4Rate, 1)}%
              </p>
            </div>
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

        {/* Controls — dots glow on active */}
        {slides.length > 1 ? (
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label={dict.home.prevSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)]/80 text-[var(--foreground)] transition-[color,border-color,opacity] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
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
                  className={`h-1.5 rounded-full transition-[width,opacity,background-color,box-shadow] duration-300 ${
                    index === active
                      ? 'w-8 bg-[var(--accent-gold)] opacity-100 shadow-[0_0_10px_var(--accent-gold)/60]'
                      : 'w-3 bg-[var(--foreground)]/20 opacity-70 hover:bg-[var(--foreground)]/40 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label={dict.home.nextSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)]/80 text-[var(--foreground)] transition-[color,border-color,opacity] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
