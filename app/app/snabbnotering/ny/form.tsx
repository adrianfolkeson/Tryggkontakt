"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { saveSnabbnotering, type State } from "./actions";

const VISIBILITY_OPTIONS = [
  { value: "all", label: "Alla i kretsen" },
  { value: "relatives", label: "Bara anhöriga" },
] as const;

const initialState: State = {};

export default function SnabbnoteringForm({
  isRelative,
}: {
  isRelative: boolean;
}) {
  const [freeText, setFreeText] = useState("");
  const [visibility, setVisibility] = useState<"all" | "relatives">("all");

  const [state, formAction, pending] = useActionState(
    saveSnabbnotering,
    initialState,
  );

  const remaining = 280 - freeText.length;
  const canSubmit = freeText.trim().length > 0;

  return (
    <form action={formAction} className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 bg-bg flex items-center justify-between h-14 px-4 max-w-content mx-auto w-full">
        <Link
          href="/app"
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
        <h1 className="text-h1 text-text">Snabbnotering</h1>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="freeText"
            className="text-caption text-text font-medium"
          >
            Anteckning
          </label>
          <textarea
            id="freeText"
            name="freeText"
            required
            maxLength={280}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            className="min-h-[120px] px-4 py-3 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none resize-y"
            placeholder="Vad har hänt just nu?"
          />
          {remaining < 40 && (
            <p
              className="text-meta text-text-subtle"
              aria-live="polite"
            >
              {remaining} tecken kvar
            </p>
          )}
        </div>

        {isRelative && (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-caption text-text font-medium">
              Vem ser anteckningen?
            </legend>
            <input type="hidden" name="visibility" value={visibility} />
            <div
              role="radiogroup"
              aria-label="Vem ser anteckningen?"
              className="grid grid-cols-2 gap-2"
            >
              {VISIBILITY_OPTIONS.map((opt) => {
                const selected = visibility === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() =>
                      setVisibility(opt.value as "all" | "relatives")
                    }
                    className={`flex flex-col items-center justify-center gap-1 min-h-[80px] px-2 rounded-pill transition-colors duration-quick ease-standard ${
                      selected
                        ? "bg-primary-soft border-2 border-primary"
                        : "bg-surface border border-border"
                    }`}
                  >
                    <span
                      className={
                        selected
                          ? "text-caption text-text font-semibold"
                          : "text-caption text-text-muted font-medium"
                      }
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {state.error && (
          <p role="alert" className="text-body text-warn">
            {state.error}
          </p>
        )}
      </main>
    </form>
  );
}
