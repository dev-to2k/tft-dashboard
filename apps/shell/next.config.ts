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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
      },
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
      },
    ],
  },
};

export default nextConfig;
