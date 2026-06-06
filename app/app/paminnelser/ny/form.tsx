"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { createReminder, type State } from "./actions";

const initialState: State = {};

export default function NyReminderForm() {
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const [state, formAction, pending] = useActionState(
    createReminder,
    initialState,
  );

  const canSubmit = title.trim().length > 0 && dueAt.length > 0;

  return (
    <form action={formAction} className="min-h-dvh flex flex-col bg-bg">
      <header style={{ paddingTop: "env(safe-area-inset-top)" }} className="sticky top-0 bg-bg flex items-center justify-between h-14 px-4 max-w-content mx-auto w-full">
        <Link
          href="/app/paminnelser"
          aria-label="Tillbaka"
          className="w-12 h-12 -ml-3 flex items-center justify-center text-text transition-all duration-quick ease-standard hover:text-text-muted active:scale-[0.95]"
        >
          <ArrowLeft size={24} strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <button
          type="submit"
          disabled={!canSubmit || pending}
          className="min-h-tap px-4 text-primary text-body font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-quick ease-standard hover:text-primary-hover active:scale-[0.98]"
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
        <h1 className="text-h1 text-text">Ny påminnelse</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-caption text-text font-medium">
            Titel
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dueAt" className="text-caption text-text font-medium">
            När
          </label>
          <input
            id="dueAt"
            name="dueAt"
            type="datetime-local"
            required
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-3 min-h-tap">
          <input
            type="checkbox"
            name="isUrgent"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-body text-text">Akut</span>
        </label>

        {state.error && (
          <p role="alert" className="text-body text-warn">
            {state.error}
          </p>
        )}
      </main>
    </form>
  );
}
