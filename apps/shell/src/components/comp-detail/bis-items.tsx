'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { normalizeId, useStaticData } from '@tft/api';
import { fixed, intText, safeImageSrc, safeNumber, toArray, toText } from '@tft/utils';
import type { TftItem } from '@tft/types';
import { ChampionAvatar } from '@/components/champion-avatar';
import { Reveal } from '@/components/reveal';
import type { CompBuildEntry } from '@/hooks/use-comp-detail';

const VARIANT_SUFFIXES = ['base', 'small', 'cougar', 'summonmelee', 'melee', 'ranged', 'clone', 'form', 'ad', 'ap'];

function normKey(raw: unknown): string {
  return toText(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Strip set/prefix noise so `DA_18_X` and `TFT_Item_X` compare equal. */
function coreKey(raw: unknown): string {
  let key = normKey(raw);
  key = key.replace(/^(tft\d*|da\d*)/, '');
  key = key.replace(/^item/, '');
  key = key.replace(/^\d+/, '');
  return key;
}

function matchStaticItem(staticItems: TftItem[], rawId: string): TftItem | null {
  const core = coreKey(rawId);
  if (!core) return null;
  const withCore = staticItems.map((item) => ({ item, key: coreKey(item.id) }));
  const exact = withCore.find(({ key }) => key === core);
  if (exact) return exact.item;
  // Emblems flip word order (`EmblemBlackthorn` vs `BlackthornEmblem`).
  const stripEmblem = (key: string) => key.replace(/emblem/g, '');
  const wantsEmblem = core.includes('emblem');
  if (wantsEmblem) {
    const target = stripEmblem(core);
    const hit = withCore.find(
      ({ item, key }) =>
        (key.includes('emblem') || normKey(item.name).includes('emblem')) &&
        (stripEmblem(key) === target || stripEmblem(normKey(item.name)) === target),
    );
    if (hit) return hit.item;
  }
  const partial = withCore.find(({ key }) => key && (key.includes(core) || core.includes(key)));
  return partial?.item ?? null;
}

function lookupChampion<T extends { id: string }>(list: T[], rawId: string): T | null {
  const key = normalizeId(rawId);
  const direct = list.find((entry) => normalizeId(entry.id) === key);
  if (direct) return direct;
  for (const suffix of VARIANT_SUFFIXES) {
    if (key.length > suffix.length && key.endsWith(suffix)) {
      const trimmed = key.slice(0, -suffix.length);
      const hit = list.find((entry) => normalizeId(entry.id) === trimmed);
      if (hit) return hit;
    }
  }
  return null;
}

function prettyItemName(rawId: unknown): string {
  const id = toText(rawId);
  const tokens = id.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const last = tokens[tokens.length - 1] ?? id;
  return last.replace(/([a-z])([A-Z])/g, '$1 $2');
}

interface BisItemsProps {
  builds: CompBuildEntry[];
  /** Raw MetaTFT unit ids commonly played at 3-star. */
  starIds: string[];
  carryName: string;
  locale: string;
}

interface ItemSlotProps {
  rawId: string;
  staticItem: TftItem | null;
  componentNames: Map<string, TftItem>;
  combineNote: string;
}

/** One item slot with a hover tooltip showing the combine recipe. */
function ItemSlot({ rawId, staticItem, componentNames, combineNote }: ItemSlotProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const name = staticItem?.name ?? prettyItemName(rawId);
  // Off-allowlist URLs are dropped so `next/image` never throws.
  const iconUrl = safeImageSrc(staticItem?.iconUrl);
  const components = toArray<string>(staticItem?.components)
    .map((apiName) => componentNames.get(apiName))
    .filter((entry): entry is TftItem => Boolean(entry));

  return (
    <div className="group relative">
      <div
        tabIndex={0}
        role="img"
        aria-label={name}
        title={name}
        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] transition-colors group-hover:border-[var(--accent-gold)]/60 group-focus-visible:border-[var(--accent-gold)]"
      >
        {iconUrl && !imgFailed ? (
          <Image
            src={iconUrl}
            alt={name}
            fill
            sizes="64px"
            loading="lazy"
            className="object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="px-1 text-center text-[10px] font-black leading-tight text-[var(--foreground)]">
            {name.slice(0, 8)}
          </span>
        )}
      </div>
      {/* Combine tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <p className="text-xs font-black text-[var(--foreground)]">{name}</p>
        {staticItem?.description ? (
          <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-muted-foreground">
            {staticItem.description}
          </p>
        ) : null}
        {components.length === 2 ? (
          <div className="mt-2 flex items-center gap-1.5 border-t border-[var(--border)] pt-2">
            {components.map((component) => {
              const componentIcon = safeImageSrc(component.iconUrl);
              return (
                <span key={component.id} className="flex min-w-0 items-center gap-1">
                  {componentIcon ? (
                    <span className="relative block h-5 w-5 shrink-0 overflow-hidden rounded">
                      <Image src={componentIcon} alt="" fill sizes="20px" loading="lazy" className="object-cover" />
                    </span>
                  ) : null}
                  <span className="truncate text-[10px] font-semibold text-[var(--accent-blue)]">
                    {component.name}
                  </span>
                </span>
              );
            })}
            <span aria-hidden="true" className="text-[10px] text-muted-foreground">+</span>
          </div>
        ) : (
          <p className="mt-2 border-t border-[var(--border)] pt-2 text-[10px] text-muted-foreground">
            {combineNote}
          </p>
        )}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-[var(--card-bg)]"
        />
      </div>
    </div>
  );
}

/**
 * Best-in-slot items per champion, counted from MetaTFT `builds`
 * (3-item `buildName` per unit with avg placement + games).
 */
export function BisItems({ builds, starIds, carryName, locale }: BisItemsProps) {
  const { data: staticData } = useStaticData();
  const isVi = locale.startsWith('vi');

  const cards = useMemo(() => {
    const champions = toArray(staticData?.champions);
    const items = toArray(staticData?.items);
    const starKeys = new Set(toArray(starIds).map((id) => normalizeId(id)));

    return toArray(builds)
      .filter((build) => build && typeof build.unit === 'string' && build.unit !== '')
      .map((build) => {
        // `itemIds` can be missing / non-array / hold non-strings upstream.
        const itemIds = toArray<unknown>(build.itemIds)
          .filter((id): id is string => typeof id === 'string' && id !== '')
          .slice(0, 3);
        if (itemIds.length === 0) return null;
        const champion = lookupChampion(champions, build.unit);
        const name = champion?.name ?? build.unit;
        return {
          key: build.unit,
          name,
          cost: champion?.cost,
          iconUrl: safeImageSrc(champion?.iconUrl),
          isCarry: name === carryName,
          isStar: champion ? starKeys.has(normalizeId(champion.id)) : starKeys.has(normalizeId(build.unit)),
          games: safeNumber(build.games),
          avg: safeNumber(build.avg),
          score: safeNumber(build.score),
          itemIds,
          resolvedItems: itemIds.map((id) => matchStaticItem(items, id)),
        };
      })
      .filter((card): card is NonNullable<typeof card> => card !== null)
      .sort((a, b) => Number(b.isCarry) - Number(a.isCarry) || b.score - a.score)
      .slice(0, 4);
  }, [builds, starIds, carryName, staticData]);

  const componentById = useMemo(
    () => new Map(toArray(staticData?.items).map((item) => [item.id, item])),
    [staticData],
  );

  if (cards.length === 0) return null;

  const combineNote = isVi ? 'Trang bị đặc biệt — không ghép từ mảnh cơ bản.' : 'Special item — not combined from basic components.';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <Reveal key={card.key} delay={index * 80}>
          <article
            className={`relative h-full overflow-hidden rounded-xl border bg-[var(--card-bg)] p-4 transition-all hover:-translate-y-0.5 ${
              card.isCarry ? 'border-[var(--accent-gold)]/50' : 'border-[var(--border)] hover:border-[var(--accent-gold)]/30'
            }`}
          >
            {card.isCarry ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: 'linear-gradient(90deg, transparent, var(--accent-gold), transparent)' }}
              />
            ) : null}
            <div className="flex items-center gap-3">
              <ChampionAvatar
                name={card.name}
                iconUrl={card.iconUrl}
                cost={card.cost}
                size="md"
                className="rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[var(--foreground)]">{card.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {card.isCarry ? (
                    <span className="rounded-full bg-[var(--accent-gold)]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[var(--accent-gold)]">
                      {isVi ? 'Chủ lực' : 'Carry'}
                    </span>
                  ) : null}
                  {card.isStar ? (
                    <span
                      title={isVi ? 'Thường lên 3 sao' : 'Commonly 3-starred'}
                      className="rounded-full bg-[var(--accent-blue)]/15 px-2 py-0.5 text-[10px] font-black text-[var(--accent-blue)]"
                    >
                      ★3
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] tabular-nums text-muted-foreground">
              <span className="font-bold text-[var(--foreground)]">{fixed(card.avg, 2)}</span>{' '}
              {isVi ? 'hạng TB' : 'avg'} · {intText(card.games, locale)}{' '}
              {isVi ? 'trận' : 'games'}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {card.itemIds.map((itemId, slot) => (
                <ItemSlot
                  key={`${card.key}-${itemId}-${slot}`}
                  rawId={itemId}
                  staticItem={card.resolvedItems[slot] ?? null}
                  componentNames={componentById}
                  combineNote={combineNote}
                />
              ))}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
