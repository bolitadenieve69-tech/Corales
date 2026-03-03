import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
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
        hostname: '*.railway.app',
        pathname: '/api/v1/assets/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow external avatars
      },
    ],
  },
};

export default nextConfig;
