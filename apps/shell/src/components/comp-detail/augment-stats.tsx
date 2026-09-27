'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useStaticData } from '@tft/api';
import { DataTable, type Column } from '@tft/ui';
import { fixed, intText, safeImageSrc, toArray } from '@tft/utils';
import { Reveal } from '@/components/reveal';
import { useAugmentStats } from '@/hooks/use-augment-stats';

type AugmentTier = 'prismatic' | 'gold' | 'silver';

const TIER_ORDER: Record<AugmentTier, number> = { prismatic: 0, gold: 1, silver: 2 };

const TIER_DOT: Record<AugmentTier, string> = {
  prismatic: 'bg-[#a855f7]',
  gold: 'bg-[var(--accent-gold)]',
  silver: 'bg-[#a1a1aa]',
};

function norm(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

interface EmblemRow {
  key: string;
  name: string;
  iconUrl: string;
  games: number;
  avg: number;
  winRate: number;
  top4Rate: number;
  trait: string;
}

interface StaticRow {
  id: string;
  name: string;
  tier: AugmentTier;
  description: string;
  iconUrl: string;
  fit: boolean;
}

type EmblemSortKey = 'avg' | 'winRate' | 'top4Rate' | 'games';
type StaticSortKey = 'name' | 'tier';

interface AugmentStatsProps {
  /** Localized primary trait names from CompMetaStats. */
  primaryTraits: string[];
  locale: string;
}

const MIN_EMBLEM_GAMES = 500;

/**
 * Augment recommendations for a comp. Upstream exposes no per-augment
 * win rates, so stats come from the one honest source available: trait
 * emblem placement histograms (`/tft-stat-api/items`) for the comp's
 * own traits — plus the full static augment list with tier filters.
 */
export function AugmentStats({ primaryTraits, locale }: AugmentStatsProps) {
  const { data: staticData } = useStaticData();
  const { rows: statRows } = useAugmentStats();
  const isVi = locale.startsWith('vi');

  const [tierFilter, setTierFilter] = useState<AugmentTier | null>(null);
  const [emblemSort, setEmblemSort] = useState<{ key: EmblemSortKey; dir: 'asc' | 'desc' }>({
    key: 'avg',
    dir: 'asc',
  });
  const [staticSort, setStaticSort] = useState<{ key: StaticSortKey; dir: 'asc' | 'desc' }>({
    key: 'tier',
    dir: 'asc',
  });

  // Localized trait name -> stable English slug (slugs stay English-derived).
  const slugByTraitName = useMemo(
    () => new Map(toArray(staticData?.traits).map((trait) => [trait.name, trait.slug])),
    [staticData],
  );
  const traitSlugs = useMemo(
    () =>
      toArray(primaryTraits)
        .map((name) => ({ name, slug: slugByTraitName.get(name) ?? norm(name) }))
        .filter((entry) => entry.slug),
    [primaryTraits, slugByTraitName],
  );

  const emblems = useMemo<EmblemRow[]>(() => {
    if (traitSlugs.length === 0 || statRows.length === 0) return [];
    const iconBySlug = new Map(
      toArray(staticData?.items).map((item) => [norm(item.slug), safeImageSrc(item.iconUrl)]),
    );
    const output: EmblemRow[] = [];
    for (const { name: trait, slug } of traitSlugs) {
      const slugNorm = norm(slug);
      if (!slugNorm) continue;
      const hit = statRows.find((row) => {
        const key = norm(row.name).replace(/augment/g, '');
        return key.includes(`emblem${slugNorm}`) || key === `emblem${slugNorm}`;
      });
      if (!hit || hit.games < MIN_EMBLEM_GAMES) continue;
      const buckets = toArray<number>(hit.places).slice(0, 8);
      const games = buckets.reduce((sum, value) => sum + value, 0) || 1;
      const wins = buckets[0] ?? 0;
      const top4 = buckets.slice(0, 4).reduce((sum, value) => sum + value, 0);
      const avg = buckets.reduce((sum, value, index) => sum + value * (index + 1), 0) / games;
      output.push({
        key: hit.name,
        name: isVi ? `Ấn ${trait}` : `${trait} Emblem`,
        iconUrl: iconBySlug.get(`emblem${slugNorm}`) ?? iconBySlug.get(`${slugNorm}emblem`) ?? '',
        games: hit.games,
        avg: round1(avg * 10) / 10,
        winRate: round1((wins / games) * 100),
        top4Rate: round1((top4 / games) * 100),
        trait,
      });
    }
    const dir = emblemSort.dir === 'asc' ? 1 : -1;
    return output.sort((a, b) => (a[emblemSort.key] - b[emblemSort.key]) * dir);
  }, [traitSlugs, statRows, staticData, emblemSort, isVi]);

  const statics = useMemo<StaticRow[]>(() => {
    const augments = staticData?.augments ?? [];
    const slugSet = new Set(traitSlugs.map((entry) => norm(entry.slug)));
    const rows = augments.map((augment) => {
      const slugNorm = norm(augment.slug);
      const fit = [...slugSet].some(
        (trait) => trait !== '' && (slugNorm.includes(trait) || trait.includes(slugNorm)),
      );
      return {
        id: augment.id,
        name: augment.name,
        tier: augment.tier,
        description: augment.description,
        iconUrl: augment.iconUrl,
        fit,
      };
    });
    const filtered = tierFilter ? rows.filter((row) => row.tier === tierFilter) : rows;
    const dir = staticSort.dir === 'asc' ? 1 : -1;
    return filtered.sort((a, b) => {
      if (staticSort.key === 'tier') {
        return (TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || Number(b.fit) - Number(a.fit)) * dir;
      }
      return a.name.localeCompare(b.name) * dir;
    });
  }, [staticData, traitSlugs, tierFilter, staticSort]);

  const tierLabel = (tier: AugmentTier) =>
    isVi
      ? tier === 'prismatic'
        ? 'Lăng kính'
        : tier === 'gold'
          ? 'Vàng'
          : 'Bạc'
      : tier.charAt(0).toUpperCase() + tier.slice(1);

  const emblemColumns: Column<EmblemRow>[] = [
    {
      key: 'name',
      header: isVi ? 'Ấn hệ' : 'Emblem',
      render: (row) => (
        <span className="flex items-center gap-2">
          {row.iconUrl ? (
            <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-md">
              <Image src={row.iconUrl} alt="" fill sizes="28px" loading="lazy" className="object-cover" />
            </span>
          ) : null}
          <span className="font-bold">{row.name}</span>
          <span className="rounded-full bg-[var(--accent-gold)]/15 px-2 py-0.5 text-[10px] font-black text-[var(--accent-gold)]">
            {isVi ? 'Hợp đội hình' : 'Comp fit'}
          </span>
        </span>
      ),
    },
    { key: 'avg', header: isVi ? 'Hạng TB' : 'Avg', sortable: true, className: 'text-right tabular-nums', render: (row) => fixed(row.avg, 2) },
    { key: 'winRate', header: isVi ? 'Thắng' : 'Win', sortable: true, className: 'text-right tabular-nums', render: (row) => `${fixed(row.winRate, 1)}%` },
    { key: 'top4Rate', header: 'Top 4', sortable: true, className: 'text-right tabular-nums', render: (row) => `${fixed(row.top4Rate, 1)}%` },
    { key: 'games', header: isVi ? 'Trận' : 'Games', sortable: true, className: 'text-right tabular-nums', render: (row) => intText(row.games, locale) },
  ];

  const staticColumns: Column<StaticRow>[] = [
    {
      key: 'name',
      header: isVi ? 'Lõi' : 'Augment',
      sortable: true,
      render: (row) => (
        <span className="flex max-w-md items-center gap-2">
          {row.iconUrl ? (
            <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-md">
              <Image src={row.iconUrl} alt="" fill sizes="28px" loading="lazy" className="object-cover" />
            </span>
          ) : null}
          <span className="min-w-0">
            <span className="block truncate font-bold">
              {row.name}
              {row.fit ? (
                <span className="ml-2 rounded-full bg-[var(--accent-blue)]/15 px-2 py-0.5 text-[10px] font-black text-[var(--accent-blue)]">
                  {isVi ? 'Hợp đội hình' : 'Comp fit'}
                </span>
              ) : null}
            </span>
            {row.description ? (
              <span className="block truncate text-xs font-normal text-muted-foreground">{row.description}</span>
            ) : null}
          </span>
        </span>
      ),
    },
    {
      key: 'tier',
      header: isVi ? 'Bậc' : 'Tier',
      sortable: true,
      render: (row) => (
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <span className={`h-2 w-2 rounded-full ${TIER_DOT[row.tier]}`} aria-hidden="true" />
          {tierLabel(row.tier)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {emblems.length > 0 ? (
        <Reveal>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
            <p className="border-b border-[var(--border)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isVi ? 'Ấn hệ của đội hình — tỉ lệ thật' : 'Comp emblems — live rates'}
            </p>
            <DataTable
              columns={emblemColumns}
              data={emblems}
              sortKey={emblemSort.key}
              sortDirection={emblemSort.dir}
              onSort={(key, direction) => setEmblemSort({ key: key as EmblemSortKey, dir: direction })}
              emptyMessage={isVi ? 'Chưa có dữ liệu.' : 'No data.'}
            />
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={80}>
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isVi ? `Tất cả lõi (${statics.length})` : `All augments (${statics.length})`}
            </p>
            <div className="flex gap-1.5" role="group" aria-label={isVi ? 'Lọc theo bậc' : 'Filter by tier'}>
              {(['prismatic', 'gold', 'silver'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setTierFilter(tierFilter === tier ? null : tier)}
                  aria-pressed={tierFilter === tier}
                  title={tierLabel(tier)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-95 ${
                    tierFilter === tier
                      ? 'bg-[var(--accent-gold)] text-[var(--gold-foreground)]'
                      : 'border border-[var(--border)] bg-[var(--background)] text-muted-foreground hover:text-[var(--foreground)]'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${tierFilter === tier ? 'bg-current' : TIER_DOT[tier]}`} aria-hidden="true" />
                  {tierLabel(tier)}
                </button>
              ))}
            </div>
          </div>
          <DataTable
            columns={staticColumns}
            data={statics}
            sortKey={staticSort.key}
            sortDirection={staticSort.dir}
            onSort={(key, direction) => setStaticSort({ key: key as StaticSortKey, dir: direction })}
            emptyMessage={isVi ? 'Không có lõi nào khớp bộ lọc.' : 'No augments match the filter.'}
          />
          <p className="border-t border-[var(--border)] px-4 py-2 text-[11px] text-muted-foreground">
            {isVi
              ? 'Bảng ấn dùng histogram thật từ MetaTFT; tỉ lệ thắng riêng từng lõi không có sẵn upstream nên danh sách lõi dùng dữ liệu tĩnh.'
              : 'Emblem rates use live MetaTFT histograms; per-augment win rates are not published upstream, so the augment list uses static data.'}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
