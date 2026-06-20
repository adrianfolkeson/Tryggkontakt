// Sentry server-side init (Node.js runtime).
// Loaded by instrumentation.ts via dynamic import when NEXT_RUNTIME=nodejs.
//
// PII handling: beforeSend strips cookies, user email/IP, and known
// sensitive breadcrumb fields (free_text, period_note, meal_note,
// mood, energy, email, phone). User content from daily_update must
// never end up in Sentry — see §7 of /integritet.

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
    "invite_expired",
    "invite_not_found",
    "magic_link_expired",
    "User not found",
    /row-level security/i,
  ],
  beforeSend: scrubEvent,
});
