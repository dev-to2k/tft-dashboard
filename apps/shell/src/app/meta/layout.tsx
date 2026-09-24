export default function MetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Filter Bar Placeholder */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
        <span className="text-sm font-medium text-[var(--foreground)]/50">
          Filters:
        </span>
        {['All', 'Diamond+', 'Master+', 'Challenger'].map((bracket) => (
          <button
            key={bracket}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/70 transition-colors hover:border-[var(--accent-gold)]/40 hover:text-[var(--accent-gold)]"
          >
            {bracket}
          </button>
        ))}
        <div className="ml-auto hidden sm:block">
          <select className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs text-[var(--foreground)]/70 outline-none focus:border-[var(--accent-gold)]">
            <option>Set 18 - Enchanted Wilds</option>
            <option>Set 17 - Fates Reborn</option>
          </select>
        </div>
      </div>

      {children}
    </div>
  );
}
