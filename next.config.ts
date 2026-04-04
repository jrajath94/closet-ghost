import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.runwayml.com',
      },
      {
        protocol: 'https',
        hostname: '*.runway.com',
      },
    ],
  },
};

export default nextConfig;
