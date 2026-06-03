"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendInviteEmail } from "@/lib/email/resend";

export type State = { error?: string };

const GENERIC_ERROR =
  "Det gick inte att skapa inbjudan. Försök igen om en stund.";

const ROLE_LABEL: Record<string, string> = {
  relative: "anhörig",
  staff: "personal",
  coordinator: "samordnare",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createInvite(
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

  const emailRaw = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "");

  if (!EMAIL_RE.test(emailRaw) || emailRaw.length > 320) {
    return { error: GENERIC_ERROR };
  }
  if (!["relative", "staff", "coordinator"].includes(role)) {
    return { error: GENERIC_ERROR };
  }

  const { data: ownMembership } = await supabase
    .from("circle_member")
    .select("circle_id, role")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();

  if (!ownMembership || ownMembership.role !== "relative") {
    return { error: GENERIC_ERROR };
  }

  const admin = createAdminClient();

  // Two-step duplicate-membership check: list active members of this
  // circle, then look for any profile_contact row whose email matches.
  // PostgREST returns the embed as an array; querying separately keeps
  // the types simple.
  const { data: activeMembers } = await admin
    .from("circle_member")
    .select("user_id")
    .eq("circle_id", ownMembership.circle_id)
    .is("valid_to", null);
  const memberUserIds = (activeMembers ?? []).map((m) => m.user_id);

  if (memberUserIds.length > 0) {
    const { data: emailMatch } = await admin
      .from("profile_contact")
      .select("user_id")
      .in("user_id", memberUserIds)
      .ilike("email", emailRaw)
      .limit(1)
      .maybeSingle();
    if (emailMatch) {
      return { error: "Personen är redan medlem i kretsen." };
    }
  }

  const { data: existingInvite } = await admin
    .from("circle_invite")
    .select("id")
    .eq("circle_id", ownMembership.circle_id)
    .eq("status", "pending")
    .ilike("invited_email", emailRaw)
    .limit(1)
    .maybeSingle();
  if (existingInvite) {
    return {
      error: "En inbjudan till den här e-postadressen väntar redan.",
    };
  }

  const token = crypto.randomUUID();

  // Supabase JS turns undefined into null and bypasses the column
  // default, so we set expires_at explicitly. Mirrors the 7-day
  // window the migration encodes as a default.
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString();

  const { data: insertedInvite, error: insertError } = await admin
    .from("circle_invite")
    .insert({
      circle_id: ownMembership.circle_id,
      invited_by_user_id: user.id,
      invited_email: emailRaw,
      role,
      token,
      expires_at: expiresAt,
    })
    .select("id, token")
    .maybeSingle();

  if (insertError || !insertedInvite) {
    console.error("circle_invite insert failed:", insertError);
    return { error: GENERIC_ERROR };
  }

  const { data: inviterProfile } = await admin
    .from("profile_public")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const inviterFirstName =
    inviterProfile?.display_name?.split(" ")[0] ?? "Någon";

  const { data: circleRow } = await admin
    .from("circle")
    .select("person:person_id(display_name)")
    .eq("id", ownMembership.circle_id)
    .maybeSingle();
  const personName =
    (circleRow as { person?: { display_name?: string } } | null)?.person
      ?.display_name ?? "kretsen";

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryggkontakt.vercel.app";
  const inviteUrl = `${siteUrl}/inbjudan/${token}`;

  try {
    await sendInviteEmail({
      to: emailRaw,
      inviterFirstName,
      personName,
      roleLabel: ROLE_LABEL[role] ?? role,
      inviteUrl,
    });
  } catch (e) {
    // Email failure must not block invite creation. The banner on
    // /app/krets renders the link so the inviter can share by hand.
    console.error("invite email send failed:", e);
  }

  redirect(`/app/krets?invited=${token}&sparat=1`);
}
