import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { requestInviteSignIn } from "./actions";

const ROLE_LABEL: Record<string, string> = {
  relative: "anhörig",
  staff: "personal",
  coordinator: "samordnare",
};

const ACCEPT_ERROR_COPY: Record<string, string> = {
  invite_not_found: "Inbjudan kunde inte hittas.",
  invite_expired: "Den här inbjudan har gått ut.",
  email_mismatch:
    "Du måste logga in med samma e-postadress som inbjudan skickades till.",
  already_member: "Du är redan medlem i den här kretsen.",
  user_not_found: "Inloggningen kunde inte verifieras.",
};

type Invite = {
  id: string;
  circle_id: string;
  invited_email: string;
  role: string;
  status: string;
  expires_at: string;
  invited_by_user_id: string;
};

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ accept?: string; sent?: string; error?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const admin = createAdminClient();

  const { data: inviteData } = await admin
    .from("circle_invite")
    .select(
      "id, circle_id, invited_email, role, status, expires_at, invited_by_user_id",
    )
    .eq("token", token)
    .maybeSingle();
  const invite = inviteData as Invite | null;

  // Server component renders once per request; Date.now is the
  // wall-clock cutoff the UI needs to render the expired vs. pending
  // branch.
  const expired =
    // eslint-disable-next-line react-hooks/purity
    !!invite && new Date(invite.expires_at).getTime() < Date.now();
  const isPending = !!invite && invite.status === "pending" && !expired;

  let personName = "kretsen";
  let inviterFirstName = "Någon";
  if (invite) {
    const { data: circleRow } = await admin
      .from("circle")
      .select("person:person_id(display_name)")
      .eq("id", invite.circle_id)
      .maybeSingle();
    personName =
      (circleRow as { person?: { display_name?: string } } | null)?.person
        ?.display_name ?? personName;

    const { data: inviterProfile } = await admin
      .from("profile_public")
      .select("display_name")
      .eq("user_id", invite.invited_by_user_id)
      .maybeSingle();
    inviterFirstName =
      inviterProfile?.display_name?.split(" ")[0] ?? inviterFirstName;
  }

  let acceptError: string | null = null;
  if (sp.accept === "1") {
    if (!invite) {
      acceptError = ACCEPT_ERROR_COPY.invite_not_found;
    } else if (expired) {
      acceptError = ACCEPT_ERROR_COPY.invite_expired;
    } else {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        redirect(`/inbjudan/${token}`);
      }
      const { error } = await admin.rpc("accept_invite", {
        p_token: token,
        p_user_id: user.id,
      });
      if (!error) {
        redirect("/onboarding/namn");
      }
      acceptError =
        ACCEPT_ERROR_COPY[error.message] ??
        "Det gick inte att acceptera inbjudan just nu.";
    }
  }

  return (
    <main className="min-h-dvh flex flex-col px-4 max-w-content mx-auto w-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-16">
        {!invite ? (
          <header className="text-center">
            <h1 className="text-h1 text-text">
              {ACCEPT_ERROR_COPY.invite_not_found}
            </h1>
            <p className="mt-4 text-body text-text-muted">
              Kontrollera länken eller be om en ny inbjudan.
            </p>
          </header>
        ) : expired ? (
          <header className="text-center">
            <h1 className="text-h1 text-text">
              {ACCEPT_ERROR_COPY.invite_expired}
            </h1>
            <p className="mt-4 text-body text-text-muted">
              Be om en ny inbjudan från {inviterFirstName}.
            </p>
          </header>
        ) : (
          <>
            <header className="text-center">
              <h1 className="text-h1 text-text">
                Du är inbjuden till {personName}s krets
              </h1>
              <p className="mt-4 text-body text-text-muted">
                {inviterFirstName} vill att du går med som{" "}
                {ROLE_LABEL[invite.role] ?? invite.role}.
              </p>
            </header>

            <form
              action={requestInviteSignIn}
              className="w-full max-w-sm flex flex-col gap-6"
            >
              <input type="hidden" name="token" value={token} />
              <input
                type="hidden"
                name="email"
                value={invite.invited_email}
              />

              <p className="text-body text-text-muted">
                Logga in med {invite.invited_email} för att acceptera.
              </p>

              {sp.sent && (
                <p role="status" className="text-body text-text">
                  Vi har skickat en länk till din e-post.
                </p>
              )}
              {sp.error === "otp" && (
                <p role="alert" className="text-body text-warn">
                  Det gick inte att skicka länken. Försök igen.
                </p>
              )}
              {acceptError && (
                <p role="alert" className="text-body text-warn">
                  {acceptError}
                </p>
              )}

              <button
                type="submit"
                disabled={!isPending}
                className="min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Skicka inloggningslänk
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
