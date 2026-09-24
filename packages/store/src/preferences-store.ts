import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  theme: 'dark' | 'light';
  region: string;
  eloBracket: string;
  locale: string;
}

interface PreferencesActions {
  setTheme: (theme: 'dark' | 'light') => void;
  setRegion: (region: string) => void;
  setEloBracket: (bracket: string) => void;
  setLocale: (locale: string) => void;
  resetPreferences: () => void;
}

const INITIAL_PREFERENCES: PreferencesState = {
  theme: 'dark',
  region: 'na',
  eloBracket: 'all',
  locale: 'en-US',
};

export const usePreferencesStore = create<PreferencesState & PreferencesActions>()(
  persist(
    (set) => ({
      ...INITIAL_PREFERENCES,

      setTheme: (theme) => set({ theme }),
      setRegion: (region) => set({ region }),
      setEloBracket: (eloBracket) => set({ eloBracket }),
      setLocale: (locale) => set({ locale }),
      resetPreferences: () => set(INITIAL_PREFERENCES),
    }),
    {
      name: 'tft-preferences',
      partialize: (state) => ({
        theme: state.theme,
        region: state.region,
        eloBracket: state.eloBracket,
        locale: state.locale,
      }),
    },
  ),
);
