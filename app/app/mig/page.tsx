import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import Toast from "../../_components/toast";
import BottomNav from "../_components/bottom-nav";
import { signOut } from "./actions";

const ROLE_LABEL: Record<string, string> = {
  relative: "Anhörig",
  staff: "Personal",
  coordinator: "Samordnare",
};

type MembershipResult = {
  role: string;
  circle: { person: { display_name: string } | null } | null;
};

export default async function MinSidaPage({
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

  const { data: membershipData } = await supabase
    .from("circle_member")
    .select("role, circle:circle_id(person:person_id(display_name))")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();

  const membership = membershipData as MembershipResult | null;

  if (!membership) {
    redirect("/app");
  }

  const personName = membership.circle?.person?.display_name ?? "(okänd)";
  const roleLabel = ROLE_LABEL[membership.role] ?? membership.role;
  const isRelative = membership.role === "relative";

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header style={{ paddingTop: "env(safe-area-inset-top)" }} className="sticky top-0 bg-bg flex items-center h-14 px-4 max-w-content mx-auto w-full">
        <h1 className="text-h1 text-text">Min sida</h1>
      </header>

      <main className="flex-1 px-4 pb-32 max-w-content mx-auto w-full flex flex-col">
        <section
          aria-labelledby="account-heading"
          className="mt-4 rounded-md bg-surface shadow-soft p-4 flex flex-col gap-2"
        >
          <h2 id="account-heading" className="text-h2 text-text">
            Konto
          </h2>
          <p className="text-body text-text break-all">{user.email}</p>
          <Link
            href="/app/mig/redigera"
            className="text-body text-primary font-medium min-h-tap flex items-center transition-colors duration-quick ease-standard hover:text-primary-hover"
          >
            Redigera mina uppgifter
          </Link>
          <Link
            href="/app/installningar"
            className="text-body text-primary font-medium min-h-tap flex items-center transition-colors duration-quick ease-standard hover:text-primary-hover"
          >
            Inställningar
          </Link>
        </section>

        <section
          aria-labelledby="circle-heading"
          className="mt-6 rounded-md bg-surface shadow-soft p-4 flex flex-col gap-2"
        >
          <h2 id="circle-heading" className="text-h2 text-text">
            Krets
          </h2>
          <p className="text-body text-text">{personName}</p>
          <p className="text-meta text-text-muted">{roleLabel}</p>
          <Link
            href="/app/krets"
            className="text-body text-primary font-medium mt-1 transition-colors duration-quick ease-standard hover:text-primary-hover"
          >
            Hantera krets
          </Link>
          {isRelative && (
            <Link
              href="/app/export"
              className="text-body text-primary font-medium min-h-tap flex items-center transition-colors duration-quick ease-standard hover:text-primary-hover"
            >
              Exportera till PDF
            </Link>
          )}
        </section>

        <form action={signOut} className="mt-12">
          <button
            type="submit"
            className="w-full min-h-button px-6 rounded-lg border border-primary text-primary text-body font-semibold bg-transparent transition-all duration-quick ease-standard hover:bg-primary-soft active:scale-[0.98]"
          >
            Logga ut
          </button>
        </form>
      </main>

      {showToast && <Toast message="Sparat" />}
      <BottomNav active="profile" />
    </div>
  );
}
