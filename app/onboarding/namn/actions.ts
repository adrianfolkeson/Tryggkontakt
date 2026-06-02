"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type State = { error?: string };

const GENERIC_ERROR = "Det gick inte att spara namnet. Försök igen.";

export async function saveName(
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

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  if (!firstName || !lastName) {
    return { error: GENERIC_ERROR };
  }

  const displayName = `${firstName} ${lastName}`;

  const { error } = await supabase
    .from("profile_public")
    .update({ display_name: displayName })
    .eq("user_id", user.id);

  if (error) {
    console.error("profile_public update failed:", error);
    return { error: GENERIC_ERROR };
  }

  redirect("/app");
}
