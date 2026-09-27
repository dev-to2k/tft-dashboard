export interface NavLink {
  href: string;
  label: string;
}

export const navLinks: NavLink[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/meta', label: 'Meta' },
  { href: '/wiki', label: 'Wiki' },
  { href: '/builder', label: 'Builder' },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}
