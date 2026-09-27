'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStaticData } from '@tft/api';
import { ChampionAvatar } from '@/components/champion-avatar';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';

interface SearchHit {
  kind: 'champions' | 'traits' | 'items' | 'augments';
  href: string;
  name: string;
  iconUrl: string;
  sub?: string;
}

const MAX_PER_KIND = 4;

export function WikiSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const { data } = useStaticData();
  const { dict } = useDictionary();
  const mounted = useMounted();
  const boxRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();

  const hits: SearchHit[] = useMemo(() => {
    if (!mounted || !data || q.length < 2) return [];
    const match = (name: string, extra = '') =>
      name.toLowerCase().includes(q) || extra.toLowerCase().includes(q);
    const champions = data.champions
      .filter((c) => match(c.name, c.traits.join(' ')))
      .slice(0, MAX_PER_KIND)
      .map((c): SearchHit => ({
        kind: 'champions',
        href: `/wiki/champions?q=${encodeURIComponent(c.name)}`,
        name: c.name,
        iconUrl: c.iconUrl,
        sub: c.traits.slice(0, 2).join(' · '),
      }));
    const traits = data.traits
      .filter((t) => match(t.name, t.description))
      .slice(0, MAX_PER_KIND)
      .map((t): SearchHit => ({
        kind: 'traits',
        href: `/wiki/traits?q=${encodeURIComponent(t.name)}`,
        name: t.name,
        iconUrl: t.iconUrl,
      }));
    const items = data.items
      .filter((i) => match(i.name, i.description))
      .slice(0, MAX_PER_KIND)
      .map((i): SearchHit => ({
        kind: 'items',
        href: `/wiki/items?q=${encodeURIComponent(i.name)}`,
        name: i.name,
        iconUrl: i.iconUrl,
      }));
    const augments = data.augments
      .filter((a) => match(a.name, a.description))
      .slice(0, MAX_PER_KIND)
      .map((a): SearchHit => ({
        kind: 'augments',
        href: `/wiki/augments?q=${encodeURIComponent(a.name)}`,
        name: a.name,
        iconUrl: a.iconUrl,
      }));
    // The dump contains duplicate augments — collapse identical hits.
    const seen = new Set<string>();
    return [...champions, ...traits, ...items, ...augments].filter((hit) => {
      const key = `${hit.kind}:${hit.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [mounted, data, q]);

  const kindTitle = (kind: SearchHit['kind']) =>
    kind === 'champions'
      ? dict.wiki.championsTitle
      : kind === 'traits'
        ? dict.wiki.traitsTitle
        : kind === 'items'
          ? dict.wiki.itemsTitle
          : dict.wiki.augmentsTitle;

  const submitSearch = () => {
    const trimmed = query.trim();
    router.push(trimmed ? `/wiki/champions?q=${encodeURIComponent(trimmed)}` : '/wiki/champions');
  };

  const showDropdown = open && q.length >= 2;

  return (
    <div ref={boxRef} className="relative" role="search">
      <input
        type="text"
        placeholder={dict.wiki.searchPlaceholder}
        aria-label={dict.wiki.searchLabel}
        aria-expanded={showDropdown}
        aria-controls="wiki-search-results"
        role="combobox"
        aria-autocomplete="list"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (showDropdown && hits[highlight]) {
              router.push(hits[highlight].href);
            } else {
              submitSearch();
            }
          } else if (e.key === 'Escape') {
            setOpen(false);
          } else if (e.key === 'ArrowDown' && hits.length > 0) {
            e.preventDefault();
            setHighlight((h) => (h + 1) % hits.length);
          } else if (e.key === 'ArrowUp' && hits.length > 0) {
            e.preventDefault();
            setHighlight((h) => (h - 1 + hits.length) % hits.length);
          }
        }}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 pl-11 text-sm text-[var(--foreground)] placeholder:text-muted-foreground outline-none focus:border-[var(--accent-gold)] focus:shadow-[0_0_20px_-6px_var(--accent-gold)] transition-all"
      />
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      {showDropdown ? (
        <div
          id="wiki-search-results"
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-2 shadow-2xl"
        >
          {hits.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              {dict.wiki.searchNoResults}
            </p>
          ) : (
            hits.map((hit, index) => (
              <Link
                key={`${hit.kind}-${hit.name}`}
                href={hit.href}
                role="option"
                aria-selected={index === highlight}
                onMouseEnter={() => setHighlight(index)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  index === highlight ? 'bg-[var(--accent-gold)]/10' : ''
                }`}
              >
                <ChampionAvatar name={hit.name} iconUrl={hit.iconUrl} size="sm" className="rounded-md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                    {hit.name}
                  </span>
                  {hit.sub ? (
                    <span className="block truncate text-[11px] text-muted-foreground">{hit.sub}</span>
                  ) : null}
                </span>
                <span className="shrink-0 rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {kindTitle(hit.kind)}
                </span>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
