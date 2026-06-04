import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  addDaysToDateStr,
  parseStockholmDateTime,
  stockholmDateStr,
  stockholmWeekdayShort,
} from "@/lib/stockholm";

import Toast from "../../_components/toast";
import BottomNav from "../_components/bottom-nav";

type ScheduleItem = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  notes: string | null;
};

const WEEKDAY_OFFSET: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function formatDayHeader(d: Date): string {
  const s = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

export default async function SchemaPage({
  searchParams,
}: {
  searchParams: Promise<{ sparat?: string }>;
}) {
  const sp = await searchParams;
  const showToast = sp.sparat === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: membership } = await supabase
    .from("circle_member")
    .select("circle_id")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/app");
  }

  // DST-safe week math: walk via date strings, re-parse each midnight
  // through parseStockholmDateTime so each boundary picks up its own
  // Stockholm UTC offset.
  const now = new Date();
  const todayStr = stockholmDateStr(now);
  const dayOffset = WEEKDAY_OFFSET[stockholmWeekdayShort(now)] ?? 0;
  const mondayStr = addDaysToDateStr(todayStr, -dayOffset);
  const nextMondayStr = addDaysToDateStr(mondayStr, 7);
  const weekStart = parseStockholmDateTime(`${mondayStr}T00:00`);
  const weekEnd = parseStockholmDateTime(`${nextMondayStr}T00:00`);

  const { data: itemsData } = await supabase
    .from("schedule_item")
    .select("id, title, starts_at, ends_at, notes")
    .eq("circle_id", membership.circle_id)
    .gte("starts_at", weekStart.toISOString())
    .lt("starts_at", weekEnd.toISOString())
    .order("starts_at", { ascending: true });

  const items = (itemsData ?? []) as ScheduleItem[];
  const byDay = new Map<string, { headerDate: Date; items: ScheduleItem[] }>();
  for (const item of items) {
    const startDate = new Date(item.starts_at);
    const dayKey = stockholmDateStr(startDate);
    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, { headerDate: startDate, items: [] });
    }
    byDay.get(dayKey)!.items.push(item);
  }

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 bg-bg flex items-center justify-between h-14 px-4 max-w-content mx-auto w-full">
        <h1 className="text-h1 text-text">Kalender</h1>
        <Link
          href="/app/schema/ny"
          aria-label="Lägg till aktivitet"
          className="w-12 h-12 -mr-3 flex items-center justify-center text-primary transition-all duration-quick ease-standard hover:text-primary-hover active:scale-[0.95]"
        >
          <Plus size={24} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </header>

      <main className="flex-1 px-4 pb-32 max-w-content mx-auto w-full">
        {byDay.size === 0 ? (
          <p className="mt-8 text-body text-text-muted">
            Inga aktiviteter den här veckan.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-8">
            {Array.from(byDay.entries()).map(([key, { headerDate, items }]) => (
              <section key={key} aria-label={formatDayHeader(headerDate)}>
                <h2 className="sticky top-14 bg-bg py-2 text-h2 text-text">
                  {formatDayHeader(headerDate)}
                </h2>
                <ul className="mt-3 flex flex-col gap-3">
                  {items.map((it) => (
                    <li
                      key={it.id}
                      className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="text-meta text-text-muted tabular-nums">
                          {formatTime(new Date(it.starts_at))}
                        </span>
                        <span className="text-body text-text font-semibold">
                          {it.title}
                        </span>
                      </div>
                      {it.notes ? (
                        <p className="text-body text-text-muted">{it.notes}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      {showToast && <Toast message="Aktivitet sparad" />}
      <BottomNav active="calendar" />
    </div>
  );
}
