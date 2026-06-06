"use client";

import { useActionState, useState } from "react";

import { deleteAccount, type DeleteState } from "../actions";

const initialState: DeleteState = {};

export default function DeleteAccountModal() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [state, formAction, pending] = useActionState(
    deleteAccount,
    initialState,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-button px-6 rounded-lg border border-danger text-danger text-body font-semibold bg-transparent transition-all duration-quick ease-standard hover:bg-warn-soft active:scale-[0.98]"
      >
        Ta bort mitt konto
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-heading"
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center px-4"
          style={{
            paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
            paddingTop: "max(env(safe-area-inset-top), 1rem)",
          }}
        >
          <form
            action={formAction}
            className="bg-surface rounded-md shadow-soft p-4 w-full max-w-content flex flex-col gap-4"
          >
            <h2 id="delete-heading" className="text-h2 text-text">
              Ta bort mitt konto
            </h2>
            <p className="text-body text-text">
              Detta tar bort ditt konto, alla uppdateringar du skrivit,
              och din plats i kretsen. Detta kan inte ångras.
            </p>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmation"
                className="text-caption text-text font-medium"
              >
                Skriv <span className="font-semibold">TA BORT</span> för
                att bekräfta
              </label>
              <input
                id="confirmation"
                name="confirmation"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
              />
            </div>

            {state.error === "confirm" && (
              <p role="alert" className="text-body text-warn">
                Bekräftelsetexten matchar inte.
              </p>
            )}
            {state.error === "delete" && (
              <p role="alert" className="text-body text-warn">
                Det gick inte att ta bort kontot. Försök igen om en stund.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirmation("");
                }}
                disabled={pending}
                className="min-h-button px-4 rounded-lg border border-border text-body text-text bg-transparent transition-colors duration-quick ease-standard hover:bg-surface-sunken disabled:opacity-60"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={confirmation !== "TA BORT" || pending}
                className="min-h-button px-4 rounded-lg bg-danger text-primary-text text-body font-semibold transition-all duration-quick ease-standard active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? "Tar bort…" : "Ta bort"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
