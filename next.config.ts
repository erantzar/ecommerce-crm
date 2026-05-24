import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Use origin only (no path) — path components in connect-src cause browsers
// to reject sub-path requests, which surfaces as "network error" in Axios.
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
let apiOrigin = rawApiUrl;
try { apiOrigin = new URL(rawApiUrl).origin; } catch { /* use as-is */ }

/**
 * Content-Security-Policy
 *
 * Dev:  'unsafe-inline' + 'unsafe-eval' for Turbopack HMR inline scripts.
 *       Without these, React never hydrates and the CRM is inoperable.
 *
 * Prod: strict — external chunk files only, no inline scripts or eval.
 */
const csp = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",           // MUI + Tailwind inline styles
  "font-src 'self' data:",
  "img-src 'self' res.cloudinary.com data: blob:",
  // In dev, allow any ws:/wss: origin — CSP doesn't support port wildcards,
  // and Turbopack's HMR WebSocket URL varies across Next.js versions.
  // In production there are no WebSocket connections so this never applies.
  isDev
    ? `connect-src 'self' ${apiOrigin} ws: wss:`
    : `connect-src 'self' ${apiOrigin}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",                     // belt-and-suspenders with X-Frame-Options
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/** Applied to every response — admin panel needs these more than the storefront. */
const securityHeaders = [
  // Prevent MIME-type sniffing attacks
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block clickjacking — attacker cannot iframe the CRM dashboard
  { key: 'X-Frame-Options', value: 'DENY' },
  // Don't leak full admin URL as Referer to external image hosts (Cloudinary)
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable features the CRM doesn't use
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
