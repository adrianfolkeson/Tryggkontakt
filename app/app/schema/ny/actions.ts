"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { parseStockholmDateTime } from "@/lib/stockholm";

export type State = { error?: string };

const GENERIC_ERROR =
  "Det gick inte att spara just nu. Försök igen om en stund.";

export async function createScheduleItem(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const title = String(formData.get("title") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();

  if (title.length < 1 || title.length > 80) {
    return { error: GENERIC_ERROR };
  }
  if (!startsAtRaw) {
    return { error: GENERIC_ERROR };
  }
  if (notesRaw.length > 280) {
    return { error: GENERIC_ERROR };
  }

  let startsAt: Date;
  let endsAt: Date | null = null;
  try {
    startsAt = parseStockholmDateTime(startsAtRaw);
    if (endsAtRaw) {
      endsAt = parseStockholmDateTime(endsAtRaw);
      if (endsAt.getTime() <= startsAt.getTime()) {
        return { error: GENERIC_ERROR };
      }
    }
  } catch {
    return { error: GENERIC_ERROR };
  }

  const { data: membership } = await supabase
    .from("circle_member")
    .select("circle_id")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return { error: GENERIC_ERROR };
  }

  const { error } = await supabase.from("schedule_item").insert({
    circle_id: membership.circle_id,
    created_by_user_id: user.id,
    title,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt?.toISOString() ?? null,
    notes: notesRaw || null,
  });

  if (error) {
    console.error("schedule_item insert failed:", error);
    return { error: GENERIC_ERROR };
  }

  redirect("/app/schema?sparat=1");
}
