export interface CompSharePayload {
  board: (string | null)[];
  bench: (string | null)[];
  level: number;
  gold: number;
}

function isSlot(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function toBase64Url(input: string): string {
  const base64 = btoa(
    encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    ),
  );
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const percentEncoded = [...binary]
    .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
    .join('');
  return decodeURIComponent(percentEncoded);
}

/** Encode a team comp into a compact URL-safe string for `?share=`. */
export function encodeCompShare(payload: CompSharePayload): string {
  const compact = {
    b: payload.board.slice(0, 28),
    n: payload.bench.slice(0, 9),
    l: payload.level,
    g: payload.gold,
  };
  return toBase64Url(JSON.stringify(compact));
}

/** Decode a `?share=` value. Returns null when the payload is invalid. */
export function decodeCompShare(encoded: string): CompSharePayload | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { b, n, l, g } = parsed as Record<string, unknown>;
    if (!Array.isArray(b) || !Array.isArray(n)) return null;
    if (!b.every(isSlot) || !n.every(isSlot)) return null;
    if (typeof l !== 'number' || typeof g !== 'number') return null;
    if (!Number.isFinite(l) || !Number.isFinite(g)) return null;
    // Pad v0 8-slot links up to the 28-slot board.
    const pad = (slots: (string | null)[], length: number): (string | null)[] => {
      const list = slots.slice(0, length);
      while (list.length < length) list.push(null);
      return list;
    };
    return {
      board: pad(b as (string | null)[], 28),
      bench: pad(n as (string | null)[], 9),
      level: Math.max(1, Math.min(10, Math.round(l))),
      gold: Math.max(0, Math.round(g)),
    };
  } catch {
    return null;
  }
}
