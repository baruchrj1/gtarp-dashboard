import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["discord.js", "zlib-sync", "utf-8-validate", "bufferutil"],
};

export default nextConfig;
