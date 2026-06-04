"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const MOODS = ["happy", "calm", "tired", "worried"] as const;
const SLEEPS = ["good", "okay", "poor"] as const;
const ENERGIES = ["high", "medium", "low"] as const;
const MEALS = ["ja", "nej", "lite"] as const;
const PERIODS = ["bra", "okej", "tuff"] as const;
const VISIBILITIES = ["all", "relatives"] as const;
const SLOTS = ["morgon", "lunch", "eftermiddag"] as const;

export type State = { error?: string };

const GENERIC_ERROR =
  "Det gick inte att spara just nu. Försök igen om en stund.";

export async function saveDailyUpdate(
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

  const slot = String(formData.get("slot") ?? "");
  const id = String(formData.get("id") ?? "").trim() || null;

  if (!(SLOTS as readonly string[]).includes(slot)) {
    return { error: GENERIC_ERROR };
  }

  const mood = String(formData.get("mood") ?? "");
  const sleep = String(formData.get("sleep") ?? "");
  const energy = String(formData.get("energy") ?? "");
  const meal = String(formData.get("mealEaten") ?? "");
  const periodSummary = String(formData.get("periodSummary") ?? "");
  const visibility = String(formData.get("visibility") ?? "all");
  const freeText = String(formData.get("freeText") ?? "").trim();

  if (!freeText || freeText.length > 280) return { error: GENERIC_ERROR };
  if (!(MOODS as readonly string[]).includes(mood)) return { error: GENERIC_ERROR };
  if (!(ENERGIES as readonly string[]).includes(energy)) return { error: GENERIC_ERROR };
  if (!(MEALS as readonly string[]).includes(meal)) return { error: GENERIC_ERROR };
  if (!(VISIBILITIES as readonly string[]).includes(visibility)) return { error: GENERIC_ERROR };

  if (slot === "morgon") {
    if (!(SLEEPS as readonly string[]).includes(sleep))
      return { error: GENERIC_ERROR };
  } else {
    if (!(PERIODS as readonly string[]).includes(periodSummary))
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

  const payload = {
    mood,
    sleep: slot === "morgon" ? sleep : null,
    energy,
    meal_eaten: meal,
    period_summary: slot === "morgon" ? null : periodSummary,
    free_text: freeText,
    relatives_only: relativesOnly,
  };

  if (id) {
    const { error } = await supabase
      .from("daily_update")
      .update(payload)
      .eq("id", id)
      .eq("circle_id", membership.circle_id);
    if (error) {
      console.error("daily_update update failed:", error);
      return { error: GENERIC_ERROR };
    }
  } else {
    const { error } = await supabase.from("daily_update").insert({
      circle_id: membership.circle_id,
      author_user_id: user.id,
      slot,
      ...payload,
    });
    if (error) {
      console.error("daily_update insert failed:", error);
      return { error: GENERIC_ERROR };
    }
  }

  redirect("/app?sparat=1");
}
