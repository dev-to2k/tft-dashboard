'use client';

import { useTeamBuilderStore } from '@tft/store';
import { ChampionPool } from './champion-pool';

const costColors: Record<number, string> = {
  1: 'var(--cost-1)',
  2: 'var(--cost-2)',
  3: 'var(--cost-3)',
  4: 'var(--cost-4)',
  5: 'var(--cost-5)',
};

// Mock champion lookup for display purposes
const championLookup: Record<string, { name: string; cost: number; traits: string[] }> = {
  vex: { name: 'Vex', cost: 1, traits: ['Enchanter', 'Arcane'] },
  lulu: { name: 'Lulu', cost: 1, traits: ['Enchanter', 'Celestial'] },
  poppy: { name: 'Poppy', cost: 1, traits: ['Bruiser', 'Sentinel'] },
  kogmaw: { name: "Kog'Maw", cost: 1, traits: ['Sniper', 'Shadow'] },
  twisted_fate: { name: 'Twisted Fate', cost: 1, traits: ['Sorcerer', 'Phantom'] },
  ashe: { name: 'Ashe', cost: 2, traits: ['Sniper', 'Celestial'] },
  zyra: { name: 'Zyra', cost: 2, traits: ['Sorcerer', 'Enchanter'] },
  shaco: { name: 'Shaco', cost: 2, traits: ['Assassin', 'Phantom'] },
  talon: { name: 'Talon', cost: 2, traits: ['Assassin', 'Ironclad'] },
  teemo: { name: 'Teemo', cost: 2, traits: ['Demolitionist', 'Celestial'] },
  garen: { name: 'Garen', cost: 3, traits: ['Bruiser', 'Ironclad'] },
  syndra: { name: 'Syndra', cost: 3, traits: ['Sorcerer', 'Sentinel'] },
  darius: { name: 'Darius', cost: 3, traits: ['Bruiser', 'Demolitionist'] },
  sett: { name: 'Sett', cost: 3, traits: ['Bruiser', 'Shadow'] },
  katarina: { name: 'Katarina', cost: 3, traits: ['Assassin', 'Demolitionist'] },
  lux: { name: 'Lux', cost: 4, traits: ['Sorcerer', 'Arcane'] },
  akali: { name: 'Akali', cost: 4, traits: ['Assassin', 'Phantom'] },
  jinx: { name: 'Jinx', cost: 4, traits: ['Sniper', 'Shadow'] },
  ornn: { name: 'Ornn', cost: 4, traits: ['Bruiser', 'Celestial'] },
  ryze: { name: 'Ryze', cost: 4, traits: ['Sorcerer', 'Arcane'] },
  mordekaiser: { name: 'Mordekaiser', cost: 5, traits: ['Ironclad', 'Shadow'] },
  smolder: { name: 'Smolder', cost: 5, traits: ['Sniper', 'Sentinel'] },
  camille: { name: 'Camille', cost: 5, traits: ['Assassin', 'Ironclad'] },
};

export function TeamBoard() {
  const board = useTeamBuilderStore((s) => s.board);
  const bench = useTeamBuilderStore((s) => s.bench);
  const level = useTeamBuilderStore((s) => s.level);
  const gold = useTeamBuilderStore((s) => s.gold);
  const setLevel = useTeamBuilderStore((s) => s.setLevel);
  const setGold = useTeamBuilderStore((s) => s.setGold);
  const removeChampion = useTeamBuilderStore((s) => s.removeChampion);
  const reset = useTeamBuilderStore((s) => s.reset);

  // Calculate active traits
  const activeTraits = new Map<string, number>();
  for (const id of board) {
    if (!id) continue;
    const champ = championLookup[id];
    if (!champ) continue;
    for (const trait of champ.traits) {
      activeTraits.set(trait, (activeTraits.get(trait) ?? 0) + 1);
    }
  }

  const sortedTraits = [...activeTraits.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main Board Area */}
      <div className="flex-1 space-y-6">
        {/* Level & Gold Controls */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Level</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLevel(level - 1)}
                disabled={level <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)] disabled:opacity-30"
              >
                -
              </button>
              <span className="w-8 text-center text-lg font-bold text-[var(--accent-gold)]">
                {level}
              </span>
              <button
                onClick={() => setLevel(level + 1)}
                disabled={level >= 10}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          <div className="h-6 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Gold</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setGold(gold - 10)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)]"
              >
                -10
              </button>
              <span className="w-12 text-center text-lg font-bold text-[var(--accent-gold)]">
                {gold}
              </span>
              <button
                onClick={() => setGold(gold + 10)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] transition-colors hover:border-[var(--accent-gold)]"
              >
                +10
              </button>
            </div>
          </div>

          <div className="ml-auto">
            <button
              onClick={reset}
              className="rounded-lg border border-red-900/30 bg-red-900/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/20"
            >
              Reset Board
            </button>
          </div>
        </div>

        {/* Board Slots (8 slots in hex-like grid) */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Board ({board.filter(Boolean).length}/{level > 9 ? 10 : level + 1} max)
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {board.map((slotId, index) => {
              const champ = slotId ? championLookup[slotId] : null;
              return (
                <div
                  key={`board-${index}`}
                  className="group relative flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--background)] transition-all hover:border-[var(--accent-gold)]/30"
                >
                  {champ ? (
                    <>
                      <div
                        className="flex h-full w-full flex-col items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `${costColors[champ.cost]}15`,
                          borderColor: costColors[champ.cost],
                          borderWidth: '2px',
                          borderStyle: 'solid',
                        }}
                      >
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-md sm:h-14 sm:w-14"
                          style={{ backgroundColor: costColors[champ.cost] }}
                        >
                          {champ.name.slice(0, 2)}
                        </div>
                        <span className="mt-1 text-xs font-semibold text-[var(--foreground)]">
                          {champ.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeChampion(index)}
                        className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
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
          <div className="grid grid-cols-9 gap-1.5">
            {bench.map((slotId, index) => {
              const champ = slotId ? championLookup[slotId] : null;
              return (
                <div
                  key={`bench-${index}`}
                  className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] transition-all hover:border-[var(--accent-gold)]/30"
                >
                  {champ ? (
                    <div
                      className="flex h-full w-full items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: costColors[champ.cost] }}
                      title={champ.name}
                    >
                      {champ.name.slice(0, 2)}
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Traits */}
        {sortedTraits.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Active Traits
            </h3>
            <div className="flex flex-wrap gap-2">
              {sortedTraits.map(([trait, count]) => (
                <div
                  key={trait}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2"
                >
                  <span className="text-sm font-semibold text-[var(--accent-blue)]">
                    {trait}
                  </span>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--accent-gold)] px-1 text-[10px] font-black text-[var(--background)]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Champion Pool Sidebar */}
      <div className="w-full shrink-0 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 lg:w-80">
        <ChampionPool />
      </div>
    </div>
  );
}

