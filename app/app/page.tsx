import Link from "next/link";
import { Calendar, House, User } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 10) return "God morgon";
  if (h >= 10 && h < 17) return "Hej";
  return "God kväll";
}

function BottomNav() {
  return (
    <nav
      aria-label="Huvudnavigering"
      className="fixed inset-x-0 bottom-0 bg-surface border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex h-16 max-w-content mx-auto">
        <li className="flex-1">
          <a
            href="/app"
            aria-current="page"
            className="h-full flex flex-col items-center justify-center gap-1 text-primary font-semibold"
          >
            <House size={28} strokeWidth={1.75} aria-hidden="true" />
            <span className="text-caption">Hem</span>
          </a>
        </li>
        <li className="flex-1">
          <a
            href="/app/schema"
            className="h-full flex flex-col items-center justify-center gap-1 text-text-muted font-medium"
          >
            <Calendar size={28} strokeWidth={1.75} aria-hidden="true" />
            <span className="text-caption">Kalender</span>
          </a>
        </li>
        <li className="flex-1">
          <a
            href="/app/mig"
            className="h-full flex flex-col items-center justify-center gap-1 text-text-muted font-medium"
          >
            <User size={28} strokeWidth={1.75} aria-hidden="true" />
            <span className="text-caption">Min sida</span>
          </a>
        </li>
      </ul>
    </nav>
  );
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
        <BottomNav />
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

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <main className="flex-1 px-4 pt-8 pb-32 max-w-content mx-auto w-full">
        <h1 className="text-display text-text">{greeting}</h1>

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

        <div className="mt-12">
          <button
            type="button"
            className="w-full min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard"
          >
            Lägg till uppdatering
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
