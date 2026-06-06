"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type RevokeState = { error?: "blocked" | "save" };

export async function revokeMember(
  _prev: RevokeState,
  formData: FormData,
): Promise<RevokeState> {
  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) {
    return { error: "save" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { error } = await supabase.rpc("revoke_circle_member", {
    p_member_id: memberId,
  });
  if (error) {
    if (error.code === "42501") {
      return { error: "blocked" };
    }
    console.error("revoke_circle_member failed:", error);
    return { error: "save" };
  }

  redirect("/app/krets?sparat=avslutad");
}
