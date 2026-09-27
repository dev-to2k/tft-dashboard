'use client';

export type DragSource =
  | { kind: 'pool'; championId: string }
  | { kind: 'board' | 'bench'; index: number };

export const UNIT_MIME = 'application/x-tft-unit';

export function setDragPayload(event: React.DragEvent, source: DragSource): void {
  event.dataTransfer.setData(UNIT_MIME, JSON.stringify(source));
  event.dataTransfer.effectAllowed = 'move';
}

export function getDragPayload(event: React.DragEvent): DragSource | null {
  try {
    const raw = event.dataTransfer.getData(UNIT_MIME);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { kind } = parsed as Record<string, unknown>;
    if (kind === 'pool' && typeof (parsed as { championId?: unknown }).championId === 'string') {
      return parsed as DragSource;
    }
    if (
      (kind === 'board' || kind === 'bench') &&
      typeof (parsed as { index?: unknown }).index === 'number'
    ) {
      return parsed as DragSource;
    }
    return null;
  } catch {
    return null;
  }
}

export function hasUnitPayload(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes(UNIT_MIME);
}
