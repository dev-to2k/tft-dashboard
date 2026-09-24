import Link from 'next/link';

const tierListData = [
  { name: 'Lux', cost: 4, tier: 'S', winRate: 54.2, avgPlace: 3.1, traits: ['Sorcerer', 'Arcane'] },
  { name: 'Garen', cost: 3, tier: 'S', winRate: 53.8, avgPlace: 3.2, traits: ['Bruiser', 'Ironclad'] },
  { name: 'Akali', cost: 4, tier: 'S', winRate: 53.1, avgPlace: 3.3, traits: ['Assassin', 'Phantom'] },
  { name: 'Ashe', cost: 2, tier: 'A', winRate: 51.9, avgPlace: 3.5, traits: ['Sniper', 'Celestial'] },
  { name: 'Syndra', cost: 3, tier: 'A', winRate: 51.4, avgPlace: 3.6, traits: ['Sorcerer', 'Sentinel'] },
  { name: 'Darius', cost: 3, tier: 'A', winRate: 50.8, avgPlace: 3.7, traits: ['Bruiser', 'Demolitionist'] },
  { name: 'Jinx', cost: 4, tier: 'B', winRate: 49.5, avgPlace: 4.0, traits: ['Sniper', 'Shadow'] },
  { name: 'Vex', cost: 1, tier: 'B', winRate: 49.1, avgPlace: 4.1, traits: ['Enchanter', 'Arcane'] },
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

export default function MetaOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">
          Meta Overview
        </h1>
        <p className="mt-2 text-[var(--foreground)]/50">
          Champion tier list and win rates for Patch 15.8
        </p>
      </div>

      {/* Tier Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(['S', 'A', 'B', 'C', 'D'] as const).map((tier) => {
          const count = tierListData.filter((c) => c.tier === tier).length;
          return (
            <div
              key={tier}
              className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-center"
            >
              <span
                className="text-2xl font-black"
                style={{ color: tierColors[tier] }}
              >
                {tier}
              </span>
              <p className="mt-1 text-xs text-[var(--foreground)]/40">
                {count} champion{count !== 1 ? 's' : ''}
              </p>
            </div>
          );
        })}
      </div>

      {/* Champion Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Top Champions
          </h2>
          <Link
            href="/meta/champions"
            className="text-sm font-medium text-[var(--accent-gold)] hover:text-[var(--accent-blue)]"
          >
            Full Tier List &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tierListData.map((champ) => (
            <div
              key={champ.name}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-all hover:border-[var(--accent-gold)]/30"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: costColors[champ.cost] }}
              >
                {champ.name.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--foreground)]">
                    {champ.name}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-black"
                    style={{
                      backgroundColor: `${tierColors[champ.tier]}20`,
                      color: tierColors[champ.tier],
                    }}
                  >
                    {champ.tier}
                  </span>
                </div>
                <p className="truncate text-xs text-[var(--foreground)]/40">
                  {champ.traits.join(' / ')}
                </p>
                <p className="mt-1 text-xs font-semibold text-[var(--accent-gold)]">
                  {champ.winRate}% WR
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
