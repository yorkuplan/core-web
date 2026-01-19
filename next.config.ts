import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure serverless functions work correctly
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
