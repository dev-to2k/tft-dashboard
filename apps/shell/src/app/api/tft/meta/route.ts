import { NextResponse } from 'next/server';
import { fetchMetaStats } from '@tft/api/server';

// Stats are aggregated upstream a few times a day; refresh every 5 minutes.
export const revalidate = 300;

/**
 * GET /api/tft/meta
 * Champion and comp statistics (win rate, top 4, avg placement, pick rate).
 */
export async function GET() {
  try {
    const data = await fetchMetaStats();
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
