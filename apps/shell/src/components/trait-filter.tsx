'use client';

interface TraitFilterProps {
  available: string[];
  selected: string[];
  onToggle: (trait: string) => void;
  onClear: () => void;
  label: string;
  clearLabel: string;
}

/** Multi-select trait chips shared by wiki, meta and builder filters. */
export function TraitFilter({ available, selected, onToggle, onClear, label, clearLabel }: TraitFilterProps) {
  if (available.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
          {selected.length > 0 ? ` (${selected.length})` : ''}
        </span>
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded text-[11px] font-medium text-[var(--accent-gold)] transition-colors hover:text-[var(--accent-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
      <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
        {available.map((trait) => {
          const active = selected.includes(trait);
          return (
            <button
              key={trait}
              type="button"
              onClick={() => onToggle(trait)}
              aria-pressed={active}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-95 ${
                active
                  ? 'bg-[var(--accent-gold)] font-bold text-[var(--gold-foreground)]'
                  : 'bg-[var(--background)] text-[var(--accent-blue-text)] hover:ring-1 hover:ring-[var(--accent-gold)]/50'
              }`}
            >
              {trait}
            </button>
          );
        })}
      </div>
    </div>
  );
}
