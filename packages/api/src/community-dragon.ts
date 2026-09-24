import type { TftChampion, TftTrait, TftItem, TftAugment } from '@tft/types';

const COMMUNITY_DRAGON_BASE =
  'https://raw.communitydragon.org/latest/cdragon/tft/en_us.json';

interface CommunityDragonData {
  setData: Array<{
    mutator: string;
    champions: Array<{
      apiName: string;
      name: string;
      cost: number;
      traits: string[];
      ability: {
        name: string;
        desc: string;
        icon: string;
        mana: { Start: number; Max: number };
      };
      stats: {
        hp: number;
        armor: number;
        magicResist: number;
        damage: number;
        attackSpeed: number;
        range: number;
      };
      icon: string;
    }>;
    traits: Array<{
      apiName: string;
      name: string;
      desc: string;
      icon: string;
      tiers: Array<{
        style: number;
        count: number;
        desc: string;
      }>;
    }>;
    items: Array<{
      apiName: string;
      name: string;
      icon: string;
      from: number[];
      desc: string;
    }>;
    augments: Array<{
      apiName: string;
      name: string;
      desc: string;
      icon: string;
      tier: number;
    }>;
  }>;
}

const STYLE_MAP: Record<number, 'bronze' | 'silver' | 'gold' | 'chromatic'> = {
  0: 'bronze',
  1: 'silver',
  2: 'gold',
  3: 'chromatic',
};

const AUGMENT_TIER_MAP: Record<number, 'silver' | 'gold' | 'prismatic'> = {
  0: 'silver',
  1: 'gold',
  2: 'prismatic',
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Fetch and parse Community Dragon TFT data into typed entities.
 * Results are cached aggressively via browser cache + in-memory cache.
 */
let cachedData: {
  champions: TftChampion[];
  traits: TftTrait[];
  items: TftItem[];
  augments: TftAugment[];
} | null = null;

export async function fetchCommunityDragonData() {
  if (cachedData) return cachedData;

  const response = await fetch(COMMUNITY_DRAGON_BASE, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Community Dragon data: ${response.status}`);
  }

  const raw = (await response.json()) as CommunityDragonData;
  const setData = raw.setData[0];

  const champions: TftChampion[] = setData.champions.map((c) => ({
    id: c.apiName,
    slug: slugify(c.name),
    name: c.name,
    cost: c.cost as 1 | 2 | 3 | 4 | 5,
    traits: c.traits,
    ability: {
      name: c.ability.name,
      description: c.ability.desc,
      iconUrl: c.ability.icon,
      mana: { start: c.ability.mana.Start, max: c.ability.mana.Max },
    },
    stats: {
      hp: c.stats.hp,
      armor: c.stats.armor,
      magicResist: c.stats.magicResist,
      attackDamage: c.stats.damage,
      attackSpeed: c.stats.attackSpeed,
      range: c.stats.range,
    },
    iconUrl: c.icon,
    setName: setData.mutator,
  }));

  const traits: TftTrait[] = setData.traits.map((t) => ({
    id: t.apiName,
    slug: slugify(t.name),
    name: t.name,
    description: t.desc,
    iconUrl: t.icon,
    tiers: t.tiers.map((tier) => ({
      count: tier.count,
      effect: tier.desc,
      style: STYLE_MAP[tier.style],
    })),
  }));

  const items: TftItem[] = setData.items.map((i) => ({
    id: i.apiName,
    slug: slugify(i.name),
    name: i.name,
    iconUrl: i.icon,
    components: i.from.length === 2 ? [String(i.from[0]), String(i.from[1])] as [string, string] : [],
    description: i.desc,
  }));

  const augments: TftAugment[] = setData.augments.map((a) => ({
    id: a.apiName,
    slug: slugify(a.name),
    name: a.name,
    tier: AUGMENT_TIER_MAP[a.tier] ?? 'silver',
    description: a.desc,
    iconUrl: a.icon,
  }));

  cachedData = { champions, traits, items, augments };
  return cachedData;
}

export async function fetchChampions(): Promise<TftChampion[]> {
  const data = await fetchCommunityDragonData();
  return data.champions;
}

export async function fetchTraits(): Promise<TftTrait[]> {
  const data = await fetchCommunityDragonData();
  return data.traits;
}

export async function fetchItems(): Promise<TftItem[]> {
  const data = await fetchCommunityDragonData();
  return data.items;
}

export async function fetchAugments(): Promise<TftAugment[]> {
  const data = await fetchCommunityDragonData();
  return data.augments;
}
