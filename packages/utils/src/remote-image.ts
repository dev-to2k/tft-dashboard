/**
 * Remote image allowlist guard.
 *
 * `images.remotePatterns` in `apps/shell/next.config.ts` is a hard gate:
 * `next/image` throws (`Invalid src prop ... hostname not configured`) for any
 * host that is not listed, which crashes the render and surfaces as a 500.
 * Upstream asset paths come from Community Dragon payloads we do not control,
 * so every remote `src` is checked here before it reaches `<Image>`.
 *
 * Keep this list in sync with `next.config.ts` `images.remotePatterns`.
 */

interface RemotePattern {
  hostname: string;
  pathname: string;
}

const ALLOWED_REMOTE_PATTERNS: readonly RemotePattern[] = [
  { hostname: 'ddragon.leagueoflegends.com', pathname: '/cdn/' },
  { hostname: 'raw.communitydragon.org', pathname: '/latest/game/' },
  { hostname: 'raw.communitydragon.org', pathname: '/latest/cdragon/' },
  { hostname: 'raw.communitydragon.org', pathname: '/latest/plugins/' },
];

function matchesPathname(pathname: string, prefix: string): boolean {
  return pathname === prefix.slice(0, -1) || pathname.startsWith(prefix);
}

/** True when `next/image` is allowed to optimize this URL. */
export function isAllowedRemoteImage(src: unknown): src is string {
  if (typeof src !== 'string' || src === '' || src.startsWith('/')) return false;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  return ALLOWED_REMOTE_PATTERNS.some(
    (pattern) => url.hostname === pattern.hostname && matchesPathname(url.pathname, pattern.pathname),
  );
}

/**
 * Return the URL when it is on the allowlist, otherwise an empty string.
 * Callers already render their own placeholder for an empty `src`.
 */
export function safeImageSrc(src: unknown): string {
  return isAllowedRemoteImage(src) ? src : '';
}
