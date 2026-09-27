import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Self-contained MetaTFT join for a single comp cluster:
// comps_data (roster, traits, levelling, item builds, 3-star units, trends)
// + comps_stats (Top1-8 placement histogram). No Riot key needed.
const METATFT_BASE = 'https://api-hc.metatft.com';
const COMPS_DATA_URL = `${METATFT_BASE}/tft-comps-api/comps_data`;
const COMPS_STATS_URL = `${METATFT_BASE}/tft-comps-api/comps_stats`;

export const revalidate = 300;

interface CompNamePart {
  name: string;
  type: string;
  score?: number;
}

interface RawBuild {
  unit?: string;
  buildName?: string[];
  count?: number;
  avg?: number;
  score?: number;
  place_change?: number;
}

interface ClusterDetail {
  name?: CompNamePart[];
  units_string?: string;
  traits_string?: string;
  levelling?: string;
  stars?: string[];
  stars_4?: string[];
  builds?: RawBuild[];
  trends?: Array<{ day?: string; count?: number; avg?: number; pick?: number }>;
  overall?: { count?: number; avg?: number };
}

interface CompsDataResponse {
  results?: { data?: { cluster_details?: Record<string, ClusterDetail> } };
  updated?: number;
}

interface CompStatRow {
  cluster: string;
  places: number[];
  count?: number;
}

function splitList(raw?: string): string[] {
  return (typeof raw === 'string' ? raw : '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

/** Upstream JSON can be `null` / a non-array; never trust it blindly. */
function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * `decodeURIComponent` throws `URIError` on a malformed segment (`%`, `%E0%A4%A`,
 * truncated links). Decode defensively so a bad URL yields a clean 400 instead
 * of an unhandled 502 from the catch-all below.
 * `ok: false` marks a segment we could not decode — reject those outright.
 */
function safeDecode(value: unknown): { value: string; ok: boolean } {
  if (typeof value !== 'string') return { value: '', ok: false };
  if (!value.includes('%')) return { value: value.trim(), ok: true };
  try {
    return { value: decodeURIComponent(value).trim(), ok: true };
  } catch {
    return { value: value.trim(), ok: false };
  }
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'tft-dashboard', Accept: 'application/json' },
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return (await response.json()) as T;
}

/**
 * GET /api/tft/meta/comps/:id
 * Full detail for one comp cluster (board roster, histogram, BIS builds, trends).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const { value: id, ok: decoded } = safeDecode(rawId);
    if (!id) {
      return NextResponse.json({ error: 'Missing comp id' }, { status: 400 });
    }
    // A segment we could not decode is almost certainly garbage — reject it
    // before spending two upstream requests on it.
    if (!decoded) {
      return NextResponse.json({ error: 'Malformed comp id' }, { status: 400 });
    }

    const [compsData, compsStats] = await Promise.all([
      fetchJson<CompsDataResponse>(COMPS_DATA_URL),
      fetchJson<{ results?: CompStatRow[] }>(COMPS_STATS_URL),
    ]);

    const details = compsData.results?.data?.cluster_details ?? {};
    const detail = details[id];
    const statRow = asArray<CompStatRow>(compsStats.results).find((row) => row?.cluster === id);

    if (!detail && !statRow) {
      return NextResponse.json({ error: `Comp not found: ${id}` }, { status: 404 });
    }

    const places = asArray<unknown>(statRow?.places)
      .map((value) => asNumber(value))
      .slice(0, 8);
    const games =
      asNumber(statRow?.count, 0) ||
      places.reduce((sum, value) => sum + value, 0) ||
      asNumber(detail?.overall?.count, 0);

    return NextResponse.json(
      {
        cluster: id,
        units: splitList(detail?.units_string),
        traits: splitList(detail?.traits_string),
        levelling: detail?.levelling ?? '',
        nameParts: asArray(detail?.name),
        stars: asArray<string>(detail?.stars).filter((star) => typeof star === 'string'),
        stars4: asArray<string>(detail?.stars_4).filter((star) => typeof star === 'string'),
        builds: asArray<RawBuild>(detail?.builds).map((build) => ({
          unit: typeof build?.unit === 'string' ? build.unit : '',
          itemIds: asArray<unknown>(build?.buildName).filter(
            (item): item is string => typeof item === 'string' && item !== '',
          ),
          games: asNumber(build?.count, 0),
          avg: asNumber(build?.avg, 0),
          score: asNumber(build?.score, 0),
          placeChange: asNumber(build?.place_change, 0),
        })),
        trends: asArray<{ day?: string; count?: number; avg?: number; pick?: number }>(
          detail?.trends,
        ).map((trend) => ({
          day: typeof trend?.day === 'string' ? trend.day : '',
          count: asNumber(trend?.count, 0),
          avg: asNumber(trend?.avg, 0),
          pick: asNumber(trend?.pick, 0),
        })),
        overallAvg: asNumber(detail?.overall?.avg, 0),
        places,
        games,
        updatedAt: new Date(asNumber(compsData.updated, Date.now())).toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load comp detail' },
      { status: 502 },
    );
  }
}
