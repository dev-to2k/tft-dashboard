export type NavLinkKey = 'dashboard' | 'meta' | 'wiki' | 'builder';

export interface NavLink {
  href: string;
  key: NavLinkKey;
}

export const navLinks: NavLink[] = [
  { href: '/', key: 'dashboard' },
  { href: '/meta', key: 'meta' },
  { href: '/wiki', key: 'wiki' },
  { href: '/builder', key: 'builder' },
];

export function isActivePath(pathname: string | null | undefined, href: string): boolean {
  // usePathname() can return null (e.g. during fallback render / no pages dir context).
  // Guard so callers never hit `null.startsWith` and crash the navigation render.
  const path = pathname ?? '';
  if (href === '/') return path === '/';
  if (!path) return false;
  return path.startsWith(href);
}
