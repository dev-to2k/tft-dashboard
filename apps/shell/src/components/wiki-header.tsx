'use client';

import { useStaticData } from '@tft/api';
import { ChampionAvatar } from '@/components/champion-avatar';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';

export function WikiHeader() {
  const { data, isLoading } = useStaticData();
  const { dict } = useDictionary();
  const mounted = useMounted();
  const showLoading = !mounted || isLoading || !data;
  const collage = !showLoading && data ? data.champions.slice(0, 10) : [];

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-r from-[var(--card-bg)] to-[var(--background)] p-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--accent-blue)_0%,_transparent_55%)] opacity-[0.07]"
      />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">
            {dict.wiki.hubTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {showLoading ? (
              <span className="block h-4 w-64 animate-pulse rounded bg-[var(--foreground)]/10" />
            ) : (
              data && dict.wiki.hubSubtitle(data.set.name)
            )}
          </p>
        </div>
        {showLoading ? (
          <div className="flex" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-12 animate-pulse rounded-full bg-[var(--foreground)]/10 ring-2 ring-[var(--card-bg)] [&:not(:first-child)]:-ml-3"
              />
            ))}
          </div>
        ) : (
          <div className="flex" aria-hidden="true">
            {collage.map((champ) => (
              <ChampionAvatar
                key={champ.id}
                name={champ.name}
                iconUrl={champ.iconUrl}
                cost={champ.cost}
                size="md"
                className="-ml-3 rounded-full shadow-md ring-2 ring-[var(--card-bg)] transition-transform first:ml-0 hover:-translate-y-1"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
