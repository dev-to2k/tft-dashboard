const championsData = [
  { name: 'Lux', cost: 4, tier: 'S', winRate: 54.2, avgPlace: 3.1, pickRate: 38.5, traits: ['Sorcerer', 'Arcane'] },
  { name: 'Garen', cost: 3, tier: 'S', winRate: 53.8, avgPlace: 3.2, pickRate: 42.1, traits: ['Bruiser', 'Ironclad'] },
  { name: 'Akali', cost: 4, tier: 'S', winRate: 53.1, avgPlace: 3.3, pickRate: 35.7, traits: ['Assassin', 'Phantom'] },
  { name: 'Ashe', cost: 2, tier: 'A', winRate: 51.9, avgPlace: 3.5, pickRate: 44.2, traits: ['Sniper', 'Celestial'] },
  { name: 'Syndra', cost: 3, tier: 'A', winRate: 51.4, avgPlace: 3.6, pickRate: 31.8, traits: ['Sorcerer', 'Sentinel'] },
  { name: 'Darius', cost: 3, tier: 'A', winRate: 50.8, avgPlace: 3.7, pickRate: 36.4, traits: ['Bruiser', 'Demolitionist'] },
  { name: 'Sett', cost: 3, tier: 'A', winRate: 50.5, avgPlace: 3.8, pickRate: 29.3, traits: ['Bruiser', 'Shadow'] },
  { name: 'Jinx', cost: 4, tier: 'B', winRate: 49.5, avgPlace: 4.0, pickRate: 28.1, traits: ['Sniper', 'Shadow'] },
  { name: 'Vex', cost: 1, tier: 'B', winRate: 49.1, avgPlace: 4.1, pickRate: 52.3, traits: ['Enchanter', 'Arcane'] },
  { name: 'Katarina', cost: 3, tier: 'B', winRate: 48.7, avgPlace: 4.2, pickRate: 25.6, traits: ['Assassin', 'Demolitionist'] },
  { name: 'Mordekaiser', cost: 5, tier: 'B', winRate: 48.3, avgPlace: 4.3, pickRate: 18.9, traits: ['Ironclad', 'Shadow'] },
  { name: 'Zyra', cost: 2, tier: 'C', winRate: 47.2, avgPlace: 4.5, pickRate: 22.4, traits: ['Sorcerer', 'Enchanter'] },
  { name: 'Shaco', cost: 2, tier: 'C', winRate: 46.8, avgPlace: 4.6, pickRate: 19.7, traits: ['Assassin', 'Phantom'] },
  { name: 'Lulu', cost: 1, tier: 'C', winRate: 46.1, avgPlace: 4.7, pickRate: 33.5, traits: ['Enchanter', 'Celestial'] },
  { name: 'Talon', cost: 2, tier: 'D', winRate: 44.5, avgPlace: 5.1, pickRate: 14.2, traits: ['Assassin', 'Ironclad'] },
  { name: 'Ornn', cost: 4, tier: 'D', winRate: 43.9, avgPlace: 5.3, pickRate: 12.8, traits: ['Bruiser', 'Celestial'] },
];

const tierColors: Record<string, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
};

const costColors: Record<number, string> = {
  1: 'var(--cost-1)',
  2: 'var(--cost-2)',
  3: 'var(--cost-3)',
  4: 'var(--cost-4)',
  5: 'var(--cost-5)',
};

export default function ChampionsTierListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">
          Champion Tier List
        </h1>
        <p className="mt-2 text-[var(--foreground)]/50">
          All champions sorted by win rate for Patch 15.8
        </p>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase tracking-wider text-[var(--foreground)]/40">
                <th className="px-4 py-3 font-medium">Champion</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium text-right">Win Rate</th>
                <th className="px-4 py-3 font-medium text-right">Avg Place</th>
                <th className="hidden px-4 py-3 font-medium text-right sm:table-cell">Pick Rate</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Traits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {championsData.map((champ) => (
                <tr
                  key={champ.name}
                  className="transition-colors hover:bg-[var(--background)]/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                        style={{ backgroundColor: costColors[champ.cost] }}
                      >
                        {champ.name.slice(0, 2)}
                      </div>
                      <span className="font-semibold text-[var(--foreground)]">
                        {champ.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-medium"
                      style={{ color: costColors[champ.cost] }}
                    >
                      {champ.cost}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-black"
                      style={{
                        backgroundColor: `${tierColors[champ.tier]}20`,
                        color: tierColors[champ.tier],
                      }}
                    >
                      {champ.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="font-semibold"
                      style={{
                        color: champ.winRate >= 50 ? 'var(--accent-gold)' : 'var(--foreground)/70',
                      }}
                    >
                      {champ.winRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--foreground)]/70">
                    {champ.avgPlace}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-[var(--foreground)]/70 sm:table-cell">
                    {champ.pickRate}%
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {champ.traits.map((trait) => (
                        <span
                          key={trait}
                          className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] text-[var(--accent-blue)]"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
