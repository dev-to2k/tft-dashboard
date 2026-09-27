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

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}
