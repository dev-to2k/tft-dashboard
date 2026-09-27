import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeamBuilderState } from '@tft/types';

interface TeamBuilderActions {
  addChampion: (championId: string, slot?: number) => void;
  removeChampion: (slot: number) => void;
  removeBenched: (slot: number) => void;
  setLevel: (level: number) => void;
  setGold: (gold: number) => void;
  reset: () => void;
  loadSnapshot: (snapshot: {
    board: (string | null)[];
    bench: (string | null)[];
    level: number;
    gold: number;
  }) => void;
  placeOnBoard: (slot: number, championId: string) => void;
  placeOnBench: (slot: number, championId: string) => void;
  moveUnit: (
    from: { area: 'board' | 'bench'; index: number },
    to: { area: 'board' | 'bench'; index: number },
  ) => void;
  moveBoardToBench: (boardIndex: number) => void;
  moveBenchToBoard: (benchIndex: number) => void;
}

export const BOARD_SLOTS = 28;
export const BENCH_SLOTS = 9;

function padSlots(slots: (string | null)[], length: number): (string | null)[] {
  const list = slots.slice(0, length);
  while (list.length < length) list.push(null);
  return list;
}

const INITIAL_STATE: TeamBuilderState = {
  board: Array(BOARD_SLOTS).fill(null),
  bench: Array(BENCH_SLOTS).fill(null),
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

        if (slot !== undefined && slot >= 0 && slot < newBoard.length) {
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
        if (slot >= 0 && slot < newBoard.length) {
          newBoard[slot] = null;
          set({ board: newBoard });
        }
      },

      removeBenched: (slot: number) => {
        const state = get();
        const newBench = [...state.bench];
        if (slot >= 0 && slot < newBench.length) {
          newBench[slot] = null;
          set({ bench: newBench });
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

      loadSnapshot: (snapshot) => {
        set({
          board: padSlots(snapshot.board, BOARD_SLOTS),
          bench: padSlots(snapshot.bench, BENCH_SLOTS),
          level: Math.max(1, Math.min(10, snapshot.level)),
          gold: Math.max(0, snapshot.gold),
        });
      },

      placeOnBoard: (slot, championId) => {
        if (slot < 0 || slot >= BOARD_SLOTS) return;
        const state = get();
        const newBoard = [...state.board];
        newBoard[slot] = championId;
        set({ board: newBoard });
      },

      placeOnBench: (slot, championId) => {
        const state = get();
        if (slot < 0 || slot >= state.bench.length) return;
        const newBench = [...state.bench];
        newBench[slot] = championId;
        set({ bench: newBench });
      },

      moveUnit: (from, to) => {
        if (from.area === to.area && from.index === to.index) return;
        const state = get();
        const source = from.area === 'board' ? [...state.board] : [...state.bench];
        const target = to.area === 'board' ? [...state.board] : [...state.bench];
        if (from.index < 0 || from.index >= source.length) return;
        if (to.index < 0 || to.index >= target.length) return;
        const moving = source[from.index];
        if (!moving) return;
        const displaced = from.area === to.area ? target[to.index] : target[to.index];
        if (from.area === to.area) {
          target[from.index] = displaced ?? null;
          target[to.index] = moving;
        } else {
          source[from.index] = displaced ?? null;
          target[to.index] = moving;
        }
        set(
          from.area === 'board'
            ? to.area === 'board'
              ? { board: target }
              : { board: source, bench: target }
            : to.area === 'board'
              ? { bench: source, board: target }
              : { bench: target },
        );
      },

      moveBoardToBench: (boardIndex) => {
        const state = get();
        const id = state.board[boardIndex];
        if (!id) return;
        const emptyBench = state.bench.findIndex((s) => s === null);
        if (emptyBench === -1) return;
        const newBoard = [...state.board];
        const newBench = [...state.bench];
        newBoard[boardIndex] = null;
        newBench[emptyBench] = id;
        set({ board: newBoard, bench: newBench });
      },

      moveBenchToBoard: (benchIndex) => {
        const state = get();
        const id = state.bench[benchIndex];
        if (!id) return;
        const emptyBoard = state.board.findIndex((s) => s === null);
        if (emptyBoard === -1) return;
        const newBoard = [...state.board];
        const newBench = [...state.bench];
        newBench[benchIndex] = null;
        newBoard[emptyBoard] = id;
        set({ board: newBoard, bench: newBench });
      },
    }),
    {
      name: 'tft-team-builder',
      version: 1,
      // v0 boards were 8 slots — pad saved v0 states up to the 28-slot board.
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<TeamBuilderState>;
        return {
          ...state,
          board: padSlots(Array.isArray(state.board) ? state.board : [], BOARD_SLOTS),
          bench: padSlots(Array.isArray(state.bench) ? state.bench : [], BENCH_SLOTS),
        };
      },
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
