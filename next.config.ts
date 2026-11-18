import type { NextConfig } from "next";

/**
 * Browser security headers (see docs/legal-security/SECURITY_AUDIT_REPORT.md).
 * - HSTS: browsers only ever use HTTPS for tynitales.com.
 * - frame-ancestors / X-Frame-Options: other sites can't frame our pages
 *   (clickjacking). Our own studio frames /studio/frame, so same-origin is allowed.
 * - The microphone stays allowed for our own pages: the birthday cake listens
 *   for a blow. Camera, location and payment-request APIs aren't used.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
];

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
      // Security headers on every page and API response.
      { source: "/:path*", headers: securityHeaders },
      { source: "/a/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // Showcase pictures keep their names when retaken, so cache for a day and
      // refresh quietly in the background, instead of re-checking on every view.
      { source: "/showcase/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
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
