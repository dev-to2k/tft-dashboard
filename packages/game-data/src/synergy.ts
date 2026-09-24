import type { TftChampion } from '@tft/types';

/**
 * Calculate active synergies from a list of champion IDs.
 * Returns a Map of trait name to active unit count.
 *
 * This is a pure function that requires a champion lookup.
 * In production, pass in the champion data or use a pre-built index.
 */
export function calculateSynergies(
  championIds: string[],
  championLookup?: Map<string, TftChampion>,
): Map<string, number> {
  const synergyMap = new Map<string, number>();

  if (!championLookup) {
    // Without a lookup table, we can only return empty results.
    // Callers should provide the champion data for full functionality.
    console.warn(
      'calculateSynergies called without championLookup. Provide a Map<string, TftChampion> for trait calculation.',
    );
    return synergyMap;
  }

  for (const id of championIds) {
    const champion = championLookup.get(id);
    if (!champion) continue;

    for (const trait of champion.traits) {
      synergyMap.set(trait, (synergyMap.get(trait) ?? 0) + 1);
    }
  }

  return synergyMap;
}
