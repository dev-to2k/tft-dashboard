import type { ChampionMetaStats, CompMetaStats, MetaOverview, TftChampion, TftTrait } from '@tft/types';
import { fetchStaticData } from './community-dragon';

/**
 * MetaTFT public statistics (free, no API key, CORS enabled).
 * Placement histograms are aggregated by MetaTFT from Riot match data.
 */
const METATFT_BASE = 'https://api-hc.metatft.com';
const UNITS_URL = `${METATFT_BASE}/tft-stat-api/units`;
const COMPS_DATA_URL = `${METATFT_BASE}/tft-comps-api/comps_data`;
const COMPS_STATS_URL = `${METATFT_BASE}/tft-comps-api/comps_stats`;
const GAMES_URL = `${METATFT_BASE}/tft-stat-api/games?days=7`;

const MIN_UNIT_GAMES = 100_000;
const MIN_COMP_GAMES = 10_000;
const MAX_COMPETITORS = 8;

// ---------------------------------------------------------------------------
// Raw MetaTFT shapes
// ---------------------------------------------------------------------------

interface UnitRow {
  unit: string;
  places: number[];
}

interface CompNamePart {
  name: string;
  type: string;
  score?: number;
}

interface CompDetail {
  name?: CompNamePart[];
  units_string?: string;
  traits_string?: string;
  levelling?: string;
}

interface CompsDataResponse {
  results?: { data?: { cluster_details?: Record<string, CompDetail> } };
}

interface CompStatRow {
  cluster: string;
  places: number[];
  count?: number;
}

interface GamesResponse {
  games?: Array<{ patch: string; b_patch_version?: string; count: number }>;
  current_patch?: { patch: string; b_patch_version?: string; count: number };
  updated?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VARIANT_SUFFIXES = ['base', 'small', 'cougar', 'summonmelee', 'melee', 'ranged', 'clone', 'form', 'ad', 'ap'];

/**
 * Collapse every id format used across sources into one comparable key.
 * `DA_18_Ahri`, `DA_Ahri18`, `TFT18_Ahri` and `DA_18_Hunter_3` all become stable keys.
 */
export function normalizeId(id: string): string {
  const tokens = id
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((token) => token.toLowerCase());

  let key = '';
  for (const token of tokens) {
    const withoutPrefix = token.replace(/^tft\d*$/, '').replace(/^\d+$/, '');
    const withoutSetNumber = withoutPrefix.replace(/^\d+/, '').replace(/\d+$/, '');
    if (!withoutSetNumber) continue;
    key += withoutSetNumber;
  }
  return key;
}

function lookup<T>(map: Map<string, T>, id: string): T | undefined {
  const direct = map.get(normalizeId(id));
  if (direct) return direct;

  const key = normalizeId(id);
  for (const suffix of VARIANT_SUFFIXES) {
    if (key.length > suffix.length && key.endsWith(suffix)) {
      const match = map.get(key.slice(0, -suffix.length));
      if (match) return match;
    }
  }
  return undefined;
}

function humanize(id: string): string {
  const tokens = id.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const last = tokens[tokens.length - 1] ?? id;
  return last.charAt(0).toUpperCase() + last.slice(1);
}

/** Trait ids are suffixed with the stack size, e.g. `DA_Juggernaut18_3`. */
function breakpointCount(id: string): number {
  const tokens = id.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const last = tokens[tokens.length - 1] ?? '';
  return /^\d+$/.test(last) ? Number(last) : 1;
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** MetaTFT's own tier cut-offs: deviation of the average placement from 4.5. */
function tierFromAverage(avg: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  const delta = avg - 4.5;
  if (delta <= -0.3) return 'S';
  if (delta <= -0.15) return 'A';
  if (delta <= 0) return 'B';
  if (delta <= 0.15) return 'C';
  return 'D';
}

interface Histogram {
  games: number;
  wins: number;
  top4: number;
  avg: number;
}

function readHistogram(places: number[]): Histogram {
  const buckets = places.slice(0, MAX_COMPETITORS);
  const games = buckets.reduce((sum, value) => sum + value, 0) || 1;
  const wins = buckets[0] ?? 0;
  const top4 = buckets.slice(0, 4).reduce((sum, value) => sum + value, 0);
  const avg = buckets.reduce((sum, value, index) => sum + value * (index + 1), 0) / games;
  return { games, wins, top4, avg };
}

function patchLabel(games?: GamesResponse): string {
  const current = games?.current_patch;
  if (!current) return 'latest';
  return `${current.patch}${current.b_patch_version ?? ''}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface MetaStatsPayload {
  champions: ChampionMetaStats[];
  comps: CompMetaStats[];
  overview: MetaOverview;
}

let metaCache: Promise<MetaStatsPayload> | null = null;

/** Fetch MetaTFT stats and join them with Community Dragon names/icons. */
export function fetchMetaStats(): Promise<MetaStatsPayload> {
  if (!metaCache) {
    metaCache = loadMetaStats().catch((error) => {
      metaCache = null;
      throw error;
    });
  }
  return metaCache;
}

async function loadMetaStats(): Promise<MetaStatsPayload> {
  const [unitStats, compsData, compsStats, games, staticData] = await Promise.all([
    fetchJson<{ results?: UnitRow[]; games?: Array<{ count: number }>; updated?: number }>(UNITS_URL),
    fetchJson<CompsDataResponse>(COMPS_DATA_URL),
    fetchJson<{ results?: CompStatRow[] }>(COMPS_STATS_URL),
    fetchJson<GamesResponse>(GAMES_URL),
    fetchStaticData(),
  ]);

  const patchId = patchLabel(games);
  const totalGames =
    unitStats.games?.reduce((sum, entry) => sum + entry.count, 0) || 1;

  const champions = buildChampionStats(unitStats.results ?? [], staticData.champions, {
    patchId,
    totalGames,
  });

  const { comps } = buildCompStats(
    compsStats.results ?? [],
    compsData,
    staticData.traits,
    staticData.champions,
    { patchId },
  );

  const overview: MetaOverview = {
    patchId,
    setNumber: staticData.set.number,
    setName: staticData.set.name,
    totalGames,
    trackedComps: comps.length,
    updatedAt: new Date(unitStats.updated ?? Date.now()).toISOString(),
  };

  return { champions, comps, overview };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { 'User-Agent': 'tft-dashboard', Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return (await response.json()) as T;
}

interface StatContext {
  patchId: string;
  totalGames: number;
}

function buildChampionStats(
  rows: UnitRow[],
  champions: TftChampion[],
  ctx: StatContext,
): ChampionMetaStats[] {
  const byKey = new Map<string, TftChampion>();
  for (const champion of champions) {
    const key = normalizeId(champion.id);
    if (!byKey.has(key)) byKey.set(key, champion);
  }

  const seen = new Set<string>();
  const stats: ChampionMetaStats[] = [];

  for (const row of rows) {
    const champion = lookup(byKey, row.unit);
    if (!champion) continue;

    const histogram = readHistogram(row.places);
    if (histogram.games < MIN_UNIT_GAMES) continue;
    if (seen.has(champion.id)) continue;
    seen.add(champion.id);

    stats.push({
      championId: champion.id,
      name: champion.name,
      cost: champion.cost,
      traits: champion.traits,
      iconUrl: champion.iconUrl,
      games: histogram.games,
      wins: histogram.wins,
      winRate: round((histogram.wins / histogram.games) * 100),
      top4Rate: round((histogram.top4 / histogram.games) * 100),
      pickRate: round((histogram.games / ctx.totalGames) * 100),
      avgPlacement: round(histogram.avg, 2),
      tier: tierFromAverage(histogram.avg),
      trend: 'stable',
      eloBracket: 'all',
      patchId: ctx.patchId,
    });
  }

  return stats.sort((a, b) => a.avgPlacement - b.avgPlacement);
}

function buildCompStats(
  rows: CompStatRow[],
  compsData: CompsDataResponse,
  traits: TftTrait[],
  champions: TftChampion[],
  ctx: { patchId: string },
): { comps: CompMetaStats[]; trackedGames: number } {
  const details = compsData.results?.data?.cluster_details ?? {};

  const championByKey = new Map<string, TftChampion>();
  for (const champion of champions) {
    const key = normalizeId(champion.id);
    if (!championByKey.has(key)) championByKey.set(key, champion);
  }
  const traitByKey = new Map<string, TftTrait>();
  const traitByName = new Map<string, TftTrait>();
  for (const trait of traits) {
    const key = normalizeId(trait.id);
    if (!traitByKey.has(key)) traitByKey.set(key, trait);
    if (!traitByName.has(trait.name)) traitByName.set(trait.name, trait);
  }

  const trackedGames =
    rows.find((row) => !row.cluster)?.places?.[0] ??
    rows.reduce((sum, row) => sum + (row.count ?? 0), 0) ??
    1;

  const comps: CompMetaStats[] = [];

  for (const row of rows) {
    if (!row.cluster) continue;
    const detail = details[row.cluster];
    if (!detail) continue;

    const histogram = readHistogram(row.places);
    const games = row.count ?? histogram.games;
    if (histogram.games < MIN_COMP_GAMES) continue;

    const units = (detail.units_string ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const unitNames = units.map((unit) => lookup(championByKey, unit)?.name ?? humanize(unit));

    // Prefer computing synergies from the comp's own units: MetaTFT's trait
    // counters are centroid-derived and frequently off by one.
    const traitCount = new Map<string, number>();
    for (const unit of units) {
      const champion = lookup(championByKey, unit);
      if (!champion) continue;
      for (const trait of champion.traits) {
        traitCount.set(trait, (traitCount.get(trait) ?? 0) + 1);
      }
    }

    const activeTraits = [...traitCount.entries()]
      .filter(([name, count]) => {
        const trait = traitByName.get(name);
        const minActive = trait?.tiers[0]?.count ?? 2;
        return count >= minActive;
      })
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    if (activeTraits.length === 0) {
      // Fall back to MetaTFT's own trait list when units could not be resolved.
      for (const id of (detail.traits_string ?? '').split(',').map((value) => value.trim()).filter(Boolean)) {
        const trait = lookup(traitByKey, id);
        if (!trait) continue;
        const minActive = trait.tiers[0]?.count ?? 2;
        if (breakpointCount(id) >= minActive && !activeTraits.includes(trait.name)) {
          activeTraits.push(trait.name);
        }
      }
    }

    const parts = detail.name ?? [];
    const carryId = parts.find((part) => part.type === 'unit')?.name;
    const traitId = parts.find((part) => part.type === 'trait')?.name;
    const carry = carryId ? lookup(championByKey, carryId)?.name : undefined;
    const primaryTrait = traitId ? lookup(traitByKey, traitId)?.name : undefined;

    const displayName = [primaryTrait, carry].filter(Boolean).join(' ') || unitNames[0] || 'Unknown Comp';

    comps.push({
      id: row.cluster,
      name: displayName,
      champions: unitNames,
      primaryTraits: activeTraits,
      games,
      winRate: round((histogram.wins / histogram.games) * 100),
      top4Rate: round((histogram.top4 / histogram.games) * 100),
      pickRate: round((histogram.games / (trackedGames || 1)) * 100),
      avgPlacement: round(histogram.avg, 2),
      tier: tierFromAverage(histogram.avg),
      style: detail.levelling ?? '',
      carry: carry ?? '',
      eloBracket: 'all',
      patchId: ctx.patchId,
    });
  }

  return {
    comps: comps.sort((a, b) => a.avgPlacement - b.avgPlacement),
    trackedGames,
  };
}
