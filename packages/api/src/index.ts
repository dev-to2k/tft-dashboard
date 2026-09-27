// Client
export { tftFetch, type FetchOptions } from './client';

// Game locales + official display-name strings
export { normalizeGameLocale, fetchTftStrings, type GameLocale, type TftStrings } from './tft-strings';

// Community Dragon (static game data — free, no API key)
export {
  COMMUNITY_DRAGON_DATA_URL,
  fetchStaticData,
  fetchChampions,
  fetchTraits,
  fetchItems,
  fetchAugments,
  toCdragonUrl,
  slugify,
  type TftStaticData,
} from './community-dragon';

// MetaTFT (live statistics — free, no API key)
export { fetchMetaStats, normalizeId, type MetaStatsPayload } from './metatft';

// Hooks
export { useChampions, useStaticData, STATIC_DATA_URL } from './hooks/use-champions';
export { useMetaStats, META_STATS_URL, type UseMetaStatsParams } from './hooks/use-meta-stats';
export { useSearch } from './hooks/use-search';
