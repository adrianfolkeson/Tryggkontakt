"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requestInviteSignIn(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!token || !email) {
    redirect(`/inbjudan/${token}?error=otp`);
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const nextPath = `/inbjudan/${token}?accept=1`;
  const emailRedirectTo = `${origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo,
    },
  });

  if (error) {
    redirect(`/inbjudan/${token}?error=otp`);
  }

  redirect(`/inbjudan/${token}?sent=1`);
}
