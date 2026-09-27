'use client';

import { useTeamBuilderStore } from '@tft/store';

interface ChampionPoolItem {
  id: string;
  name: string;
  cost: 1 | 2 | 3 | 4 | 5;
  traits: string[];
}

const championPool: ChampionPoolItem[] = [
  // Cost 1
  { id: 'vex', name: 'Vex', cost: 1, traits: ['Enchanter', 'Arcane'] },
  { id: 'lulu', name: 'Lulu', cost: 1, traits: ['Enchanter', 'Celestial'] },
  { id: 'poppy', name: 'Poppy', cost: 1, traits: ['Bruiser', 'Sentinel'] },
  { id: 'kogmaw', name: "Kog'Maw", cost: 1, traits: ['Sniper', 'Shadow'] },
  { id: 'twisted_fate', name: 'Twisted Fate', cost: 1, traits: ['Sorcerer', 'Phantom'] },
  // Cost 2
  { id: 'ashe', name: 'Ashe', cost: 2, traits: ['Sniper', 'Celestial'] },
  { id: 'zyra', name: 'Zyra', cost: 2, traits: ['Sorcerer', 'Enchanter'] },
  { id: 'shaco', name: 'Shaco', cost: 2, traits: ['Assassin', 'Phantom'] },
  { id: 'talon', name: 'Talon', cost: 2, traits: ['Assassin', 'Ironclad'] },
  { id: 'teemo', name: 'Teemo', cost: 2, traits: ['Demolitionist', 'Celestial'] },
  // Cost 3
  { id: 'garen', name: 'Garen', cost: 3, traits: ['Bruiser', 'Ironclad'] },
  { id: 'syndra', name: 'Syndra', cost: 3, traits: ['Sorcerer', 'Sentinel'] },
  { id: 'darius', name: 'Darius', cost: 3, traits: ['Bruiser', 'Demolitionist'] },
  { id: 'sett', name: 'Sett', cost: 3, traits: ['Bruiser', 'Shadow'] },
  { id: 'katarina', name: 'Katarina', cost: 3, traits: ['Assassin', 'Demolitionist'] },
  // Cost 4
  { id: 'lux', name: 'Lux', cost: 4, traits: ['Sorcerer', 'Arcane'] },
  { id: 'akali', name: 'Akali', cost: 4, traits: ['Assassin', 'Phantom'] },
  { id: 'jinx', name: 'Jinx', cost: 4, traits: ['Sniper', 'Shadow'] },
  { id: 'ornn', name: 'Ornn', cost: 4, traits: ['Bruiser', 'Celestial'] },
  { id: 'ryze', name: 'Ryze', cost: 4, traits: ['Sorcerer', 'Arcane'] },
  // Cost 5
  { id: 'mordekaiser', name: 'Mordekaiser', cost: 5, traits: ['Ironclad', 'Shadow'] },
  { id: 'smolder', name: 'Smolder', cost: 5, traits: ['Sniper', 'Sentinel'] },
  { id: 'camille', name: 'Camille', cost: 5, traits: ['Assassin', 'Ironclad'] },
];

const costColors: Record<number, string> = {
  1: 'var(--cost-1)',
  2: 'var(--cost-2)',
  3: 'var(--cost-3)',
  4: 'var(--cost-4)',
  5: 'var(--cost-5)',
};

export function ChampionPool() {
  const addChampion = useTeamBuilderStore((s) => s.addChampion);

  const groupedByCost = [1, 2, 3, 4, 5].map((cost) => ({
    cost,
    champions: championPool.filter((c) => c.cost === cost),
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Champion Pool
      </h3>
      <div className="space-y-3">
        {groupedByCost.map(({ cost, champions }) => (
          <div key={cost}>
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-black text-white"
                style={{ backgroundColor: costColors[cost] }}
              >
                {cost}
              </span>
              <span className="text-xs text-muted-foreground">
                {cost}-cost
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-5">
              {champions.map((champ) => (
                <button
                  key={champ.id}
                  onClick={() => addChampion(champ.id)}
                  className="group relative flex flex-col items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 transition-all hover:border-[var(--accent-gold)]/50 hover:bg-[var(--card-bg)]"
                  title={`${champ.name} (${champ.traits.join(', ')})`}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: costColors[champ.cost] }}
                  >
                    {champ.name.slice(0, 2)}
                  </div>
                  <span className="truncate text-[10px] font-medium text-muted-foreground group-hover:text-[var(--foreground)]">
                    {champ.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

