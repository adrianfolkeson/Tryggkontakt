"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { createScheduleItem, type State } from "./actions";

const initialState: State = {};

export default function NySchemaForm() {
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");

  const [state, formAction, pending] = useActionState(
    createScheduleItem,
    initialState,
  );

  const remaining = 280 - notes.length;
  const canSubmit = title.trim().length > 0 && startsAt.length > 0;

  return (
    <form action={formAction} className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 bg-bg flex items-center justify-between h-14 px-4 max-w-content mx-auto w-full">
        <Link
          href="/app/schema"
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
        <h1 className="text-h1 text-text">Ny aktivitet</h1>

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
          <label
            htmlFor="startsAt"
            className="text-caption text-text font-medium"
          >
            Start
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="endsAt"
            className="text-caption text-text font-medium"
          >
            Slut (valfritt)
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="notes" className="text-caption text-text font-medium">
            Anteckning (valfritt)
          </label>
          <textarea
            id="notes"
            name="notes"
            maxLength={280}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px] px-4 py-3 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none resize-y"
          />
          {notes.length > 0 && remaining < 40 && (
            <p
              className="text-meta text-text-subtle"
              aria-live="polite"
            >
              {remaining} tecken kvar
            </p>
          )}
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
