"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { saveName, type State } from "./actions";

const initialState: State = {};

export default function NameForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [state, formAction, pending] = useActionState(saveName, initialState);

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <main className="min-h-dvh flex flex-col px-4 max-w-content mx-auto w-full">
      <div className="flex-1 flex flex-col py-16 gap-8">
        <header>
          <h1 className="text-h1 text-text">Vad heter du?</h1>
          <p className="mt-4 text-body text-text-muted">
            Det här syns för andra i kretsen.
          </p>
        </header>

        <form action={formAction} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="firstName"
              className="text-caption text-text font-medium"
            >
              Förnamn
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="lastName"
              className="text-caption text-text font-medium"
            >
              Efternamn
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
            />
          </div>

          {state.error && (
            <p role="alert" className="text-body text-warn">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || pending}
            className="mt-2 min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {pending ? (
              <Loader2
                size={20}
                strokeWidth={1.75}
                className="animate-spin"
                aria-label="Sparar"
              />
            ) : (
              "Fortsätt"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
