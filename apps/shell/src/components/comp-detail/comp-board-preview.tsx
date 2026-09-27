'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { normalizeId, useStaticData } from '@tft/api';
import type { TftChampion } from '@tft/types';
import { arrangeCompFormation, toFormationUnits } from '@tft/game-data';
import { UnitHex, boardGridPosition, type HexEntry } from '@/components/builder/board-hex';

interface ResolvedUnit {
  entry: HexEntry;
  traits: string[];
  range: number;
}

interface TraitChip {
  name: string;
  count: number;
  active: boolean;
  iconUrl: string;
}

interface CompBoardPreviewProps {
  /** Display names from CompMetaStats (same input as useTryComp). */
  champions: string[];
  carry: string;
  /** Raw MetaTFT unit ids commonly 3-starred (star badge overlay). */
  starIds?: string[];
  compact?: boolean;
}

/**
 * Read-only 4x7 board preview for a meta comp. Reuses the builder's
 * UnitHex + staggered grid, formation via arrangeCompFormation,
 * plus synergy chips joined with Community Dragon trait thresholds.
 */
export function CompBoardPreview({ champions, carry, starIds = [], compact = false }: CompBoardPreviewProps) {
  const { data: staticData } = useStaticData();

  const { board, chips, starred } = useMemo(() => {
    const byName = new Map((staticData?.champions ?? []).map((c) => [c.name, c]));
    const byKey = new Map<string, TftChampion>();
    for (const champ of staticData?.champions ?? []) {
      const key = normalizeId(champ.id);
      if (!byKey.has(key)) byKey.set(key, champ);
    }

    const units = toFormationUnits({ champions, carry }, (name) => {
      const champ = byName.get(name);
      if (!champ) return null;
      return { id: champ.slug, traits: champ.traits, range: champ.stats.range };
    });
    const slots = arrangeCompFormation(units);

    const lookup = new Map<string, ResolvedUnit>();
    for (const champ of staticData?.champions ?? []) {
      lookup.set(champ.slug, {
        entry: { id: champ.slug, name: champ.name, cost: champ.cost, iconUrl: champ.iconUrl },
        traits: champ.traits,
        range: champ.stats.range,
      });
    }

    const boardEntries = slots.map((slotId) => {
      if (!slotId) return null;
      return lookup.get(slotId) ?? null;
    });

    // Synergy from the actual board units (same approach as metatft.ts).
    const traitByName = new Map((staticData?.traits ?? []).map((t) => [t.name, t]));
    const counts = new Map<string, number>();
    for (const resolved of boardEntries) {
      if (!resolved) continue;
      for (const trait of resolved.traits) {
        counts.set(trait, (counts.get(trait) ?? 0) + 1);
      }
    }
    const traitChips: TraitChip[] = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        const trait = traitByName.get(name);
        const minActive = trait?.tiers[0]?.count ?? 2;
        return { name, count, active: count >= minActive, iconUrl: trait?.iconUrl ?? '' };
      });

    // 3-star overlay: match raw MetaTFT ids against static champions.
    const starNames = new Set<string>();
    for (const raw of starIds) {
      const champ = byKey.get(normalizeId(raw));
      if (champ) starNames.add(champ.name);
    }

    return { board: boardEntries, chips: traitChips, starred: starNames };
  }, [staticData, champions, carry, starIds]);

  const filled = board.filter(Boolean).length;

  return (
    <div>
      <div className="isolate overflow-x-auto pb-2">
        <div className={`relative z-0 grid min-w-[520px] grid-cols-15 gap-1 ${compact ? '' : 'sm:gap-1.5'}`}>
          {board.map((resolved, index) => {
            const { col, row } = boardGridPosition(index);
            const isStar = resolved ? starred.has(resolved.entry.name) : false;
            return (
              <div
                key={`preview-${index}`}
                className="col-span-2 min-h-0 min-w-0 isolate"
                style={{
                  gridColumnStart: col,
                  gridRowStart: row,
                  marginTop: row > 1 ? '-28%' : undefined,
                }}
              >
                <div className="relative">
                  <UnitHex
                    entry={resolved?.entry ?? null}
                    emptyLabel=""
                    size="board"
                    highlighted={resolved?.entry.name === carry}
                  />
                  {isStar ? (
                    <span
                      aria-label="Commonly 3-starred"
                      title="Commonly 3-starred"
                      className="absolute -right-0.5 -top-0.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-gold)] px-1 text-[10px] font-black text-[var(--gold-foreground)] shadow-md"
                    >
                      ★3
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
        {filled}/28
      </p>

      {chips.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Active synergies">
          {chips.map((chip) => (
            <li
              key={chip.name}
              title={chip.active ? 'Active synergy' : 'Inactive — below threshold'}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                chip.active
                  ? 'border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10 text-[var(--foreground)]'
                  : 'border-[var(--border)] bg-[var(--card-bg)] text-muted-foreground opacity-70'
              }`}
            >
              {chip.iconUrl ? (
                <span className="relative block h-4 w-4 shrink-0">
                  <Image src={chip.iconUrl} alt="" fill sizes="16px" loading="lazy" className="object-contain" />
                </span>
              ) : null}
              <span>{chip.name}</span>
              <span
                className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                  chip.active
                    ? 'bg-[var(--accent-gold)] text-[var(--gold-foreground)]'
                    : 'bg-[var(--background)] text-muted-foreground'
                }`}
              >
                {chip.count}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
