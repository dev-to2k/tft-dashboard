export interface ChampionMetaStats {
  championId: string;
  games: number;
  wins: number;
  winRate: number;
  pickRate: number;
  avgPlacement: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
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
  pickRate: number;
  avgPlacement: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  eloBracket: string;
  patchId: string;
}
