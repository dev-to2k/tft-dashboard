import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeamBuilderState } from '@tft/types';

interface TeamBuilderActions {
  addChampion: (championId: string, slot?: number) => void;
  removeChampion: (slot: number) => void;
  setLevel: (level: number) => void;
  setGold: (gold: number) => void;
  reset: () => void;
}

const INITIAL_STATE: TeamBuilderState = {
  board: Array(8).fill(null),
  bench: Array(9).fill(null),
  level: 1,
  gold: 0,
  xp: 0,
  selectedAugments: [null, null, null],
};

export const useTeamBuilderStore = create<TeamBuilderState & TeamBuilderActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addChampion: (championId: string, slot?: number) => {
        const state = get();
        const newBoard = [...state.board];

        if (slot !== undefined && slot >= 0 && slot < 8) {
          // Place at specific slot
          newBoard[slot] = championId;
        } else {
          // Find first empty slot
          const emptyIndex = newBoard.findIndex((s) => s === null);
          if (emptyIndex !== -1) {
            newBoard[emptyIndex] = championId;
          } else {
            // Try bench
            const newBench = [...state.bench];
            const emptyBenchIndex = newBench.findIndex((s) => s === null);
            if (emptyBenchIndex !== -1) {
              newBench[emptyBenchIndex] = championId;
              set({ bench: newBench });
              return;
            }
            return; // No space available
          }
        }

        set({ board: newBoard });
      },

      removeChampion: (slot: number) => {
        const state = get();
        const newBoard = [...state.board];
        if (slot >= 0 && slot < 8) {
          newBoard[slot] = null;
          set({ board: newBoard });
        }
      },

      setLevel: (level: number) => {
        const clamped = Math.max(1, Math.min(10, level));
        set({ level: clamped });
      },

      setGold: (gold: number) => {
        set({ gold: Math.max(0, gold) });
      },

      reset: () => {
        set(INITIAL_STATE);
      },
    }),
    {
      name: 'tft-team-builder',
      partialize: (state) => ({
        board: state.board,
        bench: state.bench,
        level: state.level,
        gold: state.gold,
        xp: state.xp,
        selectedAugments: state.selectedAugments,
      }),
    },
  ),
);

// Derived selectors
export const selectTotalCost = (state: TeamBuilderState): number => {
  // This would need champion data to calculate actual cost.
  // Returns count of non-null slots as a placeholder.
  return state.board.filter((slot) => slot !== null).length;
};

export const selectActiveTraits = (
  state: TeamBuilderState,
  championLookup?: Map<string, { traits: string[] }>,
): Map<string, number> => {
  const traitCounts = new Map<string, number>();
  if (!championLookup) return traitCounts;

  for (const id of state.board) {
    if (!id) continue;
    const champion = championLookup.get(id);
    if (!champion) continue;
    for (const trait of champion.traits) {
      traitCounts.set(trait, (traitCounts.get(trait) ?? 0) + 1);
    }
  }

  return traitCounts;
};

export const selectUnitCounts = (state: TeamBuilderState): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const id of [...state.board, ...state.bench]) {
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
};
