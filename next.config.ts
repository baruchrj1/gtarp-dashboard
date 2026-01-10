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

  // Redirects
  async redirects() {
    return [
      {
        source: "/reports/new",
        destination: "/player/new",
        permanent: false,
      },
      // Ensure users going to /login while authenticated are redirected
      // This is harder to do in next.config redirects because we don't know auth state
      // but we handled it in the page component.
    ];
  },
};

export default nextConfig;
