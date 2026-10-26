import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  async rewrites() {
    // Georgian pages live under app/(site)/[lang] as /ka but are public at bare paths.
    // Done here rather than in the proxy so the rewrite is always internal.
    return { beforeFiles: [
      { source: "/", destination: "/ka" },
      { source: "/:path((?!en(?:/|$)|ka(?:/|$)|admin|api|_next|.*\\.).+)", destination: "/ka/:path" },
    ], afterFiles: [], fallback: [] };
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
    ] }];
  }
};
export default nextConfig;
