// Health check for /status. Anonymous Supabase client + 5s timeout.
// No auth required — this needs to render for visitors who are not
// signed in. The query targets profile_public via the anon role,
// which is allowed by the existing RLS policies for empty result sets.

import { createClient } from "@supabase/supabase-js";

export type HealthStatus = {
  db: "ok" | "down";
  app: "ok";
  timestamp: string;
};

const TIMEOUT_MS = 5_000;

export async function checkHealth(): Promise<HealthStatus> {
  const timestamp = new Date().toISOString();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { db: "down", app: "ok", timestamp };
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const result = await Promise.race([
      supabase.from("profile_public").select("user_id").limit(1),
      new Promise<{ error: { message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS),
      ),
    ]);

    if ("error" in result && result.error) {
      return { db: "down", app: "ok", timestamp };
    }
    return { db: "ok", app: "ok", timestamp };
  } catch {
    return { db: "down", app: "ok", timestamp };
  }
}
