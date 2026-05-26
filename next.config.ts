import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Types are checked in CI; allow builds to succeed during first deploy
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
