import type { TftChampion, TftTrait, TftItem, TftAugment } from '@tft/types';
import { fetchTftStrings, normalizeGameLocale, type GameLocale } from './tft-strings';

/**
 * Community Dragon static game data (free, no API key, CORS enabled).
 * Docs: https://communitydragon.org/
 */
const CDN_ORIGIN = 'https://raw.communitydragon.org/latest';
export const COMMUNITY_DRAGON_DATA_URL = `${CDN_ORIGIN}/cdragon/tft/en_us.json`;

// ---------------------------------------------------------------------------
// Upstream fetch with a short timeout + one retry.
// Community Dragon occasionally stalls (large TFT dump); fail fast and retry
// once instead of hanging the page on a cold fetch.
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 8000;
const FETCH_RETRIES = 1;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(input: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      return await fetch(input, {
        ...init,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_RETRIES) await sleep(400 * (attempt + 1));
    }
  }
  throw lastError;
}

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
// Upstream-shape guards
//
// The dump is a 30MB untyped JSON blob; fields go missing between patches.
// These keep a single bad entry from throwing during the join and taking the
// whole page down with a 500.
// ---------------------------------------------------------------------------

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a Community Dragon asset path (`.../foo.tex`) into a hot-linkable
 * png URL. Anything that is not a CDN-relative asset path returns `''` so the
 * UI falls back to initials/gradients instead of handing `next/image` a host
 * that is not on the `images.remotePatterns` allowlist.
 */
export function toCdragonUrl(path?: string | null): string {
  if (typeof path !== 'string') return '';
  const raw = path.trim();
  if (raw === '' || raw === 'None') return '';
  // Absolute URLs are only kept when they already point at the CDN origin.
  if (/^https?:\/\//i.test(raw)) {
    return raw.startsWith(`${CDN_ORIGIN}/`) ? raw : '';
  }
  const clean = raw.toLowerCase().replace(/\.tex$/, '.png').replace(/^\//, '');
  if (clean === '' || clean === 'none') return '';
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
    .replace(/\\n/g, ' ')
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

  for (const champion of asArray<RawChampion>(set?.champions)) {
    if (!champion || typeof champion.apiName !== 'string' || skip.test(champion.apiName)) continue;
    if (typeof champion.name !== 'string' || champion.name.trim() === '') continue;
    const cost = asNumber(champion.cost, 0);
    if (cost < 1 || cost > 5) continue;
    if (asArray<unknown>(champion.traits).length === 0) continue;
    champion.cost = cost;
    if (!Array.isArray(champion.traits)) champion.traits = [];

    const baseName = champion.name.replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (baseName === '') continue;
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
  const stats = (champion.stats ?? {}) as RawStats;
  const ability = champion.ability ?? {};
  const baseName = champion.name.replace(/\s*\([^)]*\)\s*$/, '').trim();

  return {
    id: champion.apiName,
    slug: slugify(baseName),
    name: baseName,
    cost: asNumber(champion.cost, 1) as 1 | 2 | 3 | 4 | 5,
    traits: asArray<string>(champion.traits).filter((trait) => typeof trait === 'string'),
    ability: {
      name: cleanText(ability.name),
      description: cleanText(ability.desc),
      iconUrl: toCdragonUrl(ability.icon),
      mana: {
        start: asNumber(stats?.initialMana, 0),
        max: asNumber(stats?.mana, 0),
      },
    },
    stats: {
      hp: asNumber(stats?.hp, 0),
      armor: asNumber(stats?.armor, 0),
      magicResist: asNumber(stats?.magicResist, 0),
      attackDamage: asNumber(stats?.damage, 0),
      attackSpeed: Math.round(asNumber(stats?.attackSpeed, 0) * 100) / 100,
      range: asNumber(stats?.range, 0),
    },
    iconUrl: toCdragonUrl(champion.squareIcon ?? champion.tileIcon ?? champion.icon),
    splashUrl: toCdragonUrl(champion.icon),
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
    tiers: asArray<{ minUnits?: number }>(trait.effects).map((effect, index) => ({
      count: asNumber(effect?.minUnits, 0),
      effect: '',
      style: toTraitStyle(index),
    })),
  };
}

function mapItem(item: RawItem): TftItem {
  const from = asArray<string>(item.from).filter((entry): entry is string => typeof entry === 'string');
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

let staticCache = new Map<string, Promise<TftStaticData>>();

/** Fetch + trim the Community Dragon dump down to the current set only. */
export function fetchStaticData(locale: GameLocale = 'en'): Promise<TftStaticData> {
  const key = normalizeGameLocale(locale);
  const cached = staticCache.get(key);
  if (cached) return cached;
  const task = loadStaticData(key).catch((error) => {
    staticCache.delete(key);
    throw error;
  });
  staticCache.set(key, task);
  return task;
}

async function loadStaticData(locale: GameLocale): Promise<TftStaticData> {
  const response = await fetchWithRetry(COMMUNITY_DRAGON_DATA_URL, {
    headers: { 'User-Agent': 'tft-dashboard' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Community Dragon data: ${response.status}`);
  }

  const raw = (await response.json()) as RawCommunityDragon;
  const sets = asArray<RawSetData>(raw?.setData).filter(
    (set) => set && asArray<unknown>(set.champions).length > 0,
  );
  if (sets.length === 0) {
    throw new Error('Community Dragon data contained no sets');
  }

  // The current set is the highest numbered one (setData order is arbitrary).
  const set = sets.reduce((a, b) => (asNumber(b.number) > asNumber(a.number) ? b : a));
  const itemsByName = new Map(
    asArray<RawItem>(raw?.items)
      .filter((item) => item && typeof item.apiName === 'string')
      .map((item) => [item.apiName, item]),
  );

  const setName = `Set ${asNumber(set.number)}`;
  const champions = toPlayableChampions(set).map((champion) => mapChampion(champion, setName));
  const traits = asArray<RawTrait>(set.traits)
    .filter((trait) => trait && typeof trait.apiName === 'string' && typeof trait.name === 'string')
    .map(mapTrait);

  const items = asArray<string>(set.items)
    .map((apiName) => itemsByName.get(apiName))
    .filter((item): item is RawItem => Boolean(item) && item!.isAugment !== true)
    .map(mapItem);

  const augments = asArray<string>(set.augments)
    .map((apiName) => itemsByName.get(apiName))
    .filter((item): item is RawItem => Boolean(item) && item!.isAugment !== false)
    .map(mapAugment);

  // Localized display-name overlay (slugs/ids stay English-derived and stable).
  if (locale !== 'en') {
    const strings = await fetchTftStrings(locale);
    const traitViByEn = new Map<string, string>();
    for (const trait of traits) {
      const localized = strings.traits.get(trait.id);
      if (localized) {
        traitViByEn.set(trait.name, localized);
        trait.name = localized;
      }
    }
    for (const champion of champions) {
      const localized = strings.champions.get(champion.id);
      if (localized) champion.name = localized;
      champion.traits = champion.traits.map((name) => traitViByEn.get(name) ?? name);
    }
  }

  return {
    set: { id: asText(set.mutator, 'tft'), number: asNumber(set.number), name: setName },
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
