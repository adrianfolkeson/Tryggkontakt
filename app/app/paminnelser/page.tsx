import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  addDaysToDateStr,
  stockholmDateStr,
} from "@/lib/stockholm";

import Toast from "../../_components/toast";
import BottomNav from "../_components/bottom-nav";

type Reminder = {
  id: string;
  title: string;
  due_at: string;
  is_urgent: boolean;
};

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

function formatWeekday(d: Date): string {
  const s = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    weekday: "long",
  }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatLaterDate(d: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
  }).format(d);
}

export default async function PaminnelserPage({
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

  const now = new Date();
  const { data: itemsData } = await supabase
    .from("reminder")
    .select("id, title, due_at, is_urgent")
    .eq("circle_id", membership.circle_id)
    .gte("due_at", now.toISOString())
    .order("due_at", { ascending: true });

  const reminders = (itemsData ?? []) as Reminder[];

  const todayStr = stockholmDateStr(now);
  const weekEndStr = addDaysToDateStr(todayStr, 7);

  const groups: Record<"today" | "week" | "later", Reminder[]> = {
    today: [],
    week: [],
    later: [],
  };
  for (const r of reminders) {
    const due = new Date(r.due_at);
    const dueStr = stockholmDateStr(due);
    if (dueStr === todayStr) groups.today.push(r);
    else if (dueStr < weekEndStr) groups.week.push(r);
    else groups.later.push(r);
  }

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 bg-bg flex items-center justify-between h-14 px-4 max-w-content mx-auto w-full">
        <h1 className="text-h1 text-text">Påminnelser</h1>
        <Link
          href="/app/paminnelser/ny"
          aria-label="Lägg till påminnelse"
          className="w-12 h-12 -mr-3 flex items-center justify-center text-primary"
        >
          <Plus size={24} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </header>

      <main className="flex-1 px-4 pb-32 max-w-content mx-auto w-full">
        {reminders.length === 0 ? (
          <p className="mt-8 text-body text-text-muted">
            Inga påminnelser just nu.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-8">
            {groups.today.length > 0 && (
              <Section title="Idag">
                {groups.today.map((r) => (
                  <ReminderItem
                    key={r.id}
                    leading={formatTime(new Date(r.due_at))}
                    title={r.title}
                    isUrgent={r.is_urgent}
                  />
                ))}
              </Section>
            )}
            {groups.week.length > 0 && (
              <Section title="Den här veckan">
                {groups.week.map((r) => (
                  <ReminderItem
                    key={r.id}
                    leading={`${formatWeekday(new Date(r.due_at))} ${formatTime(new Date(r.due_at))}`}
                    title={r.title}
                    isUrgent={r.is_urgent}
                  />
                ))}
              </Section>
            )}
            {groups.later.length > 0 && (
              <Section title="Senare">
                {groups.later.map((r) => (
                  <ReminderItem
                    key={r.id}
                    leading={`${formatLaterDate(new Date(r.due_at))} ${formatTime(new Date(r.due_at))}`}
                    title={r.title}
                    isUrgent={r.is_urgent}
                  />
                ))}
              </Section>
            )}
          </div>
        )}
      </main>

      {showToast && <Toast message="Påminnelse sparad" />}
      <BottomNav />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title}>
      <h2 className="sticky top-14 bg-bg py-2 text-h2 text-text">{title}</h2>
      <ul className="mt-3 flex flex-col gap-3">{children}</ul>
    </section>
  );
}

function ReminderItem({
  leading,
  title,
  isUrgent,
}: {
  leading: string;
  title: string;
  isUrgent: boolean;
}) {
  return (
    <li className="rounded-md bg-surface shadow-soft p-4 flex items-baseline gap-3">
      <span className="text-meta text-text-muted tabular-nums shrink-0">
        {leading}
      </span>
      <span className="text-body text-text font-semibold flex-1">{title}</span>
      {isUrgent && (
        <span className="text-caption font-medium px-2 py-1 rounded-pill bg-warn-soft text-warn shrink-0">
          Akut
        </span>
      )}
    </li>
  );
}
