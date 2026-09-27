/**
 * Defensive helpers for dynamic route params.
 *
 * `useParams()` / `params` in the App Router hand back the raw path segment,
 * and calling `decodeURIComponent` on it is *not* safe: any stray `%` that
 * isn't a valid escape (`/meta/comps/100%`, `/wiki/champions/%E0%A4%A`,
 * truncated copy-paste links) makes `decodeURIComponent` throw `URIError`.
 * Because that call sits directly in the render body, a single bad URL
 * white-screened the whole page instead of rendering a "not found" state.
 *
 * `safeDecodeParam` never throws: malformed input degrades to the raw value
 * (still `.trim()`-ed), which then simply fails the downstream lookup and
 * lands on the existing not-found / empty-state UI.
 */
export function safeDecodeParam(value: unknown): string {
  if (typeof value !== 'string') return '';
  const raw = value;
  if (!raw.includes('%')) return raw.trim();
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    // URIError: malformed percent-encoding — keep the raw segment so the page
    // renders its "not found" state instead of crashing.
    return raw.trim();
  }
}

/**
 * First item whose key matches, or `undefined`. Mirrors `Array.prototype.find`
 * but tolerates a non-array source (undefined during a loading/refetch gap) so
 * callers never have to null-guard before searching.
 */
export function safeFindBy<T>(
  items: readonly T[] | null | undefined,
  predicate: (item: T) => boolean,
): T | undefined {
  if (!Array.isArray(items)) return undefined;
  return items.find(predicate);
}
