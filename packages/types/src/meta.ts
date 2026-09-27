export type TierLabel = 'S' | 'A' | 'B' | 'C' | 'D';

export interface ChampionMetaStats {
  championId: string;
  name: string;
  cost: number;
  traits: string[];
  iconUrl: string;
  games: number;
  wins: number;
  winRate: number;
  top4Rate: number;
  pickRate: number;
  avgPlacement: number;
  tier: TierLabel;
  trend: 'up' | 'down' | 'stable';
  eloBracket: string;
  patchId: string;
}

export interface CompMetaStats {
  id: string;
  name: string;
  champions: string[];
  primaryTraits: string[];
  games: number;
  winRate: number;
  top4Rate: number;
  pickRate: number;
  avgPlacement: number;
  tier: TierLabel;
  /** Play style, e.g. `Fast 8`, `Slow Roll`, `lvl 7`. */
  style: string;
  /** Carry the composition is built around. */
  carry: string;
  eloBracket: string;
  patchId: string;
}

export interface MetaOverview {
  patchId: string;
  setNumber: number;
  setName: string;
  /** Matches analysed by the stats provider. */
  totalGames: number;
  trackedComps: number;
  updatedAt: string;
}
