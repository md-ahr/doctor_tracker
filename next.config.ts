import type { NextConfig } from "next";

const API_PREFIX = "/api/v1";

/**
 * The browser only ever talks to this app. Every `/api/v1/*` call is forwarded
 * server-side to the API origin, so the HttpOnly refresh cookie is first-party
 * here instead of a third-party cookie on the API host. Without that, browsers
 * that block third-party cookies drop the cookie and every reload signs out.
 */
const apiOrigin = (process.env.API_ORIGIN ?? "http://localhost:9000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: `${API_PREFIX}/:path*`,
        destination: `${apiOrigin}${API_PREFIX}/:path*`,
      },
    ];
  },
};

export default nextConfig;
