// Next.js instrumentation entry point.
// Loads the right Sentry config depending on which runtime is
// booting (Node.js vs edge). Client config (sentry.client.config.ts)
// is auto-loaded by the Sentry webpack plugin at build time and is
// NOT imported here.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
