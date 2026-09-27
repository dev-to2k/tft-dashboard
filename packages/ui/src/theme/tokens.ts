// Token-backed class maps for tier / cost colors.
//
// The `text-*` / `bg-*` / `border-*` / `ring-*` utilities below are generated
// from the shell theme (`@theme inline` in `apps/shell/src/app/globals.css`),
// so they follow light/dark mode automatically. The `*Var` maps are for the
// few places that still need an inline `style` prop (e.g. dynamic
// `backgroundColor`); prefer the class maps for new code.

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

export const TIERS: readonly Tier[] = ['S', 'A', 'B', 'C', 'D'];

export const tierVar: Record<Tier, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
};

export const tierTextClass: Record<Tier, string> = {
  S: 'text-tier-s',
  A: 'text-tier-a',
  B: 'text-tier-b',
  C: 'text-tier-c',
  D: 'text-tier-d',
};

export const tierBadgeClass: Record<Tier, string> = {
  S: 'border-tier-s/40 bg-tier-s/10 text-tier-s',
  A: 'border-tier-a/40 bg-tier-a/10 text-tier-a',
  B: 'border-tier-b/40 bg-tier-b/10 text-tier-b',
  C: 'border-tier-c/40 bg-tier-c/10 text-tier-c',
  D: 'border-tier-d/40 bg-tier-d/10 text-tier-d',
};

export const costVar: Record<number, string> = {
  1: 'var(--cost-1)',
  2: 'var(--cost-2)',
  3: 'var(--cost-3)',
  4: 'var(--cost-4)',
  5: 'var(--cost-5)',
};

export const costTextClass: Record<number, string> = {
  1: 'text-cost-1',
  2: 'text-cost-2',
  3: 'text-cost-3',
  4: 'text-cost-4',
  5: 'text-cost-5',
};

export const costBgClass: Record<number, string> = {
  1: 'bg-cost-1',
  2: 'bg-cost-2',
  3: 'bg-cost-3',
  4: 'bg-cost-4',
  5: 'bg-cost-5',
};

export const costBgSoftClass: Record<number, string> = {
  1: 'bg-cost-1/15',
  2: 'bg-cost-2/15',
  3: 'bg-cost-3/15',
  4: 'bg-cost-4/15',
  5: 'bg-cost-5/15',
};

export const costBorderClass: Record<number, string> = {
  1: 'border-cost-1',
  2: 'border-cost-2',
  3: 'border-cost-3',
  4: 'border-cost-4',
  5: 'border-cost-5',
};

export const costRingClass: Record<number, string> = {
  1: 'ring-cost-1',
  2: 'ring-cost-2',
  3: 'ring-cost-3',
  4: 'ring-cost-4',
  5: 'ring-cost-5',
};

// ── Neon foundation tokens ──────────────────────────────
// Hex values mirror `:root` in `apps/shell/src/app/globals.css`.
// Prefer `neon*Class` maps (Tailwind `@theme inline` utilities)
// so colors follow the theme; use `neonVar` only for inline styles.

export const NEON = {
  background: '#0B0B16',
  card: '#12121F',
  gold: '#F0C75E',
  purple: '#A855F7',
  cyan: '#0AC8B9',
  glow: '0 0 24px rgba(240, 199, 94, 0.22), 0 0 64px rgba(168, 85, 247, 0.16)',
} as const;

export const neonVar = {
  background: 'var(--background)',
  card: 'var(--card-bg)',
  gold: 'var(--neon-gold)',
  purple: 'var(--neon-purple)',
  cyan: 'var(--neon-cyan)',
} as const;

export const neonTextClass = {
  gold: 'text-neon-gold',
  purple: 'text-neon-purple',
  cyan: 'text-neon-cyan',
} as const;

export const neonBgClass = {
  gold: 'bg-neon-gold',
  purple: 'bg-neon-purple',
  cyan: 'bg-neon-cyan',
} as const;

export const neonBorderClass = {
  gold: 'border-neon-gold',
  purple: 'border-neon-purple',
  cyan: 'border-neon-cyan',
} as const;
