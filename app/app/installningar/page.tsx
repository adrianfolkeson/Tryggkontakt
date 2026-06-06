import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import Toast from "../../_components/toast";
import BottomNav from "../_components/bottom-nav";
import DeleteAccountModal from "./_components/delete-account-modal";
import TextSizeSection from "./_components/text-size-section";
import VisibilitySection from "./_components/visibility-section";

export default async function InstallningarPage({
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

  const { data: profile } = await supabase
    .from("profile_public")
    .select("default_relatives_only, text_size")
    .eq("user_id", user.id)
    .maybeSingle();

  const defaultRelativesOnly = profile?.default_relatives_only ?? false;
  const textSize = profile?.text_size ?? "medium";

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        className="sticky top-0 bg-bg flex items-center h-14 px-4 max-w-content mx-auto w-full"
      >
        <h1 className="text-h1 text-text">Inställningar</h1>
      </header>

      <main className="flex-1 px-4 pb-32 max-w-content mx-auto w-full flex flex-col gap-6">
        <section
          aria-labelledby="visibility-heading"
          className="mt-4 rounded-md bg-surface shadow-soft p-4 flex flex-col gap-3"
        >
          <h2 id="visibility-heading" className="text-h2 text-text">
            Standard för nya uppdateringar
          </h2>
          <p className="text-meta text-text-muted">
            Du kan ändra för varje enskild uppdatering.
          </p>
          <VisibilitySection initial={defaultRelativesOnly} />
        </section>

        <section
          aria-labelledby="text-size-heading"
          className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-3"
        >
          <h2 id="text-size-heading" className="text-h2 text-text">
            Textstorlek
          </h2>
          <p className="text-meta text-text-muted">
            Större text kan göra det enklare att läsa.
          </p>
          <TextSizeSection initial={textSize} />
        </section>

        <section
          aria-labelledby="notif-heading"
          className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-2"
        >
          <h2 id="notif-heading" className="text-h2 text-text">
            Aviseringar
          </h2>
          <p className="text-body text-text-muted">
            Push-notiser och e-postpåminnelser kommer i en kommande
            version. Idag skickas inga automatiska påminnelser från
            TryggKontakt.
          </p>
        </section>

        <section
          aria-labelledby="data-heading"
          className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-3"
        >
          <h2 id="data-heading" className="text-h2 text-text">
            Datavård
          </h2>
          <form action="/api/export/all-data" method="post">
            <button
              type="submit"
              className="w-full min-h-button px-6 rounded-lg border border-primary text-primary text-body font-semibold bg-transparent transition-all duration-quick ease-standard hover:bg-primary-soft active:scale-[0.98]"
            >
              Exportera all min data
            </button>
          </form>
          <DeleteAccountModal />
        </section>

        <section
          aria-labelledby="about-heading"
          className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-3"
        >
          <h2 id="about-heading" className="text-h2 text-text">
            Om TryggKontakt
          </h2>
          <Link
            href="/integritet"
            className="text-body text-primary font-medium min-h-tap flex items-center transition-colors duration-quick ease-standard hover:text-primary-hover"
          >
            Integritetspolicy
          </Link>
          <Link
            href="/villkor"
            className="text-body text-primary font-medium min-h-tap flex items-center transition-colors duration-quick ease-standard hover:text-primary-hover"
          >
            Användarvillkor
          </Link>
          <p className="text-meta text-text-subtle">
            Version 0.1 (juni 2026)
          </p>
        </section>
      </main>

      {showToast && <Toast message="Sparat" />}
      <BottomNav active="profile" />
    </div>
  );
}
