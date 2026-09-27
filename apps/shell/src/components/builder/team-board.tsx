'use client';

import { Suspense, memo, useCallback, useMemo, useState } from 'react';
import { useStaticData } from '@tft/api';
import { BENCH_SLOTS, BOARD_SLOTS, useTeamBuilderStore } from '@tft/store';
import { ChampionPool } from './champion-pool';
import { SavedComps } from './saved-comps';
import { UnitHex, boardGridPosition, type HexEntry } from './board-hex';
import { RollOddsTool } from './roll-odds-tool';
import { getDragPayload, hasUnitPayload, setDragPayload, type DragSource } from './dnd';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';

interface LookupEntry {
  name: string;
  cost: number;
  traits: string[];
  iconUrl: string;
}

// Legacy mock roster: only a fallback for boards persisted before the pool
// switched to live Community Dragon data (and when static data is loading).
const legacyChampions: Record<string, LookupEntry> = {
  vex: { name: 'Vex', cost: 1, traits: ['Enchanter', 'Arcane'], iconUrl: '' },
  lulu: { name: 'Lulu', cost: 1, traits: ['Enchanter', 'Celestial'], iconUrl: '' },
  poppy: { name: 'Poppy', cost: 1, traits: ['Bruiser', 'Sentinel'], iconUrl: '' },
  kogmaw: { name: "Kog'Maw", cost: 1, traits: ['Sniper', 'Shadow'], iconUrl: '' },
  twisted_fate: { name: 'Twisted Fate', cost: 1, traits: ['Sorcerer', 'Phantom'], iconUrl: '' },
  ashe: { name: 'Ashe', cost: 2, traits: ['Sniper', 'Celestial'], iconUrl: '' },
  zyra: { name: 'Zyra', cost: 2, traits: ['Sorcerer', 'Enchanter'], iconUrl: '' },
  shaco: { name: 'Shaco', cost: 2, traits: ['Assassin', 'Phantom'], iconUrl: '' },
  talon: { name: 'Talon', cost: 2, traits: ['Assassin', 'Ironclad'], iconUrl: '' },
  teemo: { name: 'Teemo', cost: 2, traits: ['Demolitionist', 'Celestial'], iconUrl: '' },
  garen: { name: 'Garen', cost: 3, traits: ['Bruiser', 'Ironclad'], iconUrl: '' },
  syndra: { name: 'Syndra', cost: 3, traits: ['Sorcerer', 'Sentinel'], iconUrl: '' },
  darius: { name: 'Darius', cost: 3, traits: ['Bruiser', 'Demolitionist'], iconUrl: '' },
  sett: { name: 'Sett', cost: 3, traits: ['Bruiser', 'Shadow'], iconUrl: '' },
  katarina: { name: 'Katarina', cost: 3, traits: ['Assassin', 'Demolitionist'], iconUrl: '' },
  lux: { name: 'Lux', cost: 4, traits: ['Sorcerer', 'Arcane'], iconUrl: '' },
  akali: { name: 'Akali', cost: 4, traits: ['Assassin', 'Phantom'], iconUrl: '' },
  jinx: { name: 'Jinx', cost: 4, traits: ['Sniper', 'Shadow'], iconUrl: '' },
  ornn: { name: 'Ornn', cost: 4, traits: ['Bruiser', 'Celestial'], iconUrl: '' },
  ryze: { name: 'Ryze', cost: 4, traits: ['Sorcerer', 'Arcane'], iconUrl: '' },
  mordekaiser: { name: 'Mordekaiser', cost: 5, traits: ['Ironclad', 'Shadow'], iconUrl: '' },
  smolder: { name: 'Smolder', cost: 5, traits: ['Sniper', 'Sentinel'], iconUrl: '' },
  camille: { name: 'Camille', cost: 5, traits: ['Assassin', 'Ironclad'], iconUrl: '' },
};

const EMPTY_BOARD: (string | null)[] = Array(BOARD_SLOTS).fill(null);
const EMPTY_BENCH: (string | null)[] = Array(BENCH_SLOTS).fill(null);

interface BoardSlotProps {
  index: number;
  entry: (HexEntry & { traits: string[] }) | null;
  slotLabel: string;
  dimmed: boolean;
  highlighted: boolean;
  removeLabel?: string;
  onRemoveCell: (index: number) => void;
  onDragStartCell: (index: number, event: React.DragEvent) => void;
  onDragEndCell: () => void;
  onDragOverCell: (index: number, event: React.DragEvent) => void;
  onDragEnterCell: (index: number, event: React.DragEvent) => void;
  onDragLeaveCell: () => void;
  onDropCell: (index: number, event: React.DragEvent) => void;
  onDoubleClickCell: (index: number) => void;
}

// Memoized so drop-target highlight only re-renders the old + new target
// cells instead of all 28 board cells on every dragover.
const BoardSlot = memo(function BoardSlot({
  index,
  entry,
  slotLabel,
  dimmed,
  highlighted,
  removeLabel,
  onRemoveCell,
  onDragStartCell,
  onDragEndCell,
  onDragOverCell,
  onDragEnterCell,
  onDragLeaveCell,
  onDropCell,
  onDoubleClickCell,
}: BoardSlotProps) {
  const { col, row } = boardGridPosition(index);
  return (
    <div
      className="col-span-2 min-h-0 min-w-0"
      style={{
        gridColumnStart: col,
        gridRowStart: row,
        marginTop: row > 1 ? '-28%' : undefined,
      }}
    >
      <UnitHex
        entry={entry}
        emptyLabel={slotLabel}
        size="board"
        draggable={Boolean(entry)}
        dimmed={dimmed}
        highlighted={highlighted}
        dropLabel={slotLabel}
        removeLabel={removeLabel}
        onRemove={entry ? () => onRemoveCell(index) : undefined}
        onDragStart={entry ? (event) => onDragStartCell(index, event) : undefined}
        onDragEnd={onDragEndCell}
        onDragOver={(event) => onDragOverCell(index, event)}
        onDragEnter={(event) => onDragEnterCell(index, event)}
        onDragLeave={onDragLeaveCell}
        onDrop={(event) => onDropCell(index, event)}
        onDoubleClick={entry ? () => onDoubleClickCell(index) : undefined}
      />
    </div>
  );
});

interface BenchSlotProps {
  index: number;
  entry: (HexEntry & { traits: string[] }) | null;
  dimmed: boolean;
  highlighted: boolean;
  benchLabel: string;
  removeLabel?: string;
  onRemoveCell: (index: number) => void;
  onDragStartCell: (index: number, event: React.DragEvent) => void;
  onDragEndCell: () => void;
  onDragOverCell: (index: number, event: React.DragEvent) => void;
  onDragEnterCell: (index: number, event: React.DragEvent) => void;
  onDragLeaveCell: () => void;
  onDropCell: (index: number, event: React.DragEvent) => void;
  onDoubleClickCell: (index: number) => void;
}

// Same memoization for the 9 bench cells.
const BenchSlot = memo(function BenchSlot({
  index,
  entry,
  dimmed,
  highlighted,
  benchLabel,
  removeLabel,
  onRemoveCell,
  onDragStartCell,
  onDragEndCell,
  onDragOverCell,
  onDragEnterCell,
  onDragLeaveCell,
  onDropCell,
  onDoubleClickCell,
}: BenchSlotProps) {
  return (
    <UnitHex
      entry={entry}
      emptyLabel={`${index + 1}`}
      size="bench"
      draggable={Boolean(entry)}
      dimmed={dimmed}
      highlighted={highlighted}
      dropLabel={benchLabel}
      removeLabel={removeLabel}
      onRemove={entry ? () => onRemoveCell(index) : undefined}
      onDragStart={entry ? (event) => onDragStartCell(index, event) : undefined}
      onDragEnd={onDragEndCell}
      onDragOver={(event) => onDragOverCell(index, event)}
      onDragEnter={(event) => onDragEnterCell(index, event)}
      onDragLeave={onDragLeaveCell}
      onDrop={(event) => onDropCell(index, event)}
      onDoubleClick={entry ? () => onDoubleClickCell(index) : undefined}
    />
  );
});

export function TeamBoard() {
  const storedBoard = useTeamBuilderStore((s) => s.board);
  const storedBench = useTeamBuilderStore((s) => s.bench);
  const storedLevel = useTeamBuilderStore((s) => s.level);
  const removeChampion = useTeamBuilderStore((s) => s.removeChampion);
  const removeBenched = useTeamBuilderStore((s) => s.removeBenched);
  const reset = useTeamBuilderStore((s) => s.reset);
  const placeOnBoard = useTeamBuilderStore((s) => s.placeOnBoard);
  const placeOnBench = useTeamBuilderStore((s) => s.placeOnBench);
  const moveUnit = useTeamBuilderStore((s) => s.moveUnit);
  const moveBoardToBench = useTeamBuilderStore((s) => s.moveBoardToBench);
  const moveBenchToBoard = useTeamBuilderStore((s) => s.moveBenchToBoard);
  const { data } = useStaticData();
  const { dict } = useDictionary();
  const t = dict.builder;

  // Persisted board state only applies after mount (SSR/first paint use blanks).
  const mounted = useMounted();
  const board = mounted ? storedBoard : EMPTY_BOARD;
  const bench = mounted ? storedBench : EMPTY_BENCH;
  const level = mounted ? storedLevel : 1;

  // Two-step inline confirm replaces window.confirm (localizable, non-blocking).
  const [confirmingReset, setConfirmingReset] = useState(false);
  // Drag & drop state.
  const [dragging, setDragging] = useState<DragSource | null>(null);
  const [dropTarget, setDropTarget] = useState<{ area: 'board' | 'bench'; index: number } | null>(null);

  const lookup = useMemo(() => {
    const map = new Map<string, LookupEntry>();
    for (const champ of data?.champions ?? []) {
      const entry: LookupEntry = {
        name: champ.name,
        cost: champ.cost,
        traits: champ.traits,
        iconUrl: champ.iconUrl,
      };
      map.set(champ.slug, entry);
      map.set(champ.id, entry);
    }
    for (const [id, entry] of Object.entries(legacyChampions)) {
      if (!map.has(id)) map.set(id, entry);
    }
    return map;
  }, [data]);

  const resolve = useCallback(
    (id: string | null): (HexEntry & { traits: string[] }) | null => {
      if (!id) return null;
      const found = lookup.get(id);
      return found
        ? { ...found, id, traits: found.traits }
        : { name: id, cost: 1, traits: [], iconUrl: '', id };
    },
    [lookup],
  );

  // Stable per-slot references so memoized cells only re-render when their
  // own slot content or highlight state changes (not on every dragover).
  const resolvedBoard = useMemo(() => board.map((id) => resolve(id)), [board, resolve]);
  const resolvedBench = useMemo(() => bench.map((id) => resolve(id)), [bench, resolve]);

  // Calculate active traits
  const activeTraits = new Map<string, number>();
  for (const id of board) {
    const champ = resolve(id);
    if (!champ) continue;
    for (const trait of champ.traits) {
      activeTraits.set(trait, (activeTraits.get(trait) ?? 0) + 1);
    }
  }

  const sortedTraits = [...activeTraits.entries()].sort((a, b) => b[1] - a[1]);
  const boardCount = board.filter(Boolean).length;

  const handleReset = () => {
    if (boardCount === 0 && bench.filter(Boolean).length === 0) {
      reset();
      return;
    }
    if (!confirmingReset) {
      setConfirmingReset(true);
      window.setTimeout(() => setConfirmingReset(false), 4000);
      return;
    }
    setConfirmingReset(false);
    reset();
  };

  const clearDragState = useCallback(() => {
    setDragging(null);
    setDropTarget(null);
  }, []);

  const handleDragOverBoard = useCallback((index: number, event: React.DragEvent) => {
    if (!hasUnitPayload(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget((current) =>
      current?.area === 'board' && current.index === index ? current : { area: 'board', index },
    );
  }, []);

  const handleDragOverBench = useCallback((index: number, event: React.DragEvent) => {
    if (!hasUnitPayload(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget((current) =>
      current?.area === 'bench' && current.index === index ? current : { area: 'bench', index },
    );
  }, []);

  const handleDragLeaveCell = useCallback(() => setDropTarget(null), []);

  const handleDragStartBoard = useCallback(
    (index: number, event: React.DragEvent) => {
      if (!board[index]) return;
      setDragPayload(event, { kind: 'board', index });
      setDragging({ kind: 'board', index });
    },
    [board],
  );

  const handleDragStartBench = useCallback(
    (index: number, event: React.DragEvent) => {
      if (!bench[index]) return;
      setDragPayload(event, { kind: 'bench', index });
      setDragging({ kind: 'bench', index });
    },
    [bench],
  );

  const handleDropOnBoard = useCallback(
    (index: number, event: React.DragEvent) => {
      event.preventDefault();
      const payload = getDragPayload(event);
      setDragging(null);
      setDropTarget(null);
      if (!payload) return;
      if (payload.kind === 'pool') {
        if (!board[index]) placeOnBoard(index, payload.championId);
      } else {
        moveUnit({ area: payload.kind, index: payload.index }, { area: 'board', index });
      }
    },
    [board, moveUnit, placeOnBoard],
  );

  const handleDropOnBench = useCallback(
    (index: number, event: React.DragEvent) => {
      event.preventDefault();
      const payload = getDragPayload(event);
      setDragging(null);
      setDropTarget(null);
      if (!payload) return;
      if (payload.kind === 'pool') {
        if (!bench[index]) placeOnBench(index, payload.championId);
      } else {
        moveUnit({ area: payload.kind, index: payload.index }, { area: 'bench', index });
      }
    },
    [bench, moveUnit, placeOnBench],
  );

  const handleRemoveBoard = useCallback((index: number) => removeChampion(index), [removeChampion]);
  const handleRemoveBench = useCallback((index: number) => removeBenched(index), [removeBenched]);
  const handleBoardToBench = useCallback((index: number) => moveBoardToBench(index), [moveBoardToBench]);
  const handleBenchToBoard = useCallback((index: number) => moveBenchToBoard(index), [moveBenchToBoard]);

  const isDragSource = (area: 'board' | 'bench', index: number) =>
    dragging !== null && dragging.kind === area && dragging.index === index;

  const isDropTarget = (area: 'board' | 'bench', index: number) =>
    dropTarget?.area === area && dropTarget.index === index;

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      {/* Main Board Area */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Board Hex Grid (in-game style, staggered rows) */}
        <div>
          <div className="mb-1 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t.board(boardCount, level > 9 ? 10 : level + 1)}
            </h3>
            <button
              type="button"
              onClick={handleReset}
              aria-live="polite"
              className="shrink-0 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
            >
              {confirmingReset ? t.confirmReset : t.reset}
            </button>
          </div>
          <p className="mb-3 hidden text-xs text-muted-foreground md:block">
            {t.dndHint}
          </p>
          <div className="board-scroll overflow-x-auto pb-2">
          <div className="grid min-w-[620px] grid-cols-15 gap-1 sm:gap-1.5">
            {resolvedBoard.map((champ, index) => (
              <BoardSlot
                key={`board-${index}`}
                index={index}
                entry={champ}
                slotLabel={t.slot(index + 1)}
                dimmed={isDragSource('board', index)}
                highlighted={isDropTarget('board', index)}
                removeLabel={champ ? t.removeFromBoard(champ.name) : undefined}
                onRemoveCell={handleRemoveBoard}
                onDragStartCell={handleDragStartBoard}
                onDragEndCell={clearDragState}
                onDragOverCell={handleDragOverBoard}
                onDragEnterCell={handleDragOverBoard}
                onDragLeaveCell={handleDragLeaveCell}
                onDropCell={handleDropOnBoard}
                onDoubleClickCell={handleBoardToBench}
              />
            ))}
          </div>
          </div>
        </div>

        {/* Bench Hex Row */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.bench}
          </h3>
          <div className="board-scroll overflow-x-auto pb-2">
            <div className="grid min-w-[560px] grid-cols-9 gap-1 sm:gap-1.5">
            {resolvedBench.map((champ, index) => (
              <BenchSlot
                key={`bench-${index}`}
                index={index}
                entry={champ}
                dimmed={isDragSource('bench', index)}
                highlighted={isDropTarget('bench', index)}
                benchLabel={`${t.bench} ${index + 1}`}
                removeLabel={champ ? t.removeFromBench(champ.name) : undefined}
                onRemoveCell={handleRemoveBench}
                onDragStartCell={handleDragStartBench}
                onDragEndCell={clearDragState}
                onDragOverCell={handleDragOverBench}
                onDragEnterCell={handleDragOverBench}
                onDragLeaveCell={handleDragLeaveCell}
                onDropCell={handleDropOnBench}
                onDoubleClickCell={handleBenchToBoard}
              />
            ))}
            </div>
          </div>
        </div>

        {/* Active Traits */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.activeTraits}
          </h3>
          {sortedTraits.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sortedTraits.map(([trait, count]) => (
                <div
                  key={trait}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2"
                >
                  <span className="text-sm font-semibold text-[var(--accent-blue-text)]">
                    {trait}
                  </span>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--accent-gold)] px-1 text-[10px] font-black text-[var(--gold-foreground)]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-6 text-center text-sm text-muted-foreground">
              {t.traitsEmpty}
            </p>
          )}
        </div>

        {/* Saved & Shared Comps */}
        <SavedComps />

        {/* Roll Simulator */}
        <RollOddsTool />
      </div>

      {/* Champion Pool Sidebar (wider) */}
      <div className="w-full shrink-0 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 xl:w-[24rem]">
        <Suspense>
          <ChampionPool />
        </Suspense>
      </div>
    </div>
  );
}

export default TeamBoard;
