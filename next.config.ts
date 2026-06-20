import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry build-time config. Source-map upload to Sentry for
// readable stack traces in production. Auth token read from
// SENTRY_AUTH_TOKEN at build time (set in Vercel).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  // Don't break the build if Sentry source-map upload errors
  // (missing auth token, network blip, etc.).
  disableLogger: true,
  tunnelRoute: "/monitoring",
});
