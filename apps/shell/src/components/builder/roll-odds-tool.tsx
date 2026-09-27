'use client';

import { useState } from 'react';
import { calculateRollOdds } from '@tft/game-data';
import { costTextClass } from '@tft/ui';
import { useDictionary } from '@/i18n/use-dictionary';

const SHOP_SLOTS = 5;
const ROLL_COST = 2;

/** Binomial hit chance: at least one target-cost unit in `rolls` refreshes. */
function hitChance(perSlot: number, rolls: number): number {
  if (perSlot <= 0 || rolls <= 0) return 0;
  const perRefresh = 1 - Math.pow(1 - perSlot, SHOP_SLOTS);
  return 1 - Math.pow(1 - perRefresh, rolls);
}

export function RollOddsTool() {
  const [level, setLevel] = useState(8);
  const [targetCost, setTargetCost] = useState(4);
  const [gold, setGold] = useState(50);
  const { dict } = useDictionary();
  const t = dict.roll;

  const perSlot = calculateRollOdds(level, targetCost);
  const rolls = Math.max(0, Math.floor(gold / ROLL_COST));
  const chance = hitChance(perSlot, rolls);
  const expected = perSlot * SHOP_SLOTS;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {t.title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          {t.level}
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLevel((v) => Math.max(3, v - 1))}
              aria-label="Decrease level"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)]"
            >
              -
            </button>
            <span aria-live="polite" className="w-8 text-center text-lg font-black text-[var(--accent-gold)]">
              {level}
            </span>
            <button
              type="button"
              onClick={() => setLevel((v) => Math.min(10, v + 1))}
              aria-label="Increase level"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)]"
            >
              +
            </button>
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          {t.target}
          <span className="flex gap-1" role="group" aria-label={t.target}>
            {[1, 2, 3, 4, 5].map((cost) => (
              <button
                key={cost}
                type="button"
                onClick={() => setTargetCost(cost)}
                aria-pressed={targetCost === cost}
                className={`h-8 w-8 rounded-lg text-xs font-black transition-all active:scale-95 ${
                  targetCost === cost
                    ? 'bg-[var(--accent-gold)] text-[var(--gold-foreground)]'
                    : 'border border-[var(--border)] bg-[var(--background)] text-muted-foreground hover:text-[var(--foreground)]'
                }`}
              >
                {cost}
              </button>
            ))}
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          {t.gold}
          <input
            type="number"
            min={0}
            max={999}
            step={2}
            value={gold}
            onChange={(e) => setGold(Math.max(0, Math.min(999, Number(e.target.value) || 0)))}
            className="h-8 w-24 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 text-sm font-bold text-[var(--foreground)] focus:border-[var(--accent-gold)] focus:outline-none focus:shadow-[0_0_12px_-4px_var(--accent-gold)]"
          />
        </label>
      </div>

      {/* Odds per cost at this level */}
      <div className="mt-4 space-y-1.5">
        {[1, 2, 3, 4, 5].map((cost) => {
          const p = calculateRollOdds(level, cost);
          return (
            <div key={cost} className="flex items-center gap-2">
              <span className={`w-10 text-xs font-black ${costTextClass[cost] ?? ''}`}>
                {cost}-cost
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--background)]">
                <div
                  className={`h-full rounded-full transition-all ${cost === targetCost ? 'bg-[var(--accent-gold)]' : 'bg-[var(--foreground)]/30'}`}
                  style={{ width: `${Math.max(0, Math.min(100, p * 100))}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs font-semibold text-muted-foreground">
                {(p * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 rounded-lg border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5 p-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {t.perRoll}
          </p>
          <p className="text-xl font-black text-[var(--accent-gold)]">
            {(hitChance(perSlot, 1) * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {t.withGold(gold)}
          </p>
          <p className="text-xl font-black text-[var(--foreground)]">
            {(chance * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.expected}</p>
          <p className="text-xl font-black text-[var(--foreground)]">{expected.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
