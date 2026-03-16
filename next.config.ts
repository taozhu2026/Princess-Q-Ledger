import type { NextConfig } from "next";

const buildTimestamp = new Date().toISOString();
const buildToken = buildTimestamp.replace(/[^0-9]/g, "").slice(0, 14);
const commitToken = (process.env.VERCEL_GIT_COMMIT_SHA ?? "local")
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "")
  .slice(0, 12);
const appBuildId = `${commitToken || "local"}-${buildToken}`;
const DOCUMENT_CACHE_HEADERS = [
  {
    key: "Cache-Control",
    value: "private, no-cache, no-store, max-age=0, must-revalidate",
  },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_BUILD_ID: appBuildId,
    NEXT_PUBLIC_APP_BUILD_TIME: buildTimestamp,
  },
  async generateBuildId() {
    return appBuildId;
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/api/app-version",
        headers: DOCUMENT_CACHE_HEADERS,
      },
      {
        source: "/",
        headers: DOCUMENT_CACHE_HEADERS,
      },
      {
        source: "/ledger",
        headers: DOCUMENT_CACHE_HEADERS,
      },
      {
        source: "/statistics",
        headers: DOCUMENT_CACHE_HEADERS,
      },
      {
        source: "/settings",
        headers: DOCUMENT_CACHE_HEADERS,
      },
      {
        source: "/auth/:path*",
        headers: DOCUMENT_CACHE_HEADERS,
      },
      {
        source: "/invite/:path*",
        headers: DOCUMENT_CACHE_HEADERS,
      },
    ];
  },
};

export default nextConfig;
