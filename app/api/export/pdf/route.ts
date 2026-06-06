import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  addDaysToDateStr,
  parseStockholmDateTime,
} from "@/lib/stockholm";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 365;

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "krets"
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const { data: membership } = await supabase
    .from("circle_member")
    .select("circle_id, role")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();
  if (!membership || membership.role !== "relative") {
    return new NextResponse("forbidden", { status: 403 });
  }

  const form = await request.formData();
  const fromStr = String(form.get("from") ?? "");
  const toStr = String(form.get("to") ?? "");

  if (!DATE_RE.test(fromStr) || !DATE_RE.test(toStr)) {
    return new NextResponse("invalid dates", { status: 400 });
  }
  if (fromStr > toStr) {
    return new NextResponse("from after to", { status: 400 });
  }
  const fromMs = Date.UTC(
    Number(fromStr.slice(0, 4)),
    Number(fromStr.slice(5, 7)) - 1,
    Number(fromStr.slice(8, 10)),
  );
  const toMs = Date.UTC(
    Number(toStr.slice(0, 4)),
    Number(toStr.slice(5, 7)) - 1,
    Number(toStr.slice(8, 10)),
  );
  if ((toMs - fromMs) / 86_400_000 > MAX_RANGE_DAYS) {
    return new NextResponse("range too large", { status: 400 });
  }

  const startUtc = parseStockholmDateTime(`${fromStr}T00:00`).toISOString();
  const endUtc = parseStockholmDateTime(
    `${addDaysToDateStr(toStr, 1)}T00:00`,
  ).toISOString();

  const { data: circleRow } = await supabase
    .from("circle")
    .select("person:person_id(display_name)")
    .eq("id", membership.circle_id)
    .maybeSingle();
  const personName =
    (circleRow as { person?: { display_name?: string } } | null)?.person
      ?.display_name ?? "krets";

  const { data: updatesData } = await supabase
    .from("daily_update")
    .select(
      "id, slot, mood, sleep, energy, meal_eaten, period_summary, free_text, created_at, author_user_id",
    )
    .eq("circle_id", membership.circle_id)
    .gte("created_at", startUtc)
    .lt("created_at", endUtc)
    .order("created_at", { ascending: true });

  const authorIds = Array.from(
    new Set((updatesData ?? []).map((u) => u.author_user_id)),
  );
  const authorNameByUserId = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profile_public")
      .select("user_id, display_name")
      .in("user_id", authorIds);
    for (const p of profiles ?? []) {
      authorNameByUserId.set(p.user_id, p.display_name ?? "");
    }
  }

  const updates = (updatesData ?? []).map((u) => ({
    id: u.id,
    slot: u.slot,
    mood: u.mood,
    sleep: u.sleep,
    energy: u.energy,
    meal_eaten: u.meal_eaten,
    period_summary: u.period_summary,
    free_text: u.free_text,
    created_at: u.created_at,
    authorName: authorNameByUserId.get(u.author_user_id) || "(okänd)",
  }));

  const { data: scheduleItems } = await supabase
    .from("schedule_item")
    .select("id, title, starts_at, ends_at, notes")
    .eq("circle_id", membership.circle_id)
    .gte("starts_at", startUtc)
    .lt("starts_at", endUtc)
    .order("starts_at", { ascending: true });

  const { data: reminders } = await supabase
    .from("reminder")
    .select("id, title, due_at, is_urgent")
    .eq("circle_id", membership.circle_id)
    .gte("due_at", startUtc)
    .lt("due_at", endUtc)
    .order("due_at", { ascending: true });

  // Two-step member lookup: no FK between circle_member and
  // profile_public means PostgREST won't embed; query separately.
  const { data: memberRows } = await supabase
    .from("circle_member")
    .select("user_id, role, valid_from")
    .eq("circle_id", membership.circle_id)
    .is("valid_to", null)
    .order("valid_from", { ascending: true });

  const memberUserIds = (memberRows ?? []).map((m) => m.user_id);
  const memberProfilesById = new Map<
    string,
    { display_name: string | null; phone_number: string | null }
  >();
  if (memberUserIds.length > 0) {
    const { data: memberProfiles } = await supabase
      .from("profile_public")
      .select("user_id, display_name, phone_number")
      .in("user_id", memberUserIds);
    for (const p of memberProfiles ?? []) {
      memberProfilesById.set(p.user_id, {
        display_name: p.display_name,
        phone_number: p.phone_number,
      });
    }
  }

  const members = (memberRows ?? []).map((m) => {
    const profile = memberProfilesById.get(m.user_id);
    return {
      user_id: m.user_id,
      role: m.role,
      name: profile?.display_name?.trim() || "(okänd)",
      phone: profile?.phone_number ?? null,
    };
  });

  const { renderExportPdf } = await import("@/lib/pdf/export");
  const buffer = await renderExportPdf({
    personName,
    fromStr,
    toStr,
    members,
    updates,
    scheduleItems: scheduleItems ?? [],
    reminders: reminders ?? [],
  });

  const slug = slugify(personName);
  const filename = `tryggkontakt-${slug}-${fromStr}-${toStr}.pdf`;

  // Node Buffer extends Uint8Array but Next's BodyInit type narrows
  // it away. Wrap in a Blob, which BodyInit accepts directly.
  const body = new Blob([new Uint8Array(buffer)], {
    type: "application/pdf",
  });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
