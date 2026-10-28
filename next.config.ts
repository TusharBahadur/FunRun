import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentUpgrade: "security",
    // Our CSS is small (~27 KB), so ship it inside the HTML instead of as
    // separate files: no render-blocking request before the first paint.
    inlineCss: true,
  },
  cacheComponents: true,
  // 127.0.0.1 plus temporary phone-testing tunnels (dev only).
  allowedDevOrigins: [
    "127.0.0.1",
    "*.trycloudflare.com",
    "*.loca.lt",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
  partialPrefetching: true,
  // Fingerprinted images (scripts/build-assets.mjs): a file's name changes when
  // its content does, so browsers and the CDN can keep them forever.
  // Old gallery links used ?occasion=; each occasion now has its own static page.
  async redirects() {
    return [
      {
        source: "/templates",
        has: [{ type: "query", key: "occasion", value: "(?<occasion>[a-z-]+)" }],
        destination: "/templates/for/:occasion",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      { source: "/a/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
