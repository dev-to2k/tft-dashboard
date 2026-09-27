import type { TftChampion, TftTrait, TftItem, TftAugment } from '@tft/types';

/**
 * Community Dragon static game data (free, no API key, CORS enabled).
 * Docs: https://communitydragon.org/
 */
const CDN_ORIGIN = 'https://raw.communitydragon.org/latest';
export const COMMUNITY_DRAGON_DATA_URL = `${CDN_ORIGIN}/cdragon/tft/en_us.json`;

// ---------------------------------------------------------------------------
// Raw Community Dragon shapes (only the fields we actually consume)
// ---------------------------------------------------------------------------

interface RawStats {
  hp?: number;
  armor?: number;
  magicResist?: number;
  damage?: number;
  attackSpeed?: number;
  range?: number;
  mana?: number;
  initialMana?: number;
}

interface RawChampion {
  apiName: string;
  name: string;
  cost: number;
  traits: string[];
  icon?: string;
  squareIcon?: string;
  tileIcon?: string;
  ability?: { name?: string; desc?: string; icon?: string };
  stats?: RawStats;
}

interface RawTrait {
  apiName: string;
  name: string;
  desc?: string;
  icon?: string;
  effects?: Array<{ minUnits?: number; maxUnits?: number; style?: number }>;
}

interface RawItem {
  apiName: string;
  name?: string;
  desc?: string;
  icon?: string;
  from?: string[] | null;
  isAugment?: boolean;
}

interface RawSetData {
  mutator: string;
  number: number;
  name: string;
  champions: RawChampion[];
  traits: RawTrait[];
  items: string[];
  augments: string[];
}

interface RawCommunityDragon {
  setData: RawSetData[];
  items: RawItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a Community Dragon asset path (`.../foo.tex`) into a hot-linkable png URL. */
export function toCdragonUrl(path?: string | null): string {
  if (!path || path === 'None') return '';
  const clean = path.toLowerCase().replace(/\.tex$/, '.png').replace(/^\//, '');
  if (clean.startsWith('lol/')) {
    return `${CDN_ORIGIN}/game/${clean.slice(4)}`;
  }
  return `${CDN_ORIGIN}/game/${clean}`;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Strip Riot markup (`<row>`, `@Var@`, `%i:scaleAP%`) so descriptions are readable. */
function cleanText(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/%i:[a-zA-Z0-9_]+%/g, '')
    .replace(/@[A-Za-z0-9_.*()+\- ]+@/g, '?')
    .replace(/\{\{[A-Za-z0-9_]+\}\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, max = 240): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * Keep only units players can actually field, and collapse alternate forms of the
 * same champion (e.g. `Lux (Coven)` variants) into a single entry.
 */
function toPlayableChampions(set: RawSetData): RawChampion[] {
  const skip = /Dummy|Voidspawn|PracticeTarget/i;
  const byBaseName = new Map<string, RawChampion>();

  for (const champion of set.champions ?? []) {
    if (!champion?.apiName || skip.test(champion.apiName)) continue;
    if (!Number.isFinite(champion.cost) || champion.cost < 1 || champion.cost > 5) continue;
    if (!Array.isArray(champion.traits) || champion.traits.length === 0) continue;

    const baseName = champion.name.replace(/\s*\([^)]*\)\s*$/, '').trim();
    const existing = byBaseName.get(baseName);
    if (!existing) {
      byBaseName.set(baseName, champion);
      continue;
    }
    // Prefer the plain form over renamed variants such as `Lux (Blackthorn)`.
    const existingIsVariant = /\s*\([^)]*\)\s*$/.test(existing.name);
    const incomingIsVariant = /\s*\([^)]*\)\s*$/.test(champion.name);
    if (existingIsVariant && !incomingIsVariant) byBaseName.set(baseName, champion);
  }

  return [...byBaseName.values()];
}

function toTraitStyle(index: number): 'bronze' | 'silver' | 'gold' | 'chromatic' {
  if (index === 0) return 'bronze';
  if (index === 1) return 'silver';
  if (index === 2) return 'gold';
  return 'chromatic';
}

function inferAugmentTier(name: string): 'silver' | 'gold' | 'prismatic' {
  if (/\bIII\b/.test(name)) return 'prismatic';
  if (/\bII\b/.test(name)) return 'gold';
  return 'silver';
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function mapChampion(champion: RawChampion, setName: string): TftChampion {
  const stats = champion.stats ?? {};
  const ability = champion.ability ?? {};
  const baseName = champion.name.replace(/\s*\([^)]*\)\s*$/, '').trim();

  return {
    id: champion.apiName,
    slug: slugify(baseName),
    name: baseName,
    cost: champion.cost as 1 | 2 | 3 | 4 | 5,
    traits: champion.traits,
    ability: {
      name: cleanText(ability.name),
      description: cleanText(ability.desc),
      iconUrl: toCdragonUrl(ability.icon),
      mana: {
        start: stats.initialMana ?? 0,
        max: stats.mana ?? 0,
      },
    },
    stats: {
      hp: stats.hp ?? 0,
      armor: stats.armor ?? 0,
      magicResist: stats.magicResist ?? 0,
      attackDamage: stats.damage ?? 0,
      attackSpeed: Math.round((stats.attackSpeed ?? 0) * 100) / 100,
      range: stats.range ?? 0,
    },
    iconUrl: toCdragonUrl(champion.squareIcon ?? champion.tileIcon ?? champion.icon),
    setName,
  };
}

function mapTrait(trait: RawTrait): TftTrait {
  return {
    id: trait.apiName,
    slug: slugify(trait.name),
    name: trait.name,
    description: truncate(cleanText(trait.desc), 400),
    iconUrl: toCdragonUrl(trait.icon),
    tiers: (trait.effects ?? []).map((effect, index) => ({
      count: effect.minUnits ?? 0,
      effect: '',
      style: toTraitStyle(index),
    })),
  };
}

function mapItem(item: RawItem): TftItem {
  const from = Array.isArray(item.from) ? item.from : [];
  return {
    id: item.apiName,
    slug: slugify(item.name ?? item.apiName),
    name: item.name ?? item.apiName,
    iconUrl: toCdragonUrl(item.icon),
    components: from.length === 2 ? [from[0], from[1]] : [],
    description: truncate(cleanText(item.desc)),
  };
}

function mapAugment(item: RawItem): TftAugment {
  const name = item.name ?? item.apiName;
  return {
    id: item.apiName,
    slug: slugify(name),
    name,
    tier: inferAugmentTier(name),
    description: truncate(cleanText(item.desc)),
    iconUrl: toCdragonUrl(item.icon),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface TftStaticData {
  set: { id: string; number: number; name: string };
  champions: TftChampion[];
  traits: TftTrait[];
  items: TftItem[];
  augments: TftAugment[];
}

let staticCache: Promise<TftStaticData> | null = null;

/** Fetch + trim the Community Dragon dump down to the current set only. */
export function fetchStaticData(): Promise<TftStaticData> {
  if (!staticCache) {
    staticCache = loadStaticData().catch((error) => {
      staticCache = null;
      throw error;
    });
  }
  return staticCache;
}

async function loadStaticData(): Promise<TftStaticData> {
  const response = await fetch(COMMUNITY_DRAGON_DATA_URL, {
    headers: { 'User-Agent': 'tft-dashboard' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Community Dragon data: ${response.status}`);
  }

  const raw = (await response.json()) as RawCommunityDragon;
  const sets = (raw.setData ?? []).filter(
    (set) => Array.isArray(set.champions) && set.champions.length > 0,
  );
  if (sets.length === 0) {
    throw new Error('Community Dragon data contained no sets');
  }

  // The current set is the highest numbered one (setData order is arbitrary).
  const set = sets.reduce((a, b) => (b.number > a.number ? b : a));
  const itemsByName = new Map((raw.items ?? []).map((item) => [item.apiName, item]));

  const setName = `Set ${set.number}`;
  const champions = toPlayableChampions(set).map((champion) => mapChampion(champion, setName));
  const traits = (set.traits ?? []).map(mapTrait);

  const items = (set.items ?? [])
    .map((apiName) => itemsByName.get(apiName))
    .filter((item): item is RawItem => Boolean(item) && item!.isAugment !== true)
    .map(mapItem);

  const augments = (set.augments ?? [])
    .map((apiName) => itemsByName.get(apiName))
    .filter((item): item is RawItem => Boolean(item) && item!.isAugment !== false)
    .map(mapAugment);

  return {
    set: { id: set.mutator, number: set.number, name: setName },
    champions,
    traits,
    items,
    augments,
  };
}

export async function fetchChampions(): Promise<TftChampion[]> {
  return (await fetchStaticData()).champions;
}

export async function fetchTraits(): Promise<TftTrait[]> {
  return (await fetchStaticData()).traits;
}

export async function fetchItems(): Promise<TftItem[]> {
  return (await fetchStaticData()).items;
}

export async function fetchAugments(): Promise<TftAugment[]> {
  return (await fetchStaticData()).augments;
}
