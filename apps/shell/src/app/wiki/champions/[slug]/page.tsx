'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMetaStats, useStaticData } from '@tft/api';
import { useTeamBuilderStore } from '@tft/store';
import { Button, TierBadge, costTextClass, tierVar } from '@tft/ui';
import { ChampionAvatar } from '@/components/champion-avatar';
import { useTryComp } from '@/hooks/use-try-comp';
import { useDictionary } from '@/i18n/use-dictionary';
import { useMounted } from '@/hooks/use-mounted';

export default function ChampionDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = decodeURIComponent(params.slug ?? '');
  const { data: staticData, isLoading: isStaticLoading } = useStaticData();
  const { champions: metaChampions, comps, isLoading: isMetaLoading } = useMetaStats();
  const addChampion = useTeamBuilderStore((s) => s.addChampion);
  const tryCompInBuilder = useTryComp();
  const { dict, numberLocale } = useDictionary();
  const mounted = useMounted();
  const showLoading = !mounted || isStaticLoading;

  const champion = (staticData?.champions ?? []).find(
    (c) => c.slug === slug || c.id === slug,
  );
  const meta = metaChampions.find((c) => c.championId === champion?.id);
  const featuring = champion
    ? comps
        .filter((comp) => comp.champions.includes(champion.name))
        .sort((a, b) => b.pickRate - a.pickRate)
        .slice(0, 4)
    : [];
  const similar = champion
    ? (staticData?.champions ?? [])
        .filter((c) => c.id !== champion.id)
        .map((c) => ({
          champ: c,
          shared: c.traits.filter((t) => champion.traits.includes(t)).length,
        }))
        .filter((entry) => entry.shared > 0)
        .sort((a, b) => b.shared - a.shared || a.champ.cost - b.champ.cost)
        .slice(0, 6)
    : [];

  if (showLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--foreground)]/10" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
          ))}
        </div>
      </div>
    );
  }

  if (!champion) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
        <p className="font-bold text-[var(--foreground)]">{dict.meta.empty}</p>
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => router.push('/wiki/champions')}>
          {dict.wiki.detailBack}
        </Button>
      </div>
    );
  }

  const stats: { label: string; value: string }[] = [
    { label: dict.wiki.statHp, value: champion.stats.hp.toLocaleString(numberLocale) },
    { label: dict.wiki.statArmor, value: String(champion.stats.armor) },
    { label: dict.wiki.statMr, value: String(champion.stats.magicResist) },
    { label: dict.wiki.statAd, value: String(champion.stats.attackDamage) },
    { label: dict.wiki.statAs, value: String(champion.stats.attackSpeed) },
    { label: dict.wiki.statRange, value: String(champion.stats.range) },
  ];

  return (
    <div className="space-y-8">
      <Link
        href="/wiki/champions"
        className="inline-block rounded text-sm font-medium text-[var(--accent-gold)] hover:text-[var(--accent-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        &larr; {dict.wiki.detailBack}
      </Link>

      {/* Header with splash art */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {champion.splashUrl ? (
            <Image
              src={champion.splashUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-top opacity-50 [mask-image:linear-gradient(to_right,transparent_40%,black_85%)]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--card-bg)] via-[var(--card-bg)]/60 to-transparent" />
        </div>
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center lg:p-10">
          <ChampionAvatar
            name={champion.name}
            iconUrl={champion.iconUrl}
            cost={champion.cost}
            size="lg"
            className="h-20 w-20 rounded-2xl text-xl shadow-lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] lg:text-4xl">
                {champion.name}
              </h1>
              {meta ? <TierBadge tier={meta.tier} size="md" /> : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={`text-sm font-black ${costTextClass[champion.cost] ?? ''}`}>
                {champion.cost}-cost
              </span>
              {champion.traits.map((trait) => (
                <Link
                  key={trait}
                  href={`/wiki/traits?q=${encodeURIComponent(trait)}`}
                  className="rounded-full bg-[var(--background)] px-2.5 py-1 text-xs font-medium text-[var(--accent-blue)] transition-colors hover:ring-1 hover:ring-[var(--accent-gold)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {trait}
                </Link>
              ))}
            </div>
            {meta && !isMetaLoading ? (
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <span className="font-black text-[var(--accent-gold)]">
                  {meta.winRate.toFixed(1)}% WR
                </span>
                <span className="text-muted-foreground">
                  {meta.avgPlacement.toFixed(2)} avg
                </span>
                <span className="text-muted-foreground">
                  {meta.pickRate.toFixed(1)}% pick
                </span>
              </div>
            ) : null}
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              addChampion(champion.slug);
              router.push('/builder');
            }}
          >
            {dict.wiki.detailAddToBuilder}
          </Button>
        </div>
      </div>

      {/* Ability + base stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {dict.wiki.detailAbility}
          </h2>
          <p className="mt-2 text-lg font-bold text-[var(--foreground)]">
            {champion.ability.name || champion.name}
          </p>
          {champion.ability.mana.max > 0 ? (
            <p className="mt-1 text-xs font-semibold text-[var(--accent-blue)]">
              {dict.wiki.detailMana}: {champion.ability.mana.start}/{champion.ability.mana.max}
            </p>
          ) : null}
          {champion.ability.description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {champion.ability.description}
            </p>
          ) : null}
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {dict.wiki.detailBaseStats}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="text-base font-black text-[var(--foreground)]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Comps featuring this champion */}
      {featuring.length > 0 ? (
        <section aria-labelledby="featuring-heading">
          <h2 id="featuring-heading" className="mb-3 text-lg font-bold text-[var(--foreground)]">
            {dict.wiki.detailFeaturing(champion.name)}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {featuring.map((comp) => (
              <div
                key={comp.id}
                className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--accent-gold)]/30"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${tierVar[comp.tier]}, transparent)` }}
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold text-[var(--foreground)]">{comp.name}</p>
                  <TierBadge tier={comp.tier} size="sm" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-[var(--accent-gold)]">
                    {comp.winRate.toFixed(1)}% WR
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => tryCompInBuilder(comp)}>
                    {dict.meta.tryInBuilder}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Similar champions */}
      {similar.length > 0 ? (
        <section aria-labelledby="similar-heading">
          <h2 id="similar-heading" className="mb-3 text-lg font-bold text-[var(--foreground)]">
            {dict.wiki.detailSimilar}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {similar.map(({ champ }) => (
              <Link
                key={champ.id}
                href={`/wiki/champions/${champ.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3 text-center transition-all hover:-translate-y-0.5 hover:border-[var(--accent-gold)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <ChampionAvatar
                  name={champ.name}
                  iconUrl={champ.iconUrl}
                  cost={champ.cost}
                  size="md"
                  className="mx-auto rounded-full"
                />
                <p className="mt-2 truncate text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--accent-gold)]">
                  {champ.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
