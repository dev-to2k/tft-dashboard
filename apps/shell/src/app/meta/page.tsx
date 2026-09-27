'use client';

import { Suspense, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMetaStats, useStaticData } from '@tft/api';
import { useTryComp } from '@/hooks/use-try-comp';
import { usePreferencesStore } from '@tft/store';
import { Button, LoadingSkeleton, TierBadge, tierVar, type Tier } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';
import { CompSpotlight } from '@/components/comp-spotlight';
import { TierChips } from '@/components/tier-chips';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';
import { setOrDelete, useSyncSearchParams } from '@/hooks/use-sync-search-params';
import type { CompMetaStats } from '@tft/types';

const TIERS = ['S', 'A', 'B', 'C', 'D'] as const;

function isTier(value: string | null): value is Tier {
  return value !== null && (TIERS as readonly string[]).includes(value);
}

function MetaOverviewContent() {
  const params = useSearchParams();
  const eloBracket = usePreferencesStore((s) => s.eloBracket);
  const { champions, comps, overview, isLoading, isError, error, refetch } =
    useMetaStats({ eloBracket });
  const { data: staticData } = useStaticData();
  const { dict, numberLocale } = useDictionary();
  const mounted = useMounted();
  const showLoading = !mounted || isLoading;
  const data = mounted ? overview : undefined;
  const [tierFilter, setTierFilter] = useState<Tier | null>(() => {
    const initial = params.get('tier');
    return isTier(initial) ? initial : null;
  });
  const [spotlight, setSpotlight] = useState<CompMetaStats | null>(null);

  const merged = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    setOrDelete(next, 'tier', tierFilter);
    return next.toString();
  }, [params, tierFilter]);
  useSyncSearchParams(merged);

  const visibleChampions = tierFilter ? champions.filter((c) => c.tier === tierFilter) : champions;
  const topChampions = visibleChampions.slice(0, 8);
  const patch = data?.patchId ?? 'latest';
  const topComps = comps.slice(0, 3);
  const bestComp = comps[0];

  const splashByName = new Map(
    (staticData?.champions ?? []).map((champion) => [champion.name, champion.splashUrl]),
  );
  const iconByName = new Map(
    (staticData?.champions ?? []).map((champion) => [champion.name, champion.iconUrl]),
  );

  const bestArt = bestComp
    ? (splashByName.get(bestComp.carry) ?? splashByName.get(bestComp.champions[0] ?? '') ?? '')
    : '';

  const maxWinRate = Math.max(1, ...topChampions.map((c) => c.winRate));

  const tryCompInBuilder = useTryComp();

  return (
    <div className="space-y-8">
      {/* Banner with #1 comp art */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {!showLoading && bestComp ? (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(ellipse 55% 90% at 88% 40%, ${tierVar[bestComp.tier]}, transparent)`,
              }}
            />
          ) : null}
          {!showLoading && bestArt ? (
            <Image
              src={bestArt}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-70 [mask-image:linear-gradient(to_right,transparent_35%,black_70%)]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--card-bg)] via-[var(--card-bg)]/50 to-transparent" />
        </div>
        <div className="relative p-6 lg:p-10">
          <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] lg:text-4xl">
            {dict.meta.title}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {dict.meta.subtitle(patch)}
          </p>
          {data ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {dict.meta.setLine(
                data.setNumber,
                data.setName,
                data.totalGames.toLocaleString(numberLocale),
              )}
            </p>
          ) : null}
          {!showLoading && bestComp ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <TierBadge tier={bestComp.tier} size="md" />
              <span className="text-lg font-black text-[var(--foreground)]">
                {bestComp.name}
              </span>
              <span className="text-sm font-bold text-[var(--accent-gold)]">
                {bestComp.winRate.toFixed(1)}% WR
              </span>
              <Button type="button" variant="outline" size="sm" onClick={() => tryCompInBuilder(bestComp)}>
                {dict.meta.tryInBuilder}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
          <p className="font-semibold text-[var(--foreground)]">
            {dict.meta.loadError}
          </p>
          {error ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {error.message}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void refetch();
            }}
          >
            {dict.common.retry}
          </Button>
        </div>
      ) : null}

      {/* Top Comps */}
      {!showLoading && !isError && topComps.length > 0 ? (
        <section aria-labelledby="meta-top-comps-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="meta-top-comps-heading" className="text-lg font-bold text-[var(--foreground)]">
              {dict.meta.topComps}
            </h2>
            <Link
              href="/meta/champions"
              className="rounded text-sm font-medium text-[var(--accent-gold)] hover:text-[var(--accent-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {dict.meta.fullTierList}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {topComps.map((comp, index) => (
              <div
                key={comp.id}
                className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--accent-gold)]/30 hover:shadow-md"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${tierVar[comp.tier]}, transparent)` }}
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    #{index + 1}
                  </p>
                  <TierBadge tier={comp.tier} size="sm" />
                </div>
                <h3 className="mt-1 truncate text-base font-bold text-[var(--foreground)]">
                  {comp.name}
                </h3>
                <div className="mt-2 flex gap-1">
                  {comp.champions.slice(0, 6).map((name) => (
                    <ChampionAvatar
                      key={name}
                      name={name}
                      iconUrl={iconByName.get(name) ?? ''}
                      size="sm"
                      className="rounded-md"
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-[var(--accent-gold)]">
                    {comp.winRate.toFixed(1)}% WR
                    <span className="ml-2 font-normal text-muted-foreground">
                      {comp.avgPlacement.toFixed(2)} avg
                    </span>
                  </p>
                  <div className="flex gap-1.5">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSpotlight(comp)}>
                      {dict.meta.details}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => tryCompInBuilder(comp)}>
                      {dict.meta.tryInBuilder}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Champion Grid */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {dict.meta.topChampions}
          </h2>
          <div className="flex items-center gap-1.5">
            <TierChips
              value={tierFilter}
              onChange={setTierFilter}
              label={dict.common.tier}
              tierLabel={(tier) => `${dict.common.tier} ${tier}`}
            />
            <Link
              href="/meta/champions"
              className="rounded text-sm font-medium text-[var(--accent-gold)] hover:text-[var(--accent-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {dict.meta.fullTierList}
            </Link>
          </div>
        </div>
        {showLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : !isError ? (
          champions.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {dict.meta.empty}
            </p>
          ) : (
            <ol className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
              {topChampions.map((champ, index) => (
                <li key={champ.championId} className={index > 0 ? 'border-t border-[var(--border)]' : ''}>
                  <Link
                    href={`/wiki/champions?q=${encodeURIComponent(champ.name)}`}
                    className="group flex items-center gap-3 p-3 transition-colors hover:bg-[var(--accent-gold)]/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] sm:gap-4 sm:p-4"
                  >
                    <span className="w-8 shrink-0 text-center text-sm font-black tabular-nums text-muted-foreground group-hover:text-[var(--accent-gold)]">
                      #{tierFilter ? index + 1 : champions.indexOf(champ) + 1}
                    </span>
                    <ChampionAvatar
                      name={champ.name}
                      iconUrl={champ.iconUrl}
                      cost={champ.cost}
                      size="md"
                      className="rounded-lg"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-bold text-[var(--foreground)]">
                          {champ.name}
                        </span>
                        <TierBadge tier={champ.tier} size="sm" />
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--background)] sm:max-w-xs">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${(champ.winRate / maxWinRate) * 100}%`,
                              background: tierVar[champ.tier],
                            }}
                          />
                        </span>
                        <span className="shrink-0 text-xs font-bold text-[var(--accent-gold)]">
                          {champ.winRate.toFixed(1)}%
                        </span>
                        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                          {champ.avgPlacement.toFixed(2)} avg
                        </span>
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:text-[var(--accent-gold)] group-hover:opacity-100"
                    >
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )
        ) : null}
      </div>
      <CompSpotlight comp={spotlight} onClose={() => setSpotlight(null)} />
    </div>
  );
}

export default function MetaOverviewPage() {
  return (
    <Suspense>
      <MetaOverviewContent />
    </Suspense>
  );
}
