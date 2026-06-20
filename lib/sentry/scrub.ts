// Shared PII scrubber for Sentry events.
// Runs on every event before it leaves the process (server, edge,
// or browser). The redaction list mirrors every column in
// public.daily_update that can hold user-authored content plus
// the obvious account-level PII fields.

import type { ErrorEvent } from "@sentry/nextjs";

const SENSITIVE_KEYS = [
  "email",
  "phone",
  "phone_number",
  "free_text",
  "period_note",
  "meal_note",
  "mood",
  "energy",
  // Legacy column names — still in the table for old rows.
  "sleep",
  "meal_eaten",
  "period_summary",
] as const;

function redactRecord(record: Record<string, unknown> | undefined): void {
  if (!record) return;
  for (const k of SENSITIVE_KEYS) {
    if (k in record) {
      record[k] = "[REDACTED]";
    }
  }
}

export function scrubEvent(event: ErrorEvent): ErrorEvent | null {
  if (event.request?.cookies) {
    delete event.request.cookies;
  }
  if (event.request?.headers) {
    delete event.request.headers.cookie;
    delete event.request.headers.authorization;
  }
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((b) => {
      if (b.data) {
        redactRecord(b.data as Record<string, unknown>);
      }
      return b;
    });
  }
  return event;
}
