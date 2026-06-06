"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updateDefaultVisibility(
  relativesOnly: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "auth" };
  }

  const { error } = await supabase
    .from("profile_public")
    .update({ default_relatives_only: relativesOnly })
    .eq("user_id", user.id);

  if (error) {
    return { error: "save" };
  }
  redirect("/app/installningar?sparat=1");
}

export type DeleteState = { error?: "confirm" | "delete" };

export async function deleteAccount(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const confirmation = String(formData.get("confirmation") ?? "");
  if (confirmation !== "TA BORT") {
    return { error: "confirm" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { error } = await supabase.rpc("delete_user_account", {
    p_user_id: user.id,
  });
  if (error) {
    return { error: "delete" };
  }

  // User row gone; supabase.auth.signOut() would error trying to revoke
  // a session owned by a deleted user. Clear the session cookies directly.
  const store = await cookies();
  for (const c of store.getAll()) {
    if (c.name.startsWith("sb-")) {
      store.delete(c.name);
    }
  }
  redirect("/sign-in?konto-borttaget=1");
}
