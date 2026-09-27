'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@tft/ui';
import { useDictionary } from '@/i18n/use-dictionary';

export function BuilderCta() {
  const router = useRouter();
  const { dict } = useDictionary();

  return (
    <section
      aria-labelledby="builder-cta-heading"
      className="cv-auto relative overflow-hidden rounded-2xl border border-[var(--accent-gold)]/30 bg-gradient-to-br from-[var(--accent-gold)]/15 via-[var(--card-bg)] to-[var(--card-bg)] p-8 lg:p-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--accent-gold)_0%,_transparent_55%)] opacity-[0.08]"
      />
      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="builder-cta-heading"
            className="text-2xl font-black tracking-tight text-[var(--foreground)]"
          >
            {dict.home.builderCtaTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {dict.home.builderCtaDesc}
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="shrink-0"
          onClick={() => router.push('/builder')}
        >
          {dict.home.builderCtaButton}
        </Button>
      </div>
    </section>
  );
}
