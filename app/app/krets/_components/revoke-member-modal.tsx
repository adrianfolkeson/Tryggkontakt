"use client";

import { useActionState, useState } from "react";

import { revokeMember, type RevokeState } from "../actions";

const initialState: RevokeState = {};

export default function RevokeMemberModal({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    revokeMember,
    initialState,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start min-h-tap inline-flex items-center px-2 -mx-2 text-meta text-danger font-medium transition-colors duration-quick ease-standard hover:text-warn"
      >
        Avsluta medlemskap
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`revoke-heading-${memberId}`}
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center px-4"
          style={{
            paddingTop: "max(env(safe-area-inset-top), 1rem)",
            paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
          }}
        >
          <form
            action={formAction}
            className="bg-surface rounded-md shadow-soft p-4 w-full max-w-content flex flex-col gap-4"
          >
            <h2
              id={`revoke-heading-${memberId}`}
              className="text-h2 text-text"
            >
              Avsluta medlemskap
            </h2>
            <p className="text-body text-text">
              Är du säker på att <strong>{memberName}</strong> ska avslutas?
              De tappar omedelbart åtkomst till kretsen. Deras tidigare
              uppdateringar finns kvar.
            </p>

            <input type="hidden" name="memberId" value={memberId} />

            {state.error === "blocked" && (
              <p role="alert" className="text-body text-warn">
                Du har inte rättighet att avsluta denna medlem.
              </p>
            )}
            {state.error === "save" && (
              <p role="alert" className="text-body text-warn">
                Det gick inte att avsluta. Försök igen om en stund.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="min-h-button px-4 rounded-lg border border-border text-body text-text bg-transparent transition-colors duration-quick ease-standard hover:bg-surface-sunken disabled:opacity-60"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={pending}
                className="min-h-button px-4 rounded-lg bg-danger text-primary-text text-body font-semibold transition-all duration-quick ease-standard active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? "Avslutar…" : "Avsluta"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
