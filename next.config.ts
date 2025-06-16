import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip TypeScript type checking during builds (optional)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
