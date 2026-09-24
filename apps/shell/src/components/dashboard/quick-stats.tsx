const stats = [
  {
    label: 'Current Patch',
    value: '15.8',
    subtext: 'Enchanted Wilds',
    color: 'var(--accent-gold)',
  },
  {
    label: 'Top Comp',
    value: 'Arcane Sentinels',
    subtext: '52.3% win rate',
    color: 'var(--accent-blue)',
  },
  {
    label: 'Trending Champion',
    value: 'Lux',
    subtext: '4-cost | Sorcerer',
    color: 'var(--cost-4)',
  },
  {
    label: 'Active Players',
    value: '1.2M',
    subtext: '+8.4% this week',
    color: 'var(--tier-b)',
  },
];

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 transition-all hover:border-[var(--accent-gold)]/40"
        >
          <p className="text-sm font-medium text-[var(--foreground)]/60">
            {stat.label}
          </p>
          <p
            className="mt-1 text-2xl font-bold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">
            {stat.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
