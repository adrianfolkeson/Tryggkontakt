import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  parseStockholmDateTime,
  stockholmDateStr,
} from "@/lib/stockholm";

import Toast from "../../_components/toast";
import BottomNav from "../_components/bottom-nav";

// TODO: "Tidigare anteckningar" history view — out of scope this pass.

export default async function AnteckningPage({
  searchParams,
}: {
  searchParams: Promise<{ sparat?: string }>;
}) {
  const sp = await searchParams;
  const showToast = sp.sparat === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: membership } = await supabase
    .from("circle_member")
    .select("circle_id, role")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();
  if (!membership) {
    redirect("/app");
  }

  const today = stockholmDateStr(new Date());
  const startUtc = parseStockholmDateTime(`${today}T00:00`).toISOString();

  const { data: notesData } = await supabase
    .from("daily_update")
    .select("id, free_text, created_at, relatives_only, author_user_id")
    .eq("circle_id", membership.circle_id)
    .eq("slot", "snabbnotering")
    .gte("created_at", startUtc)
    .order("created_at", { ascending: true });

  const notes = notesData ?? [];
  const authorIds = Array.from(
    new Set(notes.map((n) => n.author_user_id)),
  );
  const nameByUserId = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profile_public")
      .select("user_id, display_name")
      .in("user_id", authorIds);
    for (const p of profiles ?? []) {
      nameByUserId.set(p.user_id, p.display_name ?? "");
    }
  }

  const timeFmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        className="sticky top-0 bg-bg flex items-center h-14 px-4 max-w-content mx-auto w-full"
      >
        <h1 className="text-h1 text-text">Anteckning</h1>
      </header>

      <main className="flex-1 px-4 pb-32 max-w-content mx-auto w-full flex flex-col gap-3">
        {notes.length === 0 ? (
          <p className="mt-4 text-body text-text-muted">
            Inga anteckningar idag än.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-2"
              >
                <p className="text-body text-text whitespace-pre-wrap">
                  {n.free_text}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-meta text-text-muted">
                    {nameByUserId.get(n.author_user_id) || "(okänd)"}
                    {" · "}
                    {timeFmt.format(new Date(n.created_at))}
                  </p>
                  {n.relatives_only && (
                    <span className="text-meta text-primary bg-primary-soft rounded-pill px-2 py-0.5">
                      Bara anhöriga
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/app/snabbnotering/ny"
          className="mt-4 w-full flex items-center justify-center gap-2 min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-all duration-quick ease-standard hover:bg-primary-hover active:scale-[0.98]"
        >
          <Plus size={20} strokeWidth={2} aria-hidden="true" />
          Lägg till anteckning
        </Link>
      </main>

      {showToast && <Toast message="Anteckning sparad" />}
      <BottomNav active="notes" />
    </div>
  );
}
