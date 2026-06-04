import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { addDaysToDateStr, stockholmDateStr } from "@/lib/stockholm";

import Toast from "../_components/toast";
import BottomNav from "./_components/bottom-nav";

type Slot = "morgon" | "lunch" | "eftermiddag";

const SLOT_DEFS: Array<{
  key: Slot;
  openMin: number;
  label: string;
  addLabel: string;
}> = [
  {
    key: "morgon",
    openMin: 7 * 60 + 30,
    label: "Morgon",
    addLabel: "Lägg till morgonuppdatering",
  },
  {
    key: "lunch",
    openMin: 11 * 60 + 30,
    label: "Lunch",
    addLabel: "Lägg till lunchuppdatering",
  },
  {
    key: "eftermiddag",
    openMin: 15 * 60,
    label: "Eftermiddag",
    addLabel: "Lägg till eftermiddagsuppdatering",
  },
];

const MOOD_INLINE: Record<string, string> = {
  happy: "Glad",
  calm: "Lugn",
  tired: "Trött",
  worried: "Orolig",
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
const MEAL_INLINE: Record<string, string> = {
  ja: "ja",
  nej: "nej",
  lite: "lite",
};
const PERIOD_INLINE: Record<string, string> = {
  bra: "bra",
  okej: "okej",
  tuff: "tuff",
};

const MEAL_PREFIX_BY_SLOT: Record<string, string> = {
  morgon: "Frukost",
  lunch: "Lunch",
  eftermiddag: "Mellanmål",
};

type Row = {
  id: string;
  slot: string;
  mood: string | null;
  sleep: string | null;
  energy: string | null;
  meal_eaten: string | null;
  period_summary: string | null;
  free_text: string;
  created_at: string;
  relatives_only: boolean;
};

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 10) return "God morgon";
  if (h >= 10 && h < 17) return "Hej";
  return "God kväll";
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

function formatHomeReminderTime(d: Date, now: Date): string {
  const time = formatTime(d);
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

function inlineSummary(r: Row): string {
  const parts: string[] = [];
  if (r.mood) parts.push(MOOD_INLINE[r.mood] ?? r.mood);
  if (r.slot === "morgon" && r.sleep) {
    parts.push(`Sov ${SLEEP_INLINE[r.sleep] ?? r.sleep}`);
  }
  if ((r.slot === "lunch" || r.slot === "eftermiddag") && r.period_summary) {
    parts.push(`Period ${PERIOD_INLINE[r.period_summary] ?? r.period_summary}`);
  }
  if (r.meal_eaten) {
    const prefix = MEAL_PREFIX_BY_SLOT[r.slot] ?? "Måltid";
    parts.push(`${prefix} ${MEAL_INLINE[r.meal_eaten] ?? r.meal_eaten}`);
  }
  if (r.energy) parts.push(`Energi ${ENERGY_INLINE[r.energy] ?? r.energy}`);
  return parts.join(" · ");
}

export default async function AppPage({
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
    return (
      <div className="min-h-dvh flex flex-col bg-bg">
        <main className="flex-1 px-4 pt-8 pb-32 max-w-content mx-auto w-full">
          <h1 className="text-h1 text-text">
            Välkommen. Du är inte med i någon krets än.
          </h1>
          <div className="mt-12">
            <Link
              href="/app/krets/ny"
              className="flex items-center justify-center min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-all duration-quick ease-standard hover:bg-primary-hover active:scale-[0.98]"
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

  const now = new Date();
  const todayStr = stockholmDateStr(now);
  const startUtc = new Date(`${todayStr}T00:00:00`).toISOString();
  const endUtc = new Date(
    `${addDaysToDateStr(todayStr, 1)}T00:00:00`,
  ).toISOString();

  const { data: todayRowsData } = await supabase
    .from("daily_update")
    .select(
      "id, slot, mood, sleep, energy, meal_eaten, period_summary, free_text, created_at, relatives_only",
    )
    .eq("circle_id", membership.circle_id)
    .gte("created_at", startUtc)
    .lt("created_at", endUtc)
    .order("created_at", { ascending: true });

  const todayRows = (todayRowsData ?? []) as Row[];

  const slotRows = new Map<Slot, Row>();
  const snabbnoteringar: Row[] = [];
  for (const r of todayRows) {
    if (r.slot === "snabbnotering") snabbnoteringar.push(r);
    else if (
      r.slot === "morgon" ||
      r.slot === "lunch" ||
      r.slot === "eftermiddag"
    ) {
      slotRows.set(r.slot, r);
    }
  }

  const fmtHM = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const [hStr, mStr] = fmtHM.format(now).split(":");
  const minOfDay = Number(hStr) * 60 + Number(mStr);

  const opened = SLOT_DEFS.filter((s) => minOfDay >= s.openMin);
  const latestOpenedIdx = opened.length - 1;
  let latestFilledIdx = -1;
  for (let i = opened.length - 1; i >= 0; i--) {
    if (slotRows.has(opened[i].key)) {
      latestFilledIdx = i;
      break;
    }
  }

  type CardState =
    | { kind: "ifylld"; def: (typeof SLOT_DEFS)[number]; row: Row }
    | { kind: "vantar"; def: (typeof SLOT_DEFS)[number] }
    | { kind: "ej-ifylld"; def: (typeof SLOT_DEFS)[number] }
    | { kind: "hidden" };

  const slotCards: CardState[] = opened.map((def, i) => {
    const row = slotRows.get(def.key);
    if (row) return { kind: "ifylld", def, row };
    if (latestFilledIdx === -1) {
      if (i === latestOpenedIdx) return { kind: "vantar", def };
      return { kind: "ej-ifylld", def };
    }
    if (i > latestFilledIdx) return { kind: "vantar", def };
    return { kind: "hidden" };
  });

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

        <section
          aria-labelledby="slots-heading"
          className="mt-8 flex flex-col gap-3"
        >
          <h2 id="slots-heading" className="sr-only">
            Dagens uppdateringar
          </h2>
          {opened.length === 0 && snabbnoteringar.length === 0 ? (
            <p className="text-body text-text-muted">
              Inga uppdateringar än idag.
            </p>
          ) : null}
          {slotCards.map((c) => {
            if (c.kind === "hidden") return null;
            if (c.kind === "ifylld") {
              return (
                <article
                  key={c.def.key}
                  className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-2"
                >
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <h3 className="text-h2 text-text">{c.def.label}</h3>
                    <p className="text-meta text-text-muted">
                      {formatTime(new Date(c.row.created_at))}
                    </p>
                  </div>
                  {c.row.relatives_only && (
                    <span className="text-caption font-medium px-2 py-1 rounded-pill bg-primary-soft text-primary self-start">
                      Bara anhöriga
                    </span>
                  )}
                  <p className="text-body text-text">{inlineSummary(c.row)}</p>
                  <p className="text-body-lg text-text">{c.row.free_text}</p>
                  <Link
                    href={`/app/uppdatering/ny?slot=${c.def.key}&id=${c.row.id}`}
                    className="text-meta text-primary font-medium self-end transition-colors duration-quick ease-standard hover:text-primary-hover"
                  >
                    Ändra
                  </Link>
                </article>
              );
            }
            if (c.kind === "vantar") {
              return (
                <article
                  key={c.def.key}
                  className="rounded-md bg-surface border border-border p-4 flex flex-col gap-3"
                >
                  <h3 className="text-h2 text-text">{c.def.label}</h3>
                  <Link
                    href={`/app/uppdatering/ny?slot=${c.def.key}`}
                    className="w-full flex items-center justify-center min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-all duration-quick ease-standard hover:bg-primary-hover active:scale-[0.98]"
                  >
                    {c.def.addLabel}
                  </Link>
                </article>
              );
            }
            return (
              <article
                key={c.def.key}
                className="rounded-md bg-surface-sunken p-4 flex flex-col gap-2 opacity-75"
              >
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="text-h2 text-text">{c.def.label}</h3>
                  <span className="text-caption font-medium px-2 py-1 rounded-pill bg-warn-soft text-warn">
                    Ej ifylld
                  </span>
                </div>
                <Link
                  href={`/app/uppdatering/ny?slot=${c.def.key}`}
                  className="text-meta text-primary font-medium self-end transition-colors duration-quick ease-standard hover:text-primary-hover"
                >
                  Lägg till i efterhand
                </Link>
              </article>
            );
          })}
        </section>

        <section
          aria-labelledby="snabb-heading"
          className="mt-8"
        >
          <div className="flex items-baseline justify-between">
            <h2 id="snabb-heading" className="text-h2 text-text">
              Snabbnoteringar
            </h2>
            <Link
              href="/app/snabbnotering/ny"
              className="text-meta text-primary font-medium transition-colors duration-quick ease-standard hover:text-primary-hover"
            >
              + Lägg till anteckning
            </Link>
          </div>
          {snabbnoteringar.length === 0 ? (
            <p className="mt-3 text-body text-text-muted">
              Inga anteckningar idag.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {snabbnoteringar.map((r) => (
                <li
                  key={r.id}
                  className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-1"
                >
                  <p className="text-meta text-text-muted">
                    {formatTime(new Date(r.created_at))}
                  </p>
                  <p className="text-body text-text">{r.free_text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {upcomingReminders.length > 0 && (
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
                  className="w-12 h-12 -my-3 flex items-center justify-center text-primary transition-all duration-quick ease-standard hover:text-primary-hover active:scale-[0.95]"
                >
                  <Plus size={20} strokeWidth={1.75} aria-hidden="true" />
                </Link>
                <Link
                  href="/app/paminnelser"
                  className="text-meta text-primary font-medium transition-colors duration-quick ease-standard hover:text-primary-hover"
                >
                  Se alla
                </Link>
              </div>
            </div>
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
          </section>
        )}
      </main>
      {showToast && <Toast message="Uppdatering sparad" />}
      <BottomNav active="home" />
    </div>
  );
}
