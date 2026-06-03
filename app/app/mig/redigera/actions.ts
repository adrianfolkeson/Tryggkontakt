"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type State = { error?: string };

const GENERIC_ERROR =
  "Det gick inte att spara just nu. Försök igen om en stund.";

export async function updateProfile(
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
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();

  if (!firstName || !lastName) {
    return { error: GENERIC_ERROR };
  }

  const { error } = await supabase
    .from("profile_public")
    .update({
      display_name: `${firstName} ${lastName}`,
      phone_number: phoneNumber || null,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("profile_public update failed:", error);
    return { error: GENERIC_ERROR };
  }

  redirect("/app/mig?sparat=1");
}
