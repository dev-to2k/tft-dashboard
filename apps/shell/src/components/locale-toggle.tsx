'use client';

import { LOCALES, LOCALE_LABELS } from '@/i18n/use-dictionary';
import { useDictionary } from '@/i18n/use-dictionary';
import { usePreferencesStore } from '@tft/store';
import { useMounted } from '@/hooks/use-mounted';

export function LocaleToggle({ className = '' }: { className?: string }) {
  const { locale, dict } = useDictionary();
  const setLocale = usePreferencesStore((s) => s.setLocale);
  const mounted = useMounted();

  if (!mounted) {
    return <span aria-hidden="true" className={`h-7 w-20 rounded-lg border border-[var(--border)] ${className}`} />;
  }

  return (
    <div
      role="group"
      aria-label={dict.locale.label}
      className={`flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] p-0.5 ${className}`}
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            title={dict.locale.label}
            className={`rounded-md px-2 py-1 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
              active
                ? 'bg-[var(--accent-gold)] text-[var(--gold-foreground)]'
                : 'text-muted-foreground hover:text-[var(--accent-gold)]'
            }`}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
