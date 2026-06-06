import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { addDaysToDateStr, stockholmDateStr } from "@/lib/stockholm";

import ExportForm from "./form";

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
      <header style={{ paddingTop: "env(safe-area-inset-top)" }} className="sticky top-0 bg-bg flex items-center h-14 px-4 max-w-content mx-auto w-full gap-3">
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

        <ExportForm fromDefault={fromDefault} today={today} />
      </main>
    </div>
  );
}
