import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { addDaysToDateStr, stockholmDateStr } from "@/lib/stockholm";

export default async function ExportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: membership } = await supabase
    .from("circle_member")
    .select("circle_id, role")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();
  if (!membership) {
    redirect("/app");
  }
  if (membership.role !== "relative") {
    redirect("/app/mig");
  }

  const today = stockholmDateStr(new Date());
  const fromDefault = addDaysToDateStr(today, -7);

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 bg-bg flex items-center h-14 px-4 max-w-content mx-auto w-full gap-3">
        <Link
          href="/app/mig"
          aria-label="Tillbaka"
          className="w-12 h-12 -ml-3 flex items-center justify-center text-text transition-all duration-quick ease-standard hover:text-text-muted active:scale-[0.95]"
        >
          <ArrowLeft size={24} strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <h1 className="text-h1 text-text">Exportera till PDF</h1>
      </header>

      <main className="flex-1 px-4 pb-12 max-w-content mx-auto w-full flex flex-col gap-6">
        <p className="text-body text-text">
          Skapa en sammanfattning av kretsens uppdateringar, aktiviteter
          och påminnelser för valt datumintervall. Ladda ner som PDF för
          att ta med till läkarbesök.
        </p>

        <form
          method="POST"
          action="/api/export/pdf"
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="from"
              className="text-caption text-text font-medium"
            >
              Från
            </label>
            <input
              id="from"
              name="from"
              type="date"
              required
              defaultValue={fromDefault}
              className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="to" className="text-caption text-text font-medium">
              Till
            </label>
            <input
              id="to"
              name="to"
              type="date"
              required
              defaultValue={today}
              className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-all duration-quick ease-standard hover:bg-primary-hover active:scale-[0.98]"
          >
            Generera PDF
          </button>
        </form>
      </main>
    </div>
  );
}
