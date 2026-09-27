export interface TeamBuilderState {
  board: (string | null)[];
  bench: (string | null)[];
  level: number;
  gold: number;
  xp: number;
  selectedAugments: (string | null)[];
}

export interface SavedComp {
  id: string;
  name: string;
  board: (string | null)[];
  bench: (string | null)[];
  level: number;
  gold: number;
  createdAt: string;
}
