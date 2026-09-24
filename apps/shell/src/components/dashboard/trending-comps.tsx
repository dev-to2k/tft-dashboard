const trendingComps = [
  {
    name: 'Arcane Sentinels',
    tier: 'S' as const,
    winRate: '52.3%',
    avgPlace: '3.2',
    champions: ['Lux', 'Syndra', 'Ryze', 'Zyra', 'Vex'],
    traits: ['Sorcerer', 'Sentinel', 'Arcane'],
  },
  {
    name: 'Ironclad Bruisers',
    tier: 'S' as const,
    winRate: '51.8%',
    avgPlace: '3.4',
    champions: ['Garen', 'Darius', 'Sett', 'Mordekaiser', 'Ornn'],
    traits: ['Bruiser', 'Ironclad', 'Demolitionist'],
  },
  {
    name: 'Phantom Assassins',
    tier: 'A' as const,
    winRate: '49.7%',
    avgPlace: '3.8',
    champions: ['Akali', 'Katarina', 'Zed', 'Talon', 'Shaco'],
    traits: ['Assassin', 'Phantom', 'Shadow'],
  },
  {
    name: 'Celestial Snipers',
    tier: 'A' as const,
    winRate: '48.9%',
    avgPlace: '4.1',
    champions: ['Ashe', 'Jinx', 'Caitlyn', 'Varus', 'Lulu'],
    traits: ['Sniper', 'Celestial', 'Enchanter'],
  },
];

const tierColors: Record<string, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
};

export function TrendingComps() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {trendingComps.map((comp) => (
        <div
          key={comp.name}
          className="group rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 transition-all hover:border-[var(--accent-gold)]/40 hover:shadow-lg hover:shadow-[var(--accent-gold)]/5"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                {comp.name}
              </h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {comp.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--accent-blue)]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-black"
              style={{
                backgroundColor: `${tierColors[comp.tier]}20`,
                color: tierColors[comp.tier],
              }}
            >
              {comp.tier}
            </span>
          </div>

          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-xs text-[var(--foreground)]/50">Win Rate</p>
              <p className="text-sm font-semibold text-[var(--accent-gold)]">
                {comp.winRate}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--foreground)]/50">Avg Place</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {comp.avgPlace}
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-1">
            {comp.champions.map((champ) => (
              <div
                key={champ}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--background)] text-[10px] font-medium text-[var(--foreground)]/70 ring-1 ring-[var(--border)]"
                title={champ}
              >
                {champ.slice(0, 2)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
