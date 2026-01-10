import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["discord.js", "zlib-sync", "utf-8-validate", "bufferutil"],

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },

  // Turbopack config (default in Next.js 16)
  turbopack: {},
};

export default nextConfig;
