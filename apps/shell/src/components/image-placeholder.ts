/**
 * Shared bits for Community Dragon <Image> fallbacks.
 *
 * Upstream tiles (e.g. the Nidalee splash) occasionally time out. Every
 * consumer renders a local fallback (skeleton/initials/gradient) while
 * loading and swaps to it permanently via `onError`, so a slow CDN never
 * leaves a broken-image hole in the layout.
 */

/** 8x8 shimmer used as `blurDataURL` — no extra network request. */
export const IMAGE_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMjYyNjM2Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMTExODI3Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==';

/** Local artwork shown when every upstream URL for a champion fails. */
export const CHAMPION_FALLBACK_SRC = '/images/champion-fallback.svg';
