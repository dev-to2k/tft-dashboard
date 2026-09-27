'use client';

import { useMemo } from 'react';
import { useStaticData } from '@tft/api';
import { useTeamBuilderStore } from '@tft/store';
import { costBgSoftClass, costBorderClass } from '@tft/ui';
import { ChampionAvatar } from '../champion-avatar';
import { ChampionPool } from './champion-pool';

interface LookupEntry {
  name: string;
  cost: number;
  traits: string[];
  iconUrl: string;
}

// Legacy mock roster: only a fallback for boards persisted before the pool
// switched to live Community Dragon data (and when static data is loading).
const legacyChampions: Record<string, LookupEntry> = {
  vex: { name: 'Vex', cost: 1, traits: ['Enchanter', 'Arcane'], iconUrl: '' },
  lulu: { name: 'Lulu', cost: 1, traits: ['Enchanter', 'Celestial'], iconUrl: '' },
  poppy: { name: 'Poppy', cost: 1, traits: ['Bruiser', 'Sentinel'], iconUrl: '' },
  kogmaw: { name: "Kog'Maw", cost: 1, traits: ['Sniper', 'Shadow'], iconUrl: '' },
  twisted_fate: { name: 'Twisted Fate', cost: 1, traits: ['Sorcerer', 'Phantom'], iconUrl: '' },
  ashe: { name: 'Ashe', cost: 2, traits: ['Sniper', 'Celestial'], iconUrl: '' },
  zyra: { name: 'Zyra', cost: 2, traits: ['Sorcerer', 'Enchanter'], iconUrl: '' },
  shaco: { name: 'Shaco', cost: 2, traits: ['Assassin', 'Phantom'], iconUrl: '' },
  talon: { name: 'Talon', cost: 2, traits: ['Assassin', 'Ironclad'], iconUrl: '' },
  teemo: { name: 'Teemo', cost: 2, traits: ['Demolitionist', 'Celestial'], iconUrl: '' },
  garen: { name: 'Garen', cost: 3, traits: ['Bruiser', 'Ironclad'], iconUrl: '' },
  syndra: { name: 'Syndra', cost: 3, traits: ['Sorcerer', 'Sentinel'], iconUrl: '' },
  darius: { name: 'Darius', cost: 3, traits: ['Bruiser', 'Demolitionist'], iconUrl: '' },
  sett: { name: 'Sett', cost: 3, traits: ['Bruiser', 'Shadow'], iconUrl: '' },
  katarina: { name: 'Katarina', cost: 3, traits: ['Assassin', 'Demolitionist'], iconUrl: '' },
  lux: { name: 'Lux', cost: 4, traits: ['Sorcerer', 'Arcane'], iconUrl: '' },
  akali: { name: 'Akali', cost: 4, traits: ['Assassin', 'Phantom'], iconUrl: '' },
  jinx: { name: 'Jinx', cost: 4, traits: ['Sniper', 'Shadow'], iconUrl: '' },
  ornn: { name: 'Ornn', cost: 4, traits: ['Bruiser', 'Celestial'], iconUrl: '' },
  ryze: { name: 'Ryze', cost: 4, traits: ['Sorcerer', 'Arcane'], iconUrl: '' },
  mordekaiser: { name: 'Mordekaiser', cost: 5, traits: ['Ironclad', 'Shadow'], iconUrl: '' },
  smolder: { name: 'Smolder', cost: 5, traits: ['Sniper', 'Sentinel'], iconUrl: '' },
  camille: { name: 'Camille', cost: 5, traits: ['Assassin', 'Ironclad'], iconUrl: '' },
};

export function TeamBoard() {
  const board = useTeamBuilderStore((s) => s.board);
  const bench = useTeamBuilderStore((s) => s.bench);
  const level = useTeamBuilderStore((s) => s.level);
  const gold = useTeamBuilderStore((s) => s.gold);
  const setLevel = useTeamBuilderStore((s) => s.setLevel);
  const setGold = useTeamBuilderStore((s) => s.setGold);
  const removeChampion = useTeamBuilderStore((s) => s.removeChampion);
  const removeBenched = useTeamBuilderStore((s) => s.removeBenched);
  const reset = useTeamBuilderStore((s) => s.reset);
  const { data } = useStaticData();

  const lookup = useMemo(() => {
    const map = new Map<string, LookupEntry>();
    for (const champ of data?.champions ?? []) {
      const entry: LookupEntry = {
        name: champ.name,
        cost: champ.cost,
        traits: champ.traits,
        iconUrl: champ.iconUrl,
      };
      map.set(champ.slug, entry);
      map.set(champ.id, entry);
    }
    for (const [id, entry] of Object.entries(legacyChampions)) {
      if (!map.has(id)) map.set(id, entry);
    }
    return map;
  }, [data]);

  const resolve = (id: string | null): (LookupEntry & { id: string }) | null => {
    if (!id) return null;
    const entry = lookup.get(id);
    return entry ? { ...entry, id } : { name: id, cost: 1, traits: [], iconUrl: '', id };
  };

  // Calculate active traits
  const activeTraits = new Map<string, number>();
  for (const id of board) {
    const champ = resolve(id);
    if (!champ) continue;
    for (const trait of champ.traits) {
      activeTraits.set(trait, (activeTraits.get(trait) ?? 0) + 1);
    }
  }

  const sortedTraits = [...activeTraits.entries()].sort((a, b) => b[1] - a[1]);
  const boardCount = board.filter(Boolean).length;

  const handleReset = () => {
    if (boardCount === 0) {
      reset();
      return;
    }
    if (window.confirm('Clear the entire board and bench?')) {
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main Board Area */}
      <div className="flex-1 space-y-6">
        {/* Level & Gold Controls */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
          <div className="flex items-center gap-3">
            <span id="builder-level-label" className="text-sm font-medium text-muted-foreground">Level</span>
            <div className="flex items-center gap-1" role="group" aria-labelledby="builder-level-label">
              <button
                type="button"
                onClick={() => setLevel(level - 1)}
                disabled={level <= 1}
                aria-label="Decrease level"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)] disabled:opacity-30"
              >
                -
              </button>
              <span aria-live="polite" aria-label={`Level ${level}`} className="w-8 text-center text-lg font-bold text-[var(--accent-gold)]">
                {level}
              </span>
              <button
                type="button"
                onClick={() => setLevel(level + 1)}
                disabled={level >= 10}
                aria-label="Increase level"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          <div className="h-6 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-3">
            <span id="builder-gold-label" className="text-sm font-medium text-muted-foreground">Gold</span>
            <div className="flex items-center gap-1" role="group" aria-labelledby="builder-gold-label">
              <button
                type="button"
                onClick={() => setGold(gold - 10)}
                aria-label="Decrease gold by 10"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)]"
              >
                -10
              </button>
              <span aria-live="polite" aria-label={`Gold ${gold}`} className="w-12 text-center text-lg font-bold text-[var(--accent-gold)]">
                {gold}
              </span>
              <button
                type="button"
                onClick={() => setGold(gold + 10)}
                aria-label="Increase gold by 10"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)]"
              >
                +10
              </button>
            </div>
          </div>

          <div className="ml-auto">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
            >
              Reset Board
            </button>
          </div>
        </div>

        {/* Board Slots (8 slots in hex-like grid) */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Board ({boardCount}/{level > 9 ? 10 : level + 1} max)
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {board.map((slotId, index) => {
              const champ = resolve(slotId);
              return (
                <div
                  key={`board-${index}`}
                  className="group relative flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--background)] transition-all hover:border-[var(--accent-gold)]/30"
                >
                  {champ ? (
                    <>
                      <div
                        className={`flex h-full w-full flex-col items-center justify-center rounded-xl border-2 ${costBorderClass[champ.cost] ?? 'border-[var(--border)]'} ${costBgSoftClass[champ.cost] ?? ''}`}
                      >
                        <ChampionAvatar
                          name={champ.name}
                          iconUrl={champ.iconUrl}
                          cost={champ.cost}
                          size="md"
                          className="rounded-full shadow-md sm:h-14 sm:w-14"
                        />
                        <span className="mt-1 px-1 text-center text-xs font-semibold text-[var(--foreground)]">
                          {champ.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeChampion(index)}
                        aria-label={`Remove ${champ.name} from board`}
                        className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-xs font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        x
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Slot {index + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bench Slots (9 slots) */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Bench
          </h3>
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-9">
            {bench.map((slotId, index) => {
              const champ = resolve(slotId);
              return (
                <div
                  key={`bench-${index}`}
                  className="group relative flex aspect-square min-h-[44px] items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] transition-all hover:border-[var(--accent-gold)]/30"
                >
                  {champ ? (
                    <>
                      <ChampionAvatar
                        name={champ.name}
                        iconUrl={champ.iconUrl}
                        cost={champ.cost}
                        size="sm"
                        className="h-full w-full rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeBenched(index)}
                        aria-label={`Remove ${champ.name} from bench`}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        x
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Traits */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Active Traits
          </h3>
          {sortedTraits.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sortedTraits.map(([trait, count]) => (
                <div
                  key={trait}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2"
                >
                  <span className="text-sm font-semibold text-[var(--accent-blue-text)]">
                    {trait}
                  </span>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--accent-gold)] px-1 text-[10px] font-black text-[var(--gold-foreground)]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-6 text-center text-sm text-muted-foreground">
              Add champions from the pool to see active traits.
            </p>
          )}
        </div>
      </div>

      {/* Champion Pool Sidebar */}
      <div className="w-full shrink-0 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 lg:w-80">
        <ChampionPool />
      </div>
    </div>
  );
}
