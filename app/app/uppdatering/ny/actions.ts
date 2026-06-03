"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const MOODS = ["happy", "calm", "tired", "worried"] as const;
const SLEEPS = ["good", "okay", "poor"] as const;
const ENERGIES = ["high", "medium", "low"] as const;
const VISIBILITIES = ["all", "relatives"] as const;

export type State = { error?: string };

const GENERIC_ERROR =
  "Det gick inte att spara just nu. Försök igen om en stund.";

export async function createDailyUpdate(
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

  const mood = String(formData.get("mood") ?? "");
  const sleep = String(formData.get("sleep") ?? "");
  const energy = String(formData.get("energy") ?? "");
  const visibility = String(formData.get("visibility") ?? "all");
  const freeText = String(formData.get("freeText") ?? "").trim();

  const moodOk = (MOODS as readonly string[]).includes(mood);
  const sleepOk = (SLEEPS as readonly string[]).includes(sleep);
  const energyOk = (ENERGIES as readonly string[]).includes(energy);
  const visibilityOk = (VISIBILITIES as readonly string[]).includes(visibility);

  if (!moodOk || !sleepOk || !energyOk || !visibilityOk) {
    return { error: GENERIC_ERROR };
  }
  if (!freeText || freeText.length > 280) {
    return { error: GENERIC_ERROR };
  }

  const { data: membership } = await supabase
    .from("circle_member")
    .select("circle_id, role")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return { error: GENERIC_ERROR };
  }

  // Reject mismatched visibility from non-relative submitters. The
  // form hides the picker for them; this guards against a forged
  // POST. Better to fail loud than silently flip the bit.
  const relativesOnly = visibility === "relatives";
  if (relativesOnly && membership.role !== "relative") {
    return { error: GENERIC_ERROR };
  }

  const { error } = await supabase.from("daily_update").insert({
    circle_id: membership.circle_id,
    author_user_id: user.id,
    mood,
    sleep,
    energy,
    free_text: freeText,
    relatives_only: relativesOnly,
  });

  if (error) {
    console.error("daily_update insert failed:", error);
    return { error: GENERIC_ERROR };
  }

  redirect("/app?sparat=1");
}
