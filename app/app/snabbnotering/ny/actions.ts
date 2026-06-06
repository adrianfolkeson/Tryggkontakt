"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VISIBILITIES = ["all", "relatives"] as const;

export type State = { error?: string };

const GENERIC_ERROR =
  "Det gick inte att spara just nu. Försök igen om en stund.";

export async function saveSnabbnotering(
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

  const freeText = String(formData.get("freeText") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "all");

  if (!freeText || freeText.length > 280) return { error: GENERIC_ERROR };
  if (!(VISIBILITIES as readonly string[]).includes(visibility)) {
    return { error: GENERIC_ERROR };
  }

  const { data: membership } = await supabase
    .from("circle_member")
    .select("circle_id, role")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();

  if (!membership) return { error: GENERIC_ERROR };

  const relativesOnly = visibility === "relatives";
  if (relativesOnly && membership.role !== "relative") {
    return { error: GENERIC_ERROR };
  }

  const { error } = await supabase.from("daily_update").insert({
    circle_id: membership.circle_id,
    author_user_id: user.id,
    slot: "snabbnotering",
    free_text: freeText,
    relatives_only: relativesOnly,
  });

  if (error) {
    console.error("snabbnotering insert failed:", error);
    return { error: GENERIC_ERROR };
  }

  redirect("/app/anteckning?sparat=1");
}
