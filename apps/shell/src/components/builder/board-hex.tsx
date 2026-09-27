'use client';

import Image from 'next/image';
import { costBgClass } from '@tft/ui';

export interface HexEntry {
  id: string;
  name: string;
  cost: number;
  iconUrl: string;
}

/**
 * In-game board positions: 4 rows x 7 hexes on a 15-col staggered grid.
 * Even rows use cols 1-14, odd rows cols 2-15 (half-hex offset).
 */
export function boardGridPosition(index: number): { col: number; row: number } {
  const row = Math.floor(index / 7);
  const pos = index % 7;
  return { col: pos * 2 + 1 + (row % 2), row: row + 1 };
}

interface UnitHexProps {
  entry: HexEntry | null;
  emptyLabel: string;
  size: 'board' | 'bench';
  draggable?: boolean;
  dimmed?: boolean;
  highlighted?: boolean;
  removeLabel?: string;
  onRemove?: () => void;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragEnter?: (event: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
  onDoubleClick?: () => void;
  dropLabel?: string;
}

function Initials({ name }: { name: string }) {
  const parts = name.split(/[\s']+/).filter(Boolean);
  const text =
    parts.length >= 2 && parts[0] && parts[1]
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  return <span className="text-lg font-black text-white">{text}</span>;
}

/**
 * TFT in-game style hex cell. The outer hex carries the cost color
 * (borders get clipped by clip-path, so the color shows as a rim through
 * the inner hex's inset), the inner hex holds the portrait.
 */
export function UnitHex({
  entry,
  emptyLabel,
  size,
  draggable = false,
  dimmed = false,
  highlighted = false,
  removeLabel,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onDoubleClick,
  dropLabel,
}: UnitHexProps) {
  const isBoard = size === 'board';
  const outerTone = !entry
    ? highlighted
      ? 'bg-[var(--accent-gold)]'
      : 'bg-[var(--border)]/70'
    : highlighted
      ? 'bg-[var(--accent-gold)]'
      : (costBgClass[entry.cost] ?? 'bg-[var(--border)]');

  return (
    <div
      className={`group relative isolate ${highlighted ? 'hex-drop-glow' : ''}`}
      data-drop-target={highlighted ? 'true' : undefined}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        role={onDrop ? 'button' : undefined}
        aria-label={dropLabel}
        tabIndex={-1}
        className={`hex-clip aspect-[6/7] w-full p-[3px] transition-transform duration-150 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none ${highlighted ? 'scale-[1.01]' : ''} ${dimmed ? 'opacity-40' : ''} ${outerTone}`}
      >
        <div
          draggable={draggable}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDoubleClick={onDoubleClick}
          title={entry ? entry.name : emptyLabel}
          className={`hex-clip relative flex h-full w-full items-center justify-center overflow-hidden bg-[var(--background)] ${
            draggable ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        >
          {entry ? (
            <>
              {entry.iconUrl ? (
                <Image
                  src={entry.iconUrl}
                  alt={entry.name}
                  fill
                  sizes={isBoard ? '160px' : '80px'}
                  loading="lazy"
                  draggable={false}
                  className="pointer-events-none object-cover"
                />
              ) : (
                <Initials name={entry.name} />
              )}
            </>
          ) : (
            <span className="px-1 text-center text-[10px] font-medium text-muted-foreground sm:text-xs">
              {emptyLabel}
            </span>
          )}
        </div>
      </div>
      {entry && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? `Remove ${entry.name}`}
          className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-xs font-bold text-white opacity-0 shadow-md transition-opacity hover:bg-danger/80 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <span aria-hidden="true">{'\u00D7'}</span>
        </button>
      ) : null}
    </div>
  );
}
