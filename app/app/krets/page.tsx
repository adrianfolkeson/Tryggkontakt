import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import Toast from "../../_components/toast";
import BottomNav from "../_components/bottom-nav";
import CopyLinkBanner from "./_components/copy-link-banner";

const ROLE_LABEL: Record<string, string> = {
  relative: "Anhörig",
  staff: "Personal",
  coordinator: "Samordnare",
};

type MemberRow = {
  user_id: string;
  role: string;
  profile_public: {
    display_name: string;
    phone_number: string | null;
  } | null;
  profile_contact: { email: string | null } | null;
};

type InviteRow = {
  id: string;
  invited_email: string;
  role: string;
  expires_at: string;
};

export default async function KretsPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; sparat?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: ownMembership } = await supabase
    .from("circle_member")
    .select("circle_id, role")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();

  if (!ownMembership) {
    redirect("/app");
  }

  const isRelative = ownMembership.role === "relative";

  const { data: circleRow } = await supabase
    .from("circle")
    .select("person:person_id(display_name)")
    .eq("id", ownMembership.circle_id)
    .maybeSingle();
  const personName =
    (circleRow as { person?: { display_name?: string } } | null)?.person
      ?.display_name ?? "";

  // No FK between circle_member and profile_public / profile_contact
  // (both reference auth.users), so PostgREST embeds don't resolve.
  // Two-step lookup: members, then matching profile rows by user_id.
  const { data: memberRowsData } = await supabase
    .from("circle_member")
    .select("user_id, role, valid_from")
    .eq("circle_id", ownMembership.circle_id)
    .is("valid_to", null)
    .order("valid_from", { ascending: true });

  const memberRows = memberRowsData ?? [];
  const memberUserIds = memberRows.map((m) => m.user_id);

  const profilesById = new Map<
    string,
    { display_name: string; phone_number: string | null }
  >();
  const contactsById = new Map<string, { email: string | null }>();
  if (memberUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profile_public")
      .select("user_id, display_name, phone_number")
      .in("user_id", memberUserIds);
    for (const p of profiles ?? []) {
      profilesById.set(p.user_id, {
        display_name: p.display_name,
        phone_number: p.phone_number,
      });
    }
    const { data: contacts } = await supabase
      .from("profile_contact")
      .select("user_id, email")
      .in("user_id", memberUserIds);
    for (const c of contacts ?? []) {
      contactsById.set(c.user_id, { email: c.email });
    }
  }

  const members: MemberRow[] = memberRows.map((m) => ({
    user_id: m.user_id,
    role: m.role,
    profile_public: profilesById.get(m.user_id) ?? null,
    profile_contact: contactsById.get(m.user_id) ?? null,
  }));

  let invites: InviteRow[] = [];
  if (isRelative) {
    const { data: invitesData } = await supabase
      .from("circle_invite")
      .select("id, invited_email, role, expires_at")
      .eq("circle_id", ownMembership.circle_id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    invites = (invitesData ?? []) as InviteRow[];
  }

  const sp = await searchParams;
  const justInvitedToken = sp.invited;
  const showToast = sp.sparat === "1";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryggkontakt.vercel.app";
  const justInvitedUrl =
    justInvitedToken && isRelative
      ? `${siteUrl}/inbjudan/${justInvitedToken}`
      : null;

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 bg-bg flex items-center h-14 px-4 max-w-content mx-auto w-full">
        <h1 className="text-h1 text-text">Krets</h1>
      </header>

      <main className="flex-1 px-4 pb-32 max-w-content mx-auto w-full flex flex-col gap-6">
        {personName && (
          <p className="text-body text-text-muted">{personName}</p>
        )}

        {justInvitedUrl && <CopyLinkBanner link={justInvitedUrl} />}

        <section
          aria-labelledby="members-heading"
          className="flex flex-col gap-3"
        >
          <h2 id="members-heading" className="text-h2 text-text">
            Medlemmar
          </h2>
          <ul className="flex flex-col gap-2">
            {members.map((m) => {
              const name =
                m.profile_public?.display_name?.trim() ||
                m.profile_contact?.email ||
                "(okänd)";
              const isSelf = m.user_id === user.id;
              return (
                <li
                  key={m.user_id}
                  className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-1"
                >
                  <p className="text-body text-text">
                    {name}
                    {isSelf && (
                      <span className="text-text-muted"> (du)</span>
                    )}
                  </p>
                  <p className="text-meta text-text-muted">
                    {ROLE_LABEL[m.role] ?? m.role}
                  </p>
                  {m.profile_public?.phone_number && (
                    <p className="text-meta text-text-muted">
                      <a
                        href={`tel:${m.profile_public.phone_number}`}
                        className="text-primary"
                      >
                        {m.profile_public.phone_number}
                      </a>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {isRelative && (
          <section
            aria-labelledby="invites-heading"
            className="flex flex-col gap-3"
          >
            <h2 id="invites-heading" className="text-h2 text-text">
              Inbjudningar
            </h2>
            {invites.length === 0 ? (
              <p className="text-body text-text-muted">
                Inga väntande inbjudningar.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {invites.map((inv) => {
                  const expires = new Intl.DateTimeFormat("sv-SE", {
                    timeZone: "Europe/Stockholm",
                    day: "numeric",
                    month: "long",
                  }).format(new Date(inv.expires_at));
                  return (
                    <li
                      key={inv.id}
                      className="rounded-md bg-surface shadow-soft p-4 flex flex-col gap-1"
                    >
                      <p className="text-body text-text break-all">
                        {inv.invited_email}
                      </p>
                      <p className="text-meta text-text-muted">
                        {ROLE_LABEL[inv.role] ?? inv.role}
                        {" · Går ut "}
                        {expires}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {isRelative && (
          <div className="mt-4">
            <Link
              href="/app/krets/bjud-in"
              className="w-full flex items-center justify-center min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-all duration-quick ease-standard hover:bg-primary-hover active:scale-[0.98]"
            >
              Bjud in person
            </Link>
          </div>
        )}
      </main>

      {showToast && <Toast message="Inbjudan skapad" />}
      <BottomNav active="profile" />
    </div>
  );
}
