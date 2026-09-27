import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedComp } from '@tft/types';

interface SavedCompsActions {
  saveComp: (name: string, snapshot: Omit<SavedComp, 'id' | 'name' | 'createdAt'>) => SavedComp;
  removeComp: (id: string) => void;
  renameComp: (id: string, name: string) => void;
}

const MAX_SAVED = 20;

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useSavedCompsStore = create<{ comps: SavedComp[] } & SavedCompsActions>()(
  persist(
    (set) => ({
      comps: [],

      saveComp: (name, snapshot) => {
        const comp: SavedComp = {
          id: newId(),
          name: name.trim().slice(0, 40) || 'Untitled comp',
          board: snapshot.board.slice(0, 28),
          bench: snapshot.bench.slice(0, 9),
          level: snapshot.level,
          gold: snapshot.gold,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ comps: [comp, ...state.comps].slice(0, MAX_SAVED) }));
        return comp;
      },

      removeComp: (id) => {
        set((state) => ({ comps: state.comps.filter((c) => c.id !== id) }));
      },

      renameComp: (id, name) => {
        const trimmed = name.trim().slice(0, 40);
        if (!trimmed) return;
        set((state) => ({
          comps: state.comps.map((c) => (c.id === id ? { ...c, name: trimmed } : c)),
        }));
      },
    }),
    {
      name: 'tft-saved-comps',
      version: 1,
      // v0 boards were 8 slots — pad saved v0 comps up to the 28-slot board.
      migrate: (persisted) => {
        const state = (persisted ?? {}) as { comps?: SavedComp[] };
        const pad = (slots: unknown, length: number): (string | null)[] => {
          const list = Array.isArray(slots) ? slots.slice(0, length) : [];
          while (list.length < length) list.push(null);
          return list;
        };
        return {
          ...state,
          comps: (state.comps ?? []).map((comp) => ({
            ...comp,
            board: pad(comp.board, 28),
            bench: pad(comp.bench, 9),
          })),
        };
      },
      partialize: (state) => ({ comps: state.comps }),
    },
  ),
);
