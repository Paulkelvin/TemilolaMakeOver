import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

// Scoped to everything except /studio — Sanity Studio is its own bundled
// React app (Basic Auth-gated in proxy.ts, not publicly reachable) that
// needs a much looser policy than the public site does (blob: workers,
// eval-based chunks, its own API/websocket origins), and no CSP research
// exists that keeps Studio fully functional under a strict policy. The
// public site and Command Center are ours end-to-end, so a real policy is
// worth enforcing there.
//
// script-src/style-src need 'unsafe-inline': the GA/Meta Pixel loaders in
// app/(site)/layout.tsx are inline <Script> tags with no nonce plumbing,
// and the codebase uses plenty of React inline `style={{}}` props, which
// CSP's style-src also governs. Everything else stays locked to 'self'
// plus the exact third-party origins actually in use (GA, Meta Pixel,
// Sanity's image CDN, Unsplash, YouTube embeds).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.sanity.io https://images.unsplash.com https://www.googletagmanager.com https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://connect.facebook.net https://www.facebook.com",
  "frame-src https://www.youtube.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Four service slugs were stored with a leading capital ("Soft-glam"), one
  // was lowercase ("bridal-makeup"). The slugs are now all lowercase in
  // Sanity, but URLs are case-sensitive to search engines and to Next's own
  // router, so the old capitalised paths would 404 for anything already
  // indexed or linked. Permanent redirects preserve that link equity.
  // Note: the /services/<Mixed-Case> -> lowercase redirect lives in proxy.ts,
  // not here. next.config's redirects() matches sources case-INSENSITIVELY and
  // offers no per-rule opt-out in this version, so "/services/Soft-glam" would
  // also match the already-correct "/services/soft-glam" and redirect it to
  // itself — an infinite loop on the very URLs the rule exists to protect
  // (observed live: 308 to the identical path). Middleware sees the real
  // casing, so it can compare and redirect only when they actually differ.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/((?!studio).*)",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
