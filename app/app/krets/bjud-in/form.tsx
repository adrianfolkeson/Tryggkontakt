"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { createInvite, type State } from "./actions";

const initialState: State = {};

export default function BjudInForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("relative");

  const [state, formAction, pending] = useActionState(
    createInvite,
    initialState,
  );

  const canSubmit = email.trim().length > 0;

  return (
    <form action={formAction} className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 bg-bg flex items-center justify-between h-14 px-4 max-w-content mx-auto w-full">
        <Link
          href="/app/krets"
          aria-label="Tillbaka"
          className="w-12 h-12 -ml-3 flex items-center justify-center text-text"
        >
          <ArrowLeft size={24} strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <button
          type="submit"
          disabled={!canSubmit || pending}
          className="min-h-tap px-4 text-primary text-body font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {pending ? (
            <Loader2
              size={20}
              strokeWidth={1.75}
              className="animate-spin"
              aria-label="Sparar"
            />
          ) : (
            "Spara"
          )}
        </button>
      </header>

      <main className="flex-1 px-4 pb-12 max-w-content mx-auto w-full flex flex-col gap-6">
        <h1 className="text-h1 text-text">Bjud in person</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-caption text-text font-medium">
            E-postadress
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="role" className="text-caption text-text font-medium">
            Roll
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
          >
            <option value="relative">Anhörig</option>
            <option value="staff">Personal</option>
            <option value="coordinator">Samordnare</option>
          </select>
        </div>

        {state.error && (
          <p role="alert" className="text-body text-warn">
            {state.error}
          </p>
        )}
      </main>
    </form>
  );
}
