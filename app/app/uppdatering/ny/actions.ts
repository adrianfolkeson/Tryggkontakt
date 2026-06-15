"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  addDaysToDateStr,
  parseStockholmDateTime,
  stockholmDateStr,
} from "@/lib/stockholm";

const VISIBILITIES = ["all", "relatives"] as const;
const SLOTS = ["morgon", "lunch", "eftermiddag"] as const;

export type State = { error?: string };

const GENERIC_ERROR =
  "Det gick inte att spara just nu. Försök igen om en stund.";

const MAX_NOTE = 280;
const MAX_INLINE = 80;

function normalize(value: FormDataEntryValue | null, max: number): string | null {
  const trimmed = String(value ?? "").trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > max) return trimmed.slice(0, max);
  return trimmed;
}

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

  const periodNote = normalize(formData.get("periodNote"), MAX_NOTE);
  const mealNote = normalize(formData.get("mealNote"), MAX_NOTE);
  const mood = normalize(formData.get("mood"), MAX_INLINE);
  const energy = normalize(formData.get("energy"), MAX_INLINE);
  const visibility = String(formData.get("visibility") ?? "all");

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

  // Named-slot rows write only the new structured columns. free_text
  // is left null so the slot-conditional CHECK (snabbnotering only)
  // does not fire.
  const payload = {
    period_note: periodNote,
    meal_note: mealNote,
    mood,
    energy,
    relatives_only: relativesOnly,
  };

  // Upsert on (circle_id, slot, Stockholm-day): if a row already
  // exists for this slot today, overwrite it instead of colliding
  // with the daily_update_slot_per_day_unique index. The unique
  // index is defined on a functional expression (timezone-cast of
  // created_at) so Supabase upsert by onConflict can't target it
  // directly — we resolve the existing row in app code first.
  let targetId = id;
  if (!targetId) {
    const today = stockholmDateStr(new Date());
    const startUtc = parseStockholmDateTime(`${today}T00:00`).toISOString();
    const endUtc = parseStockholmDateTime(
      `${addDaysToDateStr(today, 1)}T00:00`,
    ).toISOString();

    const { data: existing } = await supabase
      .from("daily_update")
      .select("id")
      .eq("circle_id", membership.circle_id)
      .eq("slot", slot)
      .gte("created_at", startUtc)
      .lt("created_at", endUtc)
      .maybeSingle();

    if (existing?.id) {
      targetId = existing.id;
    }
  }

  if (targetId) {
    const { error } = await supabase
      .from("daily_update")
      .update(payload)
      .eq("id", targetId)
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
