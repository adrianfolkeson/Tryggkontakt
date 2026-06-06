import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const OM_DENNA_FIL =
  "Denna fil innehåller den data du själv har skapat i TryggKontakt: " +
  "dina egna uppdateringar, schema-poster, påminnelser, inbjudningar " +
  "och din profil. Innehåll som andra i kretsen skapat ingår inte.";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const [
    profilePublic,
    profileContact,
    circleMember,
    dailyUpdate,
    scheduleItem,
    reminder,
    circleInvite,
  ] = await Promise.all([
    supabase.from("profile_public").select("*").eq("user_id", user.id),
    supabase.from("profile_contact").select("*").eq("user_id", user.id),
    supabase.from("circle_member").select("*").eq("user_id", user.id),
    supabase.from("daily_update").select("*").eq("author_user_id", user.id),
    supabase
      .from("schedule_item")
      .select("*")
      .eq("created_by_user_id", user.id),
    supabase.from("reminder").select("*").eq("created_by_user_id", user.id),
    supabase
      .from("circle_invite")
      .select("*")
      .eq("invited_by_user_id", user.id),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    email: user.email,
    "om-denna-fil": OM_DENNA_FIL,
    profile_public: profilePublic.data ?? [],
    profile_contact: profileContact.data ?? [],
    circle_member: circleMember.data ?? [],
    daily_update: dailyUpdate.data ?? [],
    schedule_item: scheduleItem.data ?? [],
    reminder: reminder.data ?? [],
    circle_invite: circleInvite.data ?? [],
  };

  const today = new Date().toISOString().slice(0, 10);
  const filename = `tryggkontakt-mitt-data-${today}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
