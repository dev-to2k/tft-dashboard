'use client';

import { useDictionary } from '@/i18n/use-dictionary';

export function BuilderHeader() {
  const { dict } = useDictionary();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-black text-[var(--foreground)]">
          {dict.builder.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.builder.subtitle}
        </p>
      </div>
    </div>
  );
}
