"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type State = { error?: string };

export async function createFirstCircle(
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
  const personFirstName = String(formData.get("personFirstName") ?? "").trim();
  const personDob = String(formData.get("personDateOfBirth") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();

  if (!firstName || !lastName || !personFirstName) {
    return { error: "Alla obligatoriska fält måste fyllas i." };
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("create_first_circle", {
    p_user_id: user.id,
    p_first_name: firstName,
    p_last_name: lastName,
    p_person_first_name: personFirstName,
    p_person_date_of_birth: personDob || null,
    p_phone_number: phoneNumber || null,
  });

  if (error) {
    console.error("create_first_circle failed:", error);
    return { error: "Det gick inte att skapa kretsen. Försök igen." };
  }

  redirect("/app");
}
