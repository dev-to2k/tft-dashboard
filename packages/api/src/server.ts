// Server-only entrypoint: isomorphic data loaders without any React hooks.
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

export { fetchMetaStats, normalizeId, type MetaStatsPayload } from './metatft';
