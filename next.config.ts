import type { NextConfig } from "next";

const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "media.gamma.md",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'next-router-prefetch',
            value: '1',
          },
        ],
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
