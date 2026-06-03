import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  // Prevent Next.js from bundling meyda — it references Web Audio API globals
  // that break the server bundler. Load it at runtime via Node.js require instead.
  serverExternalPackages: ["meyda", "ffmpeg-static"],
};

export default nextConfig;
