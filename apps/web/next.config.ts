import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/v1/assets/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow external avatars (GitHub, etc.)
      },
    ],
  },
};

export default nextConfig;
