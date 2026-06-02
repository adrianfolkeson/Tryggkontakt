import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { addDaysToDateStr, stockholmDateStr } from "@/lib/stockholm";

import BottomNav from "./_components/bottom-nav";

const MOOD_INLINE: Record<string, { emoji: string; label: string }> = {
  happy: { emoji: "😌", label: "glad" },
  calm: { emoji: "🙂", label: "lugn" },
  tired: { emoji: "😐", label: "trött" },
  worried: { emoji: "😣", label: "orolig" },
};
const SLEEP_INLINE: Record<string, string> = {
  good: "bra",
  okay: "okej",
  poor: "dålig",
};
const ENERGY_INLINE: Record<string, string> = {
  high: "hög",
  medium: "medel",
  low: "låg",
};

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 10) return "God morgon";
  if (h >= 10 && h < 17) return "Hej";
  return "God kväll";
}

function formatUpdateTime(d: Date, now: Date): string {
  const stamp = new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
    hour12: false,
  }).format(d);

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfYesterday = startOfToday.getTime() - dayMs;
  const startOfWeek = startOfToday.getTime() - 6 * dayMs;

  const dStart = new Date(d);
  dStart.setHours(0, 0, 0, 0);
  const dMs = dStart.getTime();

  if (dMs === startOfToday.getTime()) return `idag ${stamp}`;
  if (dMs === startOfYesterday) return `igår ${stamp}`;
  if (dMs >= startOfWeek) {
    const weekday = new Intl.DateTimeFormat("sv-SE", {
      weekday: "long",
      timeZone: "Europe/Stockholm",
    }).format(d);
    return `${weekday} ${stamp}`;
  }
  const datePart = new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Stockholm",
  }).format(d);
  return `${datePart} ${stamp}`;
}

function formatHomeReminderTime(d: Date, now: Date): string {
  const time = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);

  const todayStr = stockholmDateStr(now);
  const dueStr = stockholmDateStr(d);
  if (dueStr === todayStr) return `Idag ${time}`;

  const weekEndStr = addDaysToDateStr(todayStr, 7);
  if (dueStr < weekEndStr) {
    const wd = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      weekday: "short",
    }).format(d);
    return `${wd.charAt(0).toUpperCase()}${wd.slice(1)} ${time}`;
  }

  const date = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "short",
  }).format(d);
  return `${date} ${time}`;
}

export default async function AppPage() {
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
    return (
      <div className="min-h-dvh flex flex-col bg-bg">
        <main className="flex-1 px-4 pt-8 pb-32 max-w-content mx-auto w-full">
          <h1 className="text-h1 text-text">
            Välkommen. Du är inte med i någon krets än.
          </h1>
          <div className="mt-12">
            <Link
              href="/app/krets/ny"
              className="flex items-center justify-center min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard"
            >
              Skapa en krets
            </Link>
          </div>
        </main>
        <BottomNav active="home" />
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profile_public")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const firstName = profile?.display_name?.split(" ")[0] ?? "";
  const greeting = firstName
    ? `${greetingFor(new Date())}, ${firstName}`
    : greetingFor(new Date());

  const { data: latest } = await supabase
    .from("daily_update")
    .select(
      "id, mood, sleep, energy, free_text, created_at, author_user_id, relatives_only",
    )
    .eq("circle_id", membership.circle_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let authorFirstName: string | null = null;
  if (latest) {
    const { data: authorProfile } = await supabase
      .from("profile_public")
      .select("display_name")
      .eq("user_id", latest.author_user_id)
      .maybeSingle();
    authorFirstName = authorProfile?.display_name?.split(" ")[0] ?? null;
  }

  const { data: upcomingRemindersData } = await supabase
    .from("reminder")
    .select("id, title, due_at, is_urgent")
    .eq("circle_id", membership.circle_id)
    .gte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(3);

  const upcomingReminders = upcomingRemindersData ?? [];

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <main className="flex-1 px-4 pt-8 pb-32 max-w-content mx-auto w-full">
        <h1 className="text-display text-text">{greeting}</h1>

        {latest ? (
          <section
            aria-labelledby="latest-update-title"
            className="mt-8 rounded-md bg-surface shadow-soft p-4 flex flex-col gap-3"
          >
            <div>
              <h2 id="latest-update-title" className="text-h2 text-text">
                Senaste från {authorFirstName ?? "någon"}
              </h2>
              <div className="mt-1 flex items-baseline gap-3 flex-wrap">
                <p className="text-meta text-text-muted">
                  {formatUpdateTime(new Date(latest.created_at), new Date())}
                </p>
                {latest.relatives_only && (
                  <span className="text-caption font-medium px-2 py-1 rounded-pill bg-primary-soft text-primary">
                    Bara anhöriga
                  </span>
                )}
              </div>
            </div>
            <p className="text-body text-text">
              <span aria-hidden="true">
                {MOOD_INLINE[latest.mood]?.emoji}
              </span>{" "}
              {MOOD_INLINE[latest.mood]?.label}{" "}
              <span aria-hidden="true">·</span> Sömn{" "}
              {SLEEP_INLINE[latest.sleep]}{" "}
              <span aria-hidden="true">·</span> Energi{" "}
              {ENERGY_INLINE[latest.energy]}
            </p>
            <p className="text-body-lg text-text">{latest.free_text}</p>
          </section>
        ) : (
          <section
            aria-labelledby="updates-heading"
            className="mt-8 rounded-md bg-surface shadow-soft p-4"
          >
            <h2 id="updates-heading" className="sr-only">
              Senaste uppdatering
            </h2>
            <p className="text-body text-text-muted">
              Inga uppdateringar än idag.
            </p>
          </section>
        )}

        <section
          aria-labelledby="reminders-heading"
          className="mt-8"
        >
          <div className="flex items-baseline justify-between">
            <h2 id="reminders-heading" className="text-h2 text-text">
              Påminnelser
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href="/app/paminnelser/ny"
                aria-label="Lägg till påminnelse"
                className="w-12 h-12 -my-3 flex items-center justify-center text-primary"
              >
                <Plus size={20} strokeWidth={1.75} aria-hidden="true" />
              </Link>
              {upcomingReminders.length > 0 && (
                <Link
                  href="/app/paminnelser"
                  className="text-meta text-primary font-medium"
                >
                  Se alla
                </Link>
              )}
            </div>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className="mt-3 text-body text-text-muted">
              Inga påminnelser just nu.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {upcomingReminders.map((r) => (
                <li key={r.id}>
                  <Link
                    href="/app/paminnelser"
                    className="flex items-baseline gap-3 rounded-md bg-surface shadow-soft p-4"
                  >
                    <span className="text-meta text-text-muted tabular-nums shrink-0">
                      {formatHomeReminderTime(new Date(r.due_at), new Date())}
                    </span>
                    <span className="text-body text-text font-semibold flex-1">
                      {r.title}
                    </span>
                    {r.is_urgent && (
                      <span className="text-caption font-medium px-2 py-1 rounded-pill bg-warn-soft text-warn shrink-0">
                        Akut
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-12">
          <Link
            href="/app/uppdatering/ny"
            className="w-full flex items-center justify-center min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard"
          >
            Lägg till uppdatering
          </Link>
        </div>
      </main>
      <BottomNav active="home" />
    </div>
  );
}
