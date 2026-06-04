import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import NyUppdateringForm from "./form";

const VALID_SLOTS = ["morgon", "lunch", "eftermiddag"] as const;
type Slot = (typeof VALID_SLOTS)[number];

type ExistingRow = {
  id: string;
  slot: string;
  mood: string | null;
  sleep: string | null;
  energy: string | null;
  meal_eaten: string | null;
  period_summary: string | null;
  free_text: string;
  relatives_only: boolean;
  author_user_id: string;
};

export default async function NyUppdateringPage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string; id?: string }>;
}) {
  const sp = await searchParams;
  const slot = sp.slot;
  if (!slot || !(VALID_SLOTS as readonly string[]).includes(slot)) {
    redirect("/app");
  }

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

  const isRelative = membership.role === "relative";

  let existing: ExistingRow | null = null;
  if (sp.id) {
    const { data } = await supabase
      .from("daily_update")
      .select(
        "id, slot, mood, sleep, energy, meal_eaten, period_summary, free_text, relatives_only, author_user_id",
      )
      .eq("id", sp.id)
      .eq("circle_id", membership.circle_id)
      .maybeSingle();
    if (data && data.slot === slot) {
      existing = data as ExistingRow;
    }
  }

  return (
    <NyUppdateringForm
      slot={slot as Slot}
      isRelative={isRelative}
      existing={existing}
    />
  );
}
