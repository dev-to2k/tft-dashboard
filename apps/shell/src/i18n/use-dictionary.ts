'use client';

import { NUMBER_LOCALES, dictionaries, resolveLocale, type Locale } from './dictionaries';
import { usePreferencesStore } from '@tft/store';

export type { Locale };
export { LOCALES, LOCALE_LABELS } from './dictionaries';

export function useLocale(): Locale {
  const raw = usePreferencesStore((s) => s.locale);
  return resolveLocale(raw);
}

export function useDictionary() {
  const locale = useLocale();
  return { locale, dict: dictionaries[locale], numberLocale: NUMBER_LOCALES[locale] };
}
