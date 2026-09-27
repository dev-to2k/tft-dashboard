/**
 * Null / NaN guards for values coming from third-party JSON.
 *
 * MetaTFT + Community Dragon occasionally omit fields or return `null` for
 * numbers. `null.toFixed(1)` and `NaN.toLocaleString()` throw inside a React
 * render, which Next.js turns into a 500 for the whole route. Every helper
 * here degrades to a safe value instead so the UI can keep its fallback state.
 */

/** Coerce an unknown value into a finite number, falling back when impossible. */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

/**
 * `Number.prototype.toFixed` that never throws on `null` / `undefined` / `NaN`
 * and clamps the precision to the 0-100 range the spec allows.
 */
export function fixed(value: unknown, decimals = 1, fallback = 0): string {
  const safeDecimals = Math.min(100, Math.max(0, Math.trunc(safeNumber(decimals, 0))));
  return safeNumber(value, fallback).toFixed(safeDecimals);
}

/** `Number.prototype.toLocaleString` guard for counts coming from the API. */
export function intText(value: unknown, locale?: string): string {
  const rounded = Math.round(safeNumber(value));
  try {
    return rounded.toLocaleString(locale);
  } catch {
    return String(rounded);
  }
}

/** Clamp any value into the 0-100 range (bar widths / percentages). */
export function percent(value: unknown, fallback = 0): number {
  const safe = safeNumber(value, fallback);
  if (safe <= 0) return 0;
  return safe >= 100 ? 100 : safe;
}

/**
 * `Array.isArray` narrowing that also copes with `null` / non-array values
 * coming from third-party JSON. Returns a shallow copy so callers cannot
 * mutate the upstream payload.
 */
export function toArray<T>(value: T[] | readonly T[] | null | undefined): T[] {
  return Array.isArray(value) ? [...(value as T[])] : [];
}

/** Non-empty string guard (upstream ids / names). */
export function toText(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed === '' ? fallback : trimmed;
}
