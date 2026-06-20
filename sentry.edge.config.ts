// Sentry edge-runtime init (Vercel edge / proxy).
// Loaded by instrumentation.ts via dynamic import when
// NEXT_RUNTIME=edge.

import * as Sentry from "@sentry/nextjs";

import { scrubEvent } from "./lib/sentry/scrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";

Sentry.init({
  dsn,
  enabled: dsn.length > 0,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: 0.1,
  ignoreErrors: [
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],
  beforeSend: scrubEvent,
});
