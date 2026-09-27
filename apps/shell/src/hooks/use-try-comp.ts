'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStaticData } from '@tft/api';
import { arrangeCompFormation, toFormationUnits } from '@tft/game-data';
import { encodeCompShare } from '@tft/utils';
import type { CompMetaStats } from '@tft/types';

/** Open a meta comp directly on the builder board via a share link. */
export function useTryComp() {
  const router = useRouter();
  const { data: staticData } = useStaticData();

  return useCallback(
    (comp: CompMetaStats) => {
      const units = toFormationUnits(comp, (name) => {
        const champ = staticData?.champions.find((c) => c.name === name);
        if (!champ) return null;
        return { id: champ.slug, traits: champ.traits, range: champ.stats.range };
      });
      const board = arrangeCompFormation(units);
      const encoded = encodeCompShare({ board, bench: [], level: 9, gold: 0 });
      router.push(`/builder?share=${encoded}`);
    },
    [router, staticData],
  );
}
