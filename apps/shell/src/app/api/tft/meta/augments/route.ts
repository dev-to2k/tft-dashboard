import { NextResponse } from 'next/server';

// Global item/augment placement histograms (free, no Riot key).
// Augments share the item stat pool upstream; the client joins these
// rows with Community Dragon augments by normalized id.
const ITEMS_URL = 'https://api-hc.metatft.com/tft-stat-api/items';

export const revalidate = 300;

interface ItemStatRow {
  itemName: string;
  places: number[];
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
 * GET /api/tft/meta/augments
 * Placement histograms per item/augment id (`places` = Top1..Top8 counts).
 */
export async function GET() {
  try {
    const payload = await fetchJson<{ results?: ItemStatRow[] }>(ITEMS_URL);
    const rows = (payload.results ?? [])
      .filter((row) => row.itemName && Array.isArray(row.places))
      .map((row) => {
        const places = row.places.slice(0, 8);
        const games = places.reduce((sum, value) => sum + value, 0);
        return { name: row.itemName, places, games };
      })
      .filter((row) => row.games > 0);

    return NextResponse.json(
      { rows, updatedAt: new Date().toISOString() },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load augment stats' },
      { status: 502 },
    );
  }
}
