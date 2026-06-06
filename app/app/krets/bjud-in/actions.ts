"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendInviteEmail } from "@/lib/email/resend";
import { stockholmLongDate } from "@/lib/stockholm";

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

  // Defense-in-depth: catch the "they're already in the circle via
  // direct insert / older flow" case (no accepted-invite row to match).
  // The unique partial index on (circle_id, lower(email)) WHERE
  // status in ('pending','accepted') handles invite-table-level
  // duplicates separately below.
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

  // Branch on any existing "live" invite (pending or accepted) for
  // this (circle, email). The partial unique index in the migration
  // guarantees at most one such row.
  //   - accepted → reject inline (already a member, via this invite
  //     or another).
  //   - pending + not expired → keep the same token, push expires_at
  //     to a fresh 7-day window, refresh role + inviter, re-send the
  //     email. "Resent" toast.
  //   - pending + expired → regenerate token, new expires_at, refresh
  //     role + inviter, send a fresh email. Also "resent" UX-wise.
  //   - none → INSERT a fresh invite (original path).
  const { data: existingInvite } = await admin
    .from("circle_invite")
    .select("id, status, expires_at, token")
    .eq("circle_id", ownMembership.circle_id)
    .ilike("invited_email", emailRaw)
    .in("status", ["pending", "accepted"])
    .maybeSingle();

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString();

  let token: string;
  let wasResend = false;

  if (existingInvite) {
    if (existingInvite.status === "accepted") {
      return { error: "Den här personen är redan med i kretsen." };
    }

    // status === 'pending'
    const isExpired =
      new Date(existingInvite.expires_at).getTime() < Date.now();

    token = isExpired ? crypto.randomUUID() : existingInvite.token;

    const updates: {
      expires_at: string;
      role: string;
      invited_by_user_id: string;
      token?: string;
    } = {
      expires_at: expiresAt,
      role,
      invited_by_user_id: user.id,
    };
    if (isExpired) updates.token = token;

    const { error: updateError } = await admin
      .from("circle_invite")
      .update(updates)
      .eq("id", existingInvite.id);

    if (updateError) {
      console.error("circle_invite resend update failed:", updateError);
      return { error: GENERIC_ERROR };
    }
    wasResend = true;
  } else {
    token = crypto.randomUUID();
    const { error: insertError } = await admin
      .from("circle_invite")
      .insert({
        circle_id: ownMembership.circle_id,
        invited_by_user_id: user.id,
        invited_email: emailRaw,
        role,
        token,
        expires_at: expiresAt,
      });
    if (insertError) {
      console.error("circle_invite insert failed:", insertError);
      return { error: GENERIC_ERROR };
    }
  }

  // ────────────────────────────────────────────────────────────────
  // Email send fires on BOTH branches (INSERT and UPDATE). This is
  // the only path that ends in a delivered email to the invitee, so
  // both new and resent invites flow through here.
  // ────────────────────────────────────────────────────────────────
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
  const sentAtLabel = stockholmLongDate(new Date());

  try {
    await sendInviteEmail({
      to: emailRaw,
      inviterFirstName,
      personName,
      roleLabel: ROLE_LABEL[role] ?? role,
      inviteUrl,
      sentAtLabel,
    });
  } catch (e) {
    // Email failure must not block invite creation. The banner on
    // /app/krets renders the link so the inviter can share by hand.
    console.error("invite email send failed:", e);
  }

  const sparatKey = wasResend ? "resent" : "1";
  redirect(`/app/krets?invited=${token}&sparat=${sparatKey}`);
}
