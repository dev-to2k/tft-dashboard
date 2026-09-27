'use client';

import { useEffect, useRef } from 'react';
import { useStaticData } from '@tft/api';
import { arrangeCompFormation, toFormationUnits } from '@tft/game-data';
import { useTryComp } from '@/hooks/use-try-comp';
import { Button, TierBadge, tierVar } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';
import { UnitHex, boardGridPosition, type HexEntry } from '@/components/builder/board-hex';
import { useDictionary } from '@/i18n/use-dictionary';
import type { CompMetaStats } from '@tft/types';

interface CompSpotlightProps {
  comp: CompMetaStats | null;
  onClose: () => void;
}

/** Full comp breakdown: formation preview, units, stats, try-in-builder. */
export function CompSpotlight({ comp, onClose }: CompSpotlightProps) {
  const tryCompInBuilder = useTryComp();
  const { data: staticData } = useStaticData();
  const { dict } = useDictionary();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!comp) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [comp, onClose]);

  if (!comp) return null;

  const byName = new Map((staticData?.champions ?? []).map((c) => [c.name, c]));
  const lookup = (name: string): HexEntry & { traits: string[] } => {
    const champ = byName.get(name);
    return champ
      ? { id: champ.slug, name: champ.name, cost: champ.cost, iconUrl: champ.iconUrl, traits: champ.traits }
      : { id: name, name, cost: 1, iconUrl: '', traits: [] };
  };

  const board = arrangeCompFormation(
    toFormationUnits(comp, (name) => {
      const champ = byName.get(name);
      if (!champ) return null;
      return { id: champ.slug, traits: champ.traits, range: champ.stats.range };
    }),
  );

  const tryInBuilder = () => {
    onClose();
    tryCompInBuilder(comp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={dict.common.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={comp.name}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-[var(--foreground)]">{comp.name}</h2>
              <TierBadge tier={comp.tier} size="md" />
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {comp.primaryTraits.slice(0, 5).map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--accent-blue)]"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={dict.common.close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            <span aria-hidden="true">{'\u00D7'}</span>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-5">
          <div>
            <p className="text-xs text-muted-foreground">{dict.comps.winRate}</p>
            <p className="text-lg font-black text-[var(--accent-gold)]">{comp.winRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{dict.comps.avgPlace}</p>
            <p className="text-lg font-black text-[var(--foreground)]">{comp.avgPlacement.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{dict.comps.top4}</p>
            <p className="text-lg font-black text-[var(--foreground)]">{comp.top4Rate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{dict.meta.table.pickRate}</p>
            <p className="text-lg font-black" style={{ color: tierVar[comp.tier] }}>
              {comp.pickRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Formation preview */}
        <h3 className="mb-2 mt-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {dict.meta.units}
        </h3>
        <div className="grid grid-cols-15 gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-3">
          {board.map((slotId, index) => {
            const { col, row } = boardGridPosition(index);
            const entry = slotId ? lookup(slotId) : null;
            // board ids are slugs; resolve display entry via slug match
            const display = entry && slotId ? resolveDisplay(slotId, byName) : null;
            return (
              <div
                key={`spot-${index}`}
                className="col-span-2"
                style={{
                  gridColumnStart: col,
                  gridRowStart: row,
                  marginTop: row > 1 ? '-28%' : undefined,
                }}
              >
                <UnitHex entry={display} emptyLabel="" size="bench" />
              </div>
            );
          })}
        </div>

        {/* Unit list */}
        <div className="mt-4 flex flex-wrap gap-2">
          {comp.champions.map((name) => {
            const info = byName.get(name);
            return (
              <span
                key={name}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] py-1 pl-1 pr-2.5"
              >
                <ChampionAvatar
                  name={name}
                  iconUrl={info?.iconUrl ?? ''}
                  cost={info?.cost}
                  size="sm"
                  className="rounded-md"
                />
                <span className="text-xs font-semibold text-[var(--foreground)]">{name}</span>
              </span>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {dict.common.close}
          </Button>
          <Button type="button" variant="primary" onClick={tryInBuilder}>
            {dict.meta.tryInBuilder}
          </Button>
        </div>
      </div>
    </div>
  );
}

function resolveDisplay(
  slug: string,
  byName: Map<string, { slug: string; name: string; cost: number; iconUrl: string }>,
): HexEntry | null {
  for (const champ of byName.values()) {
    if (champ.slug === slug || champ.name === slug) return { id: champ.slug, ...champ };
  }
  return { id: slug, name: slug, cost: 1, iconUrl: '' };
}
