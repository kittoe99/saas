import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during production builds to avoid blocking deploys.
    // You can still run `npm run lint` locally to check.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;
