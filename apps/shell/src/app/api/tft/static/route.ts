import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchStaticData } from '@tft/api/server';
import { normalizeGameLocale } from '@tft/api';

// Community Dragon dumps change with every patch.
export const revalidate = 3600;

/**
 * GET /api/tft/static?locale=vi
 * Trimmed Community Dragon data for the current set (champions, traits, items, augments).
 * `locale=vi` overlays official Vietnamese display names (ids stay stable).
 */
export async function GET(request: NextRequest) {
  try {
    const locale = normalizeGameLocale(new URL(request.url).searchParams.get('locale'));
    const data = await fetchStaticData(locale);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load static data' },
      { status: 502 },
    );
  }
}
