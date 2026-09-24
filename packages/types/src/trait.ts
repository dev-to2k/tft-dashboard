export interface TraitTier {
  count: number;
  effect: string;
  style?: 'bronze' | 'silver' | 'gold' | 'chromatic';
}

export interface TftTrait {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl: string;
  tiers: TraitTier[];
}
