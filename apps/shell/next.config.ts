import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@tft/ui",
    "@tft/types",
    "@tft/api",
    "@tft/store",
    "@tft/game-data",
    "@tft/utils",
  ],
  // Serialize static generation: parallel prerender workers race on
  // Windows file locks and fail non-deterministically with
  // "Cannot find module for page" / missing .nft.json errors.
  experimental: {
    staticGenerationMaxConcurrency: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
        pathname: "/cdn/**",
      },
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
        pathname: "/latest/game/**",
      },
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
        pathname: "/latest/cdragon/**",
      },
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
        pathname: "/latest/plugins/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Cache optimized upstream tiles (e.g. Nidalee splash) for a day so a
    // slow Community Dragon response only hurts once.
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
