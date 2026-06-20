// Sentry client-side init (browser).
// Loaded automatically by the Sentry Next.js plugin at build time
// when this file exists at the project root.
//
// PII handling: see sentry.server.config.ts. Same scrubEvent runs
// on the browser side so user content can't leak even if a
// breadcrumb captures form input or fetch payload.

import * as Sentry from "@sentry/nextjs";

import { scrubEvent } from "./lib/sentry/scrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";

Sentry.init({
  dsn,
  enabled: dsn.length > 0,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  ignoreErrors: [
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
  ],
  beforeSend: scrubEvent,
});
