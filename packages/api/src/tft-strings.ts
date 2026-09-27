/**
 * Localized game strings from the official game client data
 * (Community Dragon `rcp-be-lol-game-data` plugin, free, no API key).
 * Used as a display-name overlay on top of the English Community Dragon
 * dump, keyed by stable apiName ids — so slugs, saves and share links
 * stay identical across locales.
 */
export type GameLocale = 'en' | 'vi';

export function normalizeGameLocale(raw: string | null | undefined): GameLocale {
  return typeof raw === 'string' && raw.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

export interface TftStrings {
  /** Champion apiName -> localized display name. */
  champions: Map<string, string>;
  /** Trait apiName -> localized display name. */
  traits: Map<string, string>;
}

interface CharacterRecord {
  character_id?: string;
  display_name?: string;
  traits?: Array<{ id?: string; name?: string }>;
}

const STRINGS_URL =
  'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/vi_vn/v1/tftchampions.json';

// The upstream file must look like a real string table before we trust it.
const MIN_CHAMPIONS = 50;

const stringsCache = new Map<GameLocale, Promise<TftStrings>>();

/** Fetch localized display names (empty maps = fall back to English). */
export function fetchTftStrings(locale: GameLocale): Promise<TftStrings> {
  const cached = stringsCache.get(locale);
  if (cached) return cached;
  const task = loadTftStrings(locale).catch((error) => {
    stringsCache.delete(locale);
    throw error;
  });
  stringsCache.set(locale, task);
  return task;
}

async function loadTftStrings(locale: GameLocale): Promise<TftStrings> {
  const empty: TftStrings = { champions: new Map(), traits: new Map() };
  if (locale === 'en') return empty;

  const response = await fetch(STRINGS_URL, {
    headers: { 'User-Agent': 'tft-dashboard' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch TFT strings (${locale}): ${response.status}`);
  }

  const raw: unknown = await response.json();
  if (typeof raw !== 'object' || raw === null) return empty;

  const champions = new Map<string, string>();
  const traits = new Map<string, string>();
  for (const value of Object.values(raw)) {
    const record = (value as { character_record?: CharacterRecord })?.character_record;
    if (!record || typeof record.character_id !== 'string') continue;
    if (typeof record.display_name === 'string' && record.display_name.length > 0) {
      champions.set(record.character_id, record.display_name);
    }
    for (const trait of record.traits ?? []) {
      if (
        typeof trait?.id === 'string' &&
        typeof trait?.name === 'string' &&
        trait.name.length > 0 &&
        !traits.has(trait.id)
      ) {
        traits.set(trait.id, trait.name);
      }
    }
  }

  // Guard against truncated/broken dumps (the old TFT13 vi file, for example).
  if (champions.size < MIN_CHAMPIONS) return empty;
  return { champions, traits };
}
