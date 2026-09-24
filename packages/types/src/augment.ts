export interface TftAugment {
  id: string;
  slug: string;
  name: string;
  tier: 'silver' | 'gold' | 'prismatic';
  description: string;
  iconUrl: string;
}
