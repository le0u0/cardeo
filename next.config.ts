import type { NextConfig } from "next";
const config: NextConfig = {
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.mobalytics.gg",
        pathname: "/assets/sts2/images/cards/new/**",
      },
    ],
  },
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingIncludes: { "/*": ["./supabase/**/*.sql"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
