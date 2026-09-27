import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchMetaStats, normalizeGameLocale } from '@tft/api/server';

// Stats are aggregated upstream a few times a day; refresh every 5 minutes.
export const revalidate = 300;

/**
 * GET /api/tft/meta?locale=vi
 * Champion and comp statistics (win rate, top 4, avg placement, pick rate).
 * `locale=vi` localizes champion/comp/trait display names.
 */
export async function GET(request: NextRequest) {
  try {
    const locale = normalizeGameLocale(new URL(request.url).searchParams.get('locale'));
    const data = await fetchMetaStats(locale);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load meta stats' },
      { status: 502 },
    );
  }
}
