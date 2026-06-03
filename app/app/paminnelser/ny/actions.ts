"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { parseStockholmDateTime } from "@/lib/stockholm";

export type State = { error?: string };

const GENERIC_ERROR =
  "Det gick inte att spara just nu. Försök igen om en stund.";

export async function createReminder(
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
  const dueAtRaw = String(formData.get("dueAt") ?? "").trim();
  const isUrgent = formData.get("isUrgent") === "on";

  if (title.length < 1 || title.length > 80) {
    return { error: GENERIC_ERROR };
  }
  if (!dueAtRaw) {
    return { error: GENERIC_ERROR };
  }

  let dueAt: Date;
  try {
    dueAt = parseStockholmDateTime(dueAtRaw);
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

  const { error } = await supabase.from("reminder").insert({
    circle_id: membership.circle_id,
    created_by_user_id: user.id,
    title,
    due_at: dueAt.toISOString(),
    is_urgent: isUrgent,
  });

  if (error) {
    console.error("reminder insert failed:", error);
    return { error: GENERIC_ERROR };
  }

  redirect("/app/paminnelser?sparat=1");
}
