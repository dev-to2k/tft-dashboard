import { NextResponse } from 'next/server';
import { fetchStaticData } from '@tft/api/server';

// Community Dragon dumps change with every patch.
export const revalidate = 3600;

/**
 * GET /api/tft/static
 * Trimmed Community Dragon data for the current set (champions, traits, items, augments).
 */
export async function GET() {
  try {
    const data = await fetchStaticData();
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
