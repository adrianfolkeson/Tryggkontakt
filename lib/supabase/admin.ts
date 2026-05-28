import { createClient } from "@supabase/supabase-js";

// Service-role client for privileged server-only operations
// (e.g. inserts into circle_member, which is server-action-only).
// Never expose this to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
