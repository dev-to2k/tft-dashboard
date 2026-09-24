'use client';

import { useState } from 'react';

interface ChampionEntry {
  name: string;
  cost: 1 | 2 | 3 | 4 | 5;
  traits: string[];
  ability: string;
}

const champions: ChampionEntry[] = [
  // Cost 1
  { name: 'Vex', cost: 1, traits: ['Enchanter', 'Arcane'], ability: 'Shield Burst' },
  { name: 'Lulu', cost: 1, traits: ['Enchanter', 'Celestial'], ability: 'Whimsy' },
  { name: 'Poppy', cost: 1, traits: ['Bruiser', 'Sentinel'], ability: 'Hammer Shock' },
  { name: "Kog'Maw", cost: 1, traits: ['Sniper', 'Shadow'], ability: 'Bio-Arcane Barrage' },
  { name: 'Twisted Fate', cost: 1, traits: ['Sorcerer', 'Phantom'], ability: 'Wild Cards' },
  // Cost 2
  { name: 'Ashe', cost: 2, traits: ['Sniper', 'Celestial'], ability: 'Enchanted Crystal Arrow' },
  { name: 'Zyra', cost: 2, traits: ['Sorcerer', 'Enchanter'], ability: 'Grasping Roots' },
  { name: 'Shaco', cost: 2, traits: ['Assassin', 'Phantom'], ability: 'Two-Shiv Poison' },
  { name: 'Talon', cost: 2, traits: ['Assassin', 'Ironclad'], ability: 'Rake' },
  { name: 'Teemo', cost: 2, traits: ['Demolitionist', 'Celestial'], ability: 'Blinding Dart' },
  // Cost 3
  { name: 'Garen', cost: 3, traits: ['Bruiser', 'Ironclad'], ability: 'Judgment' },
  { name: 'Syndra', cost: 3, traits: ['Sorcerer', 'Sentinel'], ability: 'Force of Will' },
  { name: 'Darius', cost: 3, traits: ['Bruiser', 'Demolitionist'], ability: 'Noxian Guillotine' },
  { name: 'Sett', cost: 3, traits: ['Bruiser', 'Shadow'], ability: 'The Show Stopper' },
  { name: 'Katarina', cost: 3, traits: ['Assassin', 'Demolitionist'], ability: 'Death Lotus' },
  // Cost 4
  { name: 'Lux', cost: 4, traits: ['Sorcerer', 'Arcane'], ability: 'Final Spark' },
  { name: 'Akali', cost: 4, traits: ['Assassin', 'Phantom'], ability: 'Perfect Execution' },
  { name: 'Jinx', cost: 4, traits: ['Sniper', 'Shadow'], ability: 'Super Mega Death Rocket' },
  { name: 'Ornn', cost: 4, traits: ['Bruiser', 'Celestial'], ability: 'Call of the Forge God' },
  { name: 'Ryze', cost: 4, traits: ['Sorcerer', 'Arcane'], ability: 'Spell Flux' },
  // Cost 5
  { name: 'Mordekaiser', cost: 5, traits: ['Ironclad', 'Shadow'], ability: 'Realm of Death' },
  { name: 'Smolder', cost: 5, traits: ['Sniper', 'Sentinel'], ability: 'Infernal Breath' },
  { name: 'Camille', cost: 5, traits: ['Assassin', 'Ironclad'], ability: 'The Hextech Ultimatum' },
];

const costColors: Record<number, string> = {
  1: 'var(--cost-1)',
  2: 'var(--cost-2)',
  3: 'var(--cost-3)',
  4: 'var(--cost-4)',
  5: 'var(--cost-5)',
};

export default function WikiChampionsPage() {
  const [search, setSearch] = useState('');
  const [costFilter, setCostFilter] = useState<number | null>(null);

  const filtered = champions.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.traits.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCost = costFilter === null || c.cost === costFilter;
    return matchesSearch && matchesCost;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[var(--foreground)]">Champions</h2>
        <p className="mt-1 text-sm text-[var(--foreground)]/50">
          Browse all {champions.length} champions in Set 18 - Enchanted Wilds
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or trait..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 outline-none focus:border-[var(--accent-gold)] transition-colors"
        />
        <div className="flex gap-1.5">
          <button
            onClick={() => setCostFilter(null)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              costFilter === null
                ? 'bg-[var(--accent-gold)] text-[var(--background)]'
                : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5].map((cost) => (
            <button
              key={cost}
              onClick={() => setCostFilter(costFilter === cost ? null : cost)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                costFilter === cost
                  ? 'text-white'
                  : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
              }`}
              style={
                costFilter === cost
                  ? { backgroundColor: costColors[cost] }
                  : undefined
              }
            >
              {cost}
            </button>
          ))}
        </div>
      </div>

      {/* Champion Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((champ) => (
          <div
            key={champ.name}
            className="group relative overflow-hidden rounded-xl border bg-[var(--card-bg)] p-4 transition-all hover:shadow-lg"
            style={{
              borderColor: costColors[champ.cost],
              borderWidth: '2px',
            }}
          >
            <div
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow-md"
              style={{ backgroundColor: costColors[champ.cost] }}
            >
              {champ.name.slice(0, 2)}
            </div>
            <h3 className="text-center text-sm font-bold text-[var(--foreground)]">
              {champ.name}
            </h3>
            <p className="mt-0.5 text-center text-[10px] text-[var(--foreground)]/40">
              {champ.ability}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {champ.traits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-[var(--background)] px-1.5 py-0.5 text-[9px] text-[var(--accent-blue)]"
                >
                  {trait}
                </span>
              ))}
            </div>
            <div
              className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded text-[10px] font-black text-white"
              style={{ backgroundColor: costColors[champ.cost] }}
            >
              {champ.cost}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-[var(--foreground)]/30">
          No champions match your filters.
        </div>
      )}
    </div>
  );
}
