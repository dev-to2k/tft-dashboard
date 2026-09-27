'use client';

import { useDictionary } from '@/i18n/use-dictionary';

export function SkipLink() {
  const { dict } = useDictionary();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[var(--accent-gold)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[var(--gold-foreground)]"
    >
      {dict.skipToContent}
    </a>
  );
}
