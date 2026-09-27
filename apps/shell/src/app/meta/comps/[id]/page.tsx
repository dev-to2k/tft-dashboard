'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMetaStats, useStaticData } from '@tft/api';
import { usePreferencesStore } from '@tft/store';
import { Button, LoadingSkeleton, TierBadge } from '@tft/ui';
import { fixed, intText, percent, safeImageSrc, safeNumber, toArray, toText } from '@tft/utils';
import { ChampionAvatar } from '@/components/champion-avatar';
import { Reveal } from '@/components/reveal';
import { CompBoardPreview } from '@/components/comp-detail/comp-board-preview';
import { PlacementHistogram } from '@/components/comp-detail/placement-histogram';
import { BisItems } from '@/components/comp-detail/bis-items';
import { AugmentStats } from '@/components/comp-detail/augment-stats';
import { useCompDetail } from '@/hooks/use-comp-detail';
import { useCountUp } from '@/hooks/use-count-up';
import { useMounted } from '@/hooks/use-mounted';
import { useTryComp } from '@/hooks/use-try-comp';
import { useDictionary, useLocale } from '@/i18n/use-dictionary';
import { safeDecodeParam, safeFindBy } from '@/lib/safe-param';

type TabId = 'overview' | 'leveling' | 'positioning';

const STR = {
  en: {
    back: 'Meta overview',
    tabs: { overview: 'Overview', leveling: 'Leveling', positioning: 'Positioning' } as Record<TabId, string>,
    tryInBuilder: 'Try in builder',
    stats: { win: 'Win rate', top4: 'Top 4', avg: 'Avg place', games: 'Games', pick: 'Pick rate' },
    boardTitle: 'Board preview',
    starNote: '★3 = commonly 3-starred · gold rim = carry',
    histoTitle: 'Placement Top1–8',
    bisTitle: 'Best-in-slot items',
    bisSub: 'Most-played 3-item builds per unit (MetaTFT `builds`) — hover an item for its combine recipe.',
    augTitle: 'Augments',
    levelTitle: 'Leveling plan',
    trendTitle: 'Last 7 days',
    trendPick: 'pick',
    guideTitle: 'How to play this style',
    posTitle: 'Suggested positioning',
    posSub: 'Tanks hold the front rows, the carry stays protected in the backline corners.',
    frontline: 'Frontline',
    backline: 'Backline',
    loadError: 'Couldn’t load comp stats.',
    notFound: 'This comp is no longer tracked in the current meta.',
    browse: 'Browse meta comps',
  },
  vi: {
    back: 'Tổng quan Meta',
    tabs: { overview: 'Tổng quan', leveling: 'Lên cấp', positioning: 'Xếp cờ' } as Record<TabId, string>,
    tryInBuilder: 'Thử trong Builder',
    stats: { win: 'Tỉ lệ thắng', top4: 'Top 4', avg: 'Hạng TB', games: 'Số trận', pick: 'Tỉ lệ chọn' },
    boardTitle: 'Xem trước bàn cờ',
    starNote: '★3 = thường lên 3 sao · viền vàng = chủ lực',
    histoTitle: 'Phân bố hạng Top1–8',
    bisTitle: 'Trang bị chuẩn (BIS)',
    bisSub: 'Bộ 3 trang bị phổ biến nhất mỗi tướng (MetaTFT `builds`) — di chuột vào trang bị để xem công thức ghép.',
    augTitle: 'Lõi công nghệ',
    levelTitle: 'Lộ trình lên cấp',
    trendTitle: '7 ngày gần nhất',
    trendPick: 'tỉ lệ chọn',
    guideTitle: 'Cách chơi theo lối này',
    posTitle: 'Gợi ý xếp cờ',
    posSub: 'Tank giữ hàng trên, chủ lực nấp ở góc hàng dưới được bảo kê.',
    frontline: 'Hàng tank',
    backline: 'Hàng sau',
    loadError: 'Không tải được chỉ số đội hình.',
    notFound: 'Đội hình này không còn được theo dõi trong meta hiện tại.',
    browse: 'Xem đội hình meta',
  },
};

function levelingKey(levelling: string): 'fast9' | 'fast8' | 'reroll' | 'standard' {
  const text = levelling.toLowerCase();
  if (text.includes('9')) return 'fast9';
  if (text.includes('reroll') || text.includes('slow') || text.includes('6') || text.includes('7'))
    return 'reroll';
  if (text.includes('8')) return 'fast8';
  return 'standard';
}

/** Guide steps are static copy; a missing locale falls back to English. */
function guideSteps(guide: Record<string, string[]>, locale: string): string[] {
  return toArray(guide[locale] ?? guide.en);
}

const GUIDES: Record<string, { en: string[]; vi: string[] }> = {
  fast9: {
    en: ['Econ hard: stay above 50g from 2-1, take econ augments.', 'Level 8 at 4-1, stabilize with a placeholder carry.', 'Level 9 at 5-1+, then roll down for the full legendary board.'],
    vi: ['Eco cứng: giữ trên 50v từ 2-1, ưu tiên lõi kinh tế.', 'Lên 8 ở 4-1, def bằng carry tạm để giữ máu.', 'Lên 9 ở 5-1+, sau đó xả tiền hoàn thiện khung bài.'],
  },
  fast8: {
    en: ['Play strongest board while saving to 50g.', 'Level 8 at 4-1 or 4-2, then roll to 30g for core upgrades.', 'Push 9 only when healthy or after hitting key 2-star carries.'],
    vi: ['Đánh khung mạnh nhất có thể trong khi tích 50v.', 'Lên 8 ở 4-1 hoặc 4-2, roll về còn ~30v để nâng cấp khung.', 'Chỉ lên 9 khi còn nhiều máu hoặc đã 2 sao chủ lực.'],
  },
  reroll: {
    en: ['Lose- or win-streak the opener, never level aggressively.', 'Slow-roll above 50g at level 6/7 for the 3-star core.', 'Push levels only after hitting, then cap with supporting units.'],
    vi: ['Giữ chuỗi thắng/thua từ đầu, không ham lên cấp sớm.', 'Slow-roll trên 50v ở cấp 6/7 để 3 sao chủ lực.', 'Chỉ lên cấp sau khi ra bài, rồi kẹp thêm tướng phụ.'],
  },
  standard: {
    en: ['Follow the standard curve: level 6 at 3-2, 7 at 4-1.', 'Roll lightly at 7 to stabilize, then econ back up.', 'Cap the board at 8 with upgraded 4-cost carries.'],
    vi: ['Đi đúng nhịp: cấp 6 ở 3-2, cấp 7 ở 4-1.', 'Roll nhẹ ở 7 để def, rồi eco lại tiền.', 'Hoàn thiện bài ở cấp 8 với carry 4 tiền 2 sao.'],
  },
};

function CompDetailContent() {
  const params = useParams<{ id: string }>();
  // Never `decodeURIComponent` a raw segment without a guard: a malformed
  // escape throws `URIError` mid-render and takes the whole page down.
  const id = safeDecodeParam(params.id);
  const locale = useLocale();
  const { dict, numberLocale } = useDictionary();
  const t = STR[locale];
  const mounted = useMounted();
  const eloBracket = usePreferencesStore((s) => s.eloBracket);

  const [tab, setTab] = useState<TabId>('overview');

  const meta = useMetaStats({ eloBracket });
  const detail = useCompDetail(id || null);
  const { data: staticData } = useStaticData();
  const tryCompInBuilder = useTryComp();

  const comp = safeFindBy(meta.comps, (entry) => entry?.id === id);
  const showLoading = !mounted || meta.isLoading || detail.isLoading;
  const isError = meta.isError || detail.isError;
  const detailErrorMessage =
    detail.error instanceof Error ? detail.error.message : undefined;
  // An empty / malformed id can never resolve — show the not-found card
  // immediately instead of spinning on a query that is disabled anyway.
  const notFound =
    !showLoading && !isError && (!id || (!comp && detailErrorMessage === 'Comp not found'));

  const title = comp?.name ?? (detail.data ? `Comp ${id}` : id);
  const winRate = useCountUp(safeNumber(comp?.winRate), { decimals: 1, enabled: !showLoading });
  const top4Rate = useCountUp(safeNumber(comp?.top4Rate), { decimals: 1, enabled: !showLoading });
  const avgPlace = useCountUp(safeNumber(comp?.avgPlacement), { decimals: 2, enabled: !showLoading });
  const games = useCountUp(safeNumber(comp?.games ?? detail.data?.games), { enabled: !showLoading });
  const pickRate = useCountUp(safeNumber(comp?.pickRate), { decimals: 1, enabled: !showLoading });

  const levelling = toText(detail.data?.levelling) || toText(comp?.style);
  const guide = GUIDES[levelingKey(levelling)] ?? GUIDES.standard;

  const positioning = useMemo(() => {
    if (!comp) return { front: [], back: [] } as {
      front: { name: string; iconUrl: string; cost?: number }[];
      back: { name: string; iconUrl: string; cost?: number }[];
    };
    const byName = new Map(toArray(staticData?.champions).map((c) => [c.name, c]));
    const front: { name: string; iconUrl: string; cost?: number }[] = [];
    const back: { name: string; iconUrl: string; cost?: number }[] = [];
    for (const name of toArray(comp.champions)) {
      const champ = byName.get(name);
      // Off-allowlist icon URLs collapse to '' -> avatar initials fallback.
      const entry = { name, iconUrl: safeImageSrc(champ?.iconUrl), cost: champ?.cost };
      if (name === comp.carry) back.unshift(entry);
      else if (safeNumber(champ?.stats?.range, 2) <= 1) front.push(entry);
      else back.push(entry);
    }
    return { front, back };
  }, [comp, staticData]);

  const trends = toArray(detail.data?.trends);
  const maxTrendCount = Math.max(1, ...trends.map((point) => safeNumber(point?.count)));

  if (showLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" className="skeleton-sheen" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <LoadingSkeleton variant="card" className="skeleton-sheen lg:col-span-3" />
          <LoadingSkeleton variant="card" className="skeleton-sheen lg:col-span-2" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" className="skeleton-sheen" />
          ))}
        </div>
      </div>
    );
  }

  if (isError && !comp && !detail.data) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
        <p className="font-semibold text-[var(--foreground)]">{t.loadError}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {meta.error?.message ?? detail.error?.message}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            void meta.refetch();
            void detail.refetch();
          }}
        >
          {dict.common.retry}
        </Button>
      </div>
    );
  }

  if (notFound || (!comp && !detail.data)) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
        <p className="font-bold text-[var(--foreground)]">{t.notFound}</p>
        <Link href="/meta">
          <Button type="button" variant="outline" size="sm" className="mt-4">
            &larr; {t.browse}
          </Button>
        </Link>
      </div>
    );
  }

  const stats: { label: string; value: string; accent?: boolean }[] = [
    { label: t.stats.win, value: `${fixed(winRate, 1)}%`, accent: true },
    { label: t.stats.top4, value: `${fixed(top4Rate, 1)}%` },
    { label: t.stats.avg, value: fixed(avgPlace, 2) },
    { label: t.stats.games, value: intText(games, numberLocale) },
    { label: t.stats.pick, value: `${fixed(pickRate, 1)}%` },
  ];

  return (
    <div className="page-enter space-y-6">
      <Link
        href="/meta"
        className="inline-block rounded text-sm font-medium text-[var(--accent-gold)] hover:text-[var(--accent-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        &larr; {t.back}
      </Link>

      {/* Header */}
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {comp ? <TierBadge tier={comp.tier} size="md" /> : null}
                <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)] lg:text-3xl">
                  {title}
                </h1>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {levelling ? (
                  <span className="rounded-full bg-[var(--accent-blue)]/15 px-2.5 py-1 text-xs font-bold text-[var(--accent-blue)]">
                    {levelling}
                  </span>
                ) : null}
                {toArray(comp?.primaryTraits).slice(0, 4).map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-[var(--background)] px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {trait}
                  </span>
                ))}
                {detail.data?.updatedAt ? (
                  <span className="text-[11px] text-muted-foreground">
                    Patch {comp?.patchId ?? meta.overview?.patchId ?? 'latest'}
                  </span>
                ) : null}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd
                      className={`text-lg font-black tabular-nums ${
                        stat.accent ? 'text-[var(--accent-gold)]' : 'text-[var(--foreground)]'
                      }`}
                    >
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            {comp ? (
              <Button
                type="button"
                variant="primary"
                className="shrink-0"
                onClick={() => tryCompInBuilder(comp)}
              >
                {t.tryInBuilder}
              </Button>
            ) : null}
          </div>
        </div>
      </Reveal>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label={title}
        className="flex gap-1.5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-1.5"
      >
        {(['overview', 'leveling', 'positioning'] as const).map((tabId) => (
          <button
            key={tabId}
            role="tab"
            aria-selected={tab === tabId}
            onClick={() => setTab(tabId)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-95 ${
              tab === tabId
                ? 'bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]'
                : 'text-muted-foreground hover:text-[var(--foreground)]'
            }`}
          >
            {t.tabs[tabId]}
          </button>
        ))}
      </div>

      <div key={tab} className="slide-enter" role="tabpanel">
        {tab === 'overview' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <Reveal className="lg:col-span-3">
                <section className="h-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {t.boardTitle}
                  </h2>
                  {comp ? (
                    <>
                      <CompBoardPreview
                        champions={toArray(comp.champions)}
                        carry={comp.carry}
                        starIds={toArray(detail.data?.stars)}
                      />
                      <p className="mt-2 text-[11px] text-muted-foreground">{t.starNote}</p>
                    </>
                  ) : null}
                </section>
              </Reveal>
              <Reveal delay={80} className="lg:col-span-2">
                <section className="h-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {t.histoTitle}
                  </h2>
                  <PlacementHistogram
                    places={toArray<number>(detail.data?.places)}
                    tier={comp?.tier ?? 'B'}
                    locale={numberLocale}
                  />
                </section>
              </Reveal>
            </div>

            <section aria-label={t.bisTitle}>
              <h2 className="mb-1 text-lg font-bold text-[var(--foreground)]">{t.bisTitle}</h2>
              <p className="mb-3 text-xs text-muted-foreground">{t.bisSub}</p>
              <BisItems
                builds={toArray(detail.data?.builds)}
                starIds={toArray(detail.data?.stars)}
                carryName={toText(comp?.carry)}
                locale={numberLocale}
              />
            </section>

            <section aria-label={t.augTitle}>
              <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">{t.augTitle}</h2>
              <AugmentStats primaryTraits={toArray(comp?.primaryTraits)} locale={numberLocale} />
            </section>
          </div>
        ) : null}

        {tab === 'leveling' ? (
          <div className="space-y-4">
            <Reveal>
              <section className="rounded-xl border border-[var(--accent-blue)]/30 bg-[var(--card-bg)] p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {t.levelTitle}
                </h2>
                <p className="mt-1 text-2xl font-black text-[var(--accent-blue)]">
                  {levelling || 'Standard'}
                </p>
                <ol className="mt-3 space-y-2">
                  {guideSteps(guide, locale).map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm text-[var(--foreground)]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gold)]/15 text-xs font-black text-[var(--accent-gold)]">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>
            {trends.length > 0 ? (
              <Reveal delay={80}>
                <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {t.trendTitle}
                  </h2>
                  <ol className="space-y-1.5">
                    {trends.map((point) => (
                      <li key={point.day} className="flex items-center gap-2 text-xs">
                        <span className="w-14 shrink-0 tabular-nums text-muted-foreground">
                          {toText(point.day).slice(5).replace('-', '/')}
                        </span>
                        <span className="h-4 min-w-0 flex-1 overflow-hidden rounded bg-[var(--background)]">
                          <span
                            className="block h-full origin-left rounded bg-[var(--accent-blue)]/70"
                            style={{ transform: `scaleX(${percent(safeNumber(point?.count) / maxTrendCount)})` }}
                          />
                        </span>
                        <span className="w-28 shrink-0 text-right tabular-nums text-muted-foreground">
                          {fixed(safeNumber(point?.pick) * 100, 1)}% {t.trendPick} · {fixed(point?.avg, 2)} avg
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              </Reveal>
            ) : null}
          </div>
        ) : null}

        {tab === 'positioning' ? (
          <div className="space-y-4">
            <Reveal>
              <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
                <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {t.posTitle}
                </h2>
                <p className="mb-3 text-xs text-muted-foreground">{t.posSub}</p>
                {comp ? (
                  <CompBoardPreview
                    champions={toArray(comp.champions)}
                    carry={comp.carry}
                    starIds={toArray(detail.data?.stars)}
                  />
                ) : null}
              </section>
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  { label: t.frontline, units: positioning.front },
                  { label: t.backline, units: positioning.back },
                ] as const
              ).map((group, groupIndex) => (
                <Reveal key={group.label} delay={groupIndex * 80}>
                  <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      {group.label} ({group.units.length})
                    </h3>
                    {group.units.length > 0 ? (
                      <ul className="space-y-2">
                        {group.units.map((unit) => (
                          <li key={unit.name} className="flex items-center gap-3">
                            <ChampionAvatar
                              name={unit.name}
                              iconUrl={unit.iconUrl}
                              cost={unit.cost}
                              size="sm"
                              className="rounded-md"
                            />
                            <span className="text-sm font-bold text-[var(--foreground)]">
                              {unit.name}
                            </span>
                            {comp && unit.name === comp.carry ? (
                              <span className="rounded-full bg-[var(--accent-gold)]/15 px-2 py-0.5 text-[10px] font-black uppercase text-[var(--accent-gold)]">
                                Carry
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">{dict.common.noData}</p>
                    )}
                  </section>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CompDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="card" className="skeleton-sheen" />}>
      <CompDetailContent />
    </Suspense>
  );
}
