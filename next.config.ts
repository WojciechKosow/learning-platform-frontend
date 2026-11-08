import type { NextConfig } from "next";

/**
 * Where the Spring backend (learning-app) lives. The browser never calls it
 * directly: every /api/* request goes to this app's own origin and is proxied
 * there (see `rewrites`). That keeps the refresh-token cookie first-party, so
 * it also works in browsers that block third-party cookies (Safari, etc.), and
 * no CORS preflight is needed.
 *
 * Override with BACKEND_URL (no trailing slash), e.g. in Vercel's project
 * settings or in .env.local for a local backend.
 */
const BACKEND_URL = (
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8080" : "https://learning-app-production-f6ef.up.railway.app")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // The /api proxy's default 30 s timeout is shorter than an interview step
    // can take (one model call, sometimes an escalation, at most one retry).
    // The backend keeps its own per-call timeouts.
    proxyTimeout: 180_000,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
