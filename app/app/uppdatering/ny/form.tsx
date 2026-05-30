"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { createDailyUpdate, type State } from "./actions";

const MOOD_OPTIONS = [
  { value: "happy", label: "Glad", emoji: "😌" },
  { value: "calm", label: "Lugn", emoji: "🙂" },
  { value: "tired", label: "Trött", emoji: "😐" },
  { value: "worried", label: "Orolig", emoji: "😣" },
] as const;

const SLEEP_OPTIONS = [
  { value: "good", label: "Bra" },
  { value: "okay", label: "Okej" },
  { value: "poor", label: "Dålig" },
] as const;

const ENERGY_OPTIONS = [
  { value: "high", label: "Hög" },
  { value: "medium", label: "Medel" },
  { value: "low", label: "Låg" },
] as const;

const initialState: State = {};

type Option = { value: string; label: string; emoji?: string };

function PillPicker({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: readonly Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  const cols = options.length === 4 ? "grid-cols-4" : "grid-cols-3";
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-caption text-text font-medium">{label}</legend>
      <input type="hidden" name={name} value={value} />
      <div
        role="radiogroup"
        aria-label={label}
        className={`grid ${cols} gap-2`}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center justify-center gap-1 min-h-[80px] px-2 rounded-pill transition-colors duration-quick ease-standard ${
                selected
                  ? "bg-primary-soft border-2 border-primary"
                  : "bg-surface border border-border"
              }`}
            >
              {opt.emoji ? (
                <span className="text-[28px] leading-none" aria-hidden="true">
                  {opt.emoji}
                </span>
              ) : null}
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
  );
}

export default function NyUppdateringForm() {
  const [mood, setMood] = useState("");
  const [sleep, setSleep] = useState("");
  const [energy, setEnergy] = useState("");
  const [freeText, setFreeText] = useState("");

  const [state, formAction, pending] = useActionState(
    createDailyUpdate,
    initialState,
  );

  const remaining = 280 - freeText.length;
  const canSubmit =
    !!mood && !!sleep && !!energy && freeText.trim().length > 0;

  return (
    <form action={formAction} className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 bg-bg flex items-center justify-between h-14 px-4 max-w-content mx-auto w-full">
        <Link
          href="/app"
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
        <h1 className="text-h1 text-text">Ny uppdatering</h1>

        <PillPicker
          label="Humör"
          name="mood"
          options={MOOD_OPTIONS}
          value={mood}
          onChange={setMood}
        />
        <PillPicker
          label="Sömn i natt"
          name="sleep"
          options={SLEEP_OPTIONS}
          value={sleep}
          onChange={setSleep}
        />
        <PillPicker
          label="Energi idag"
          name="energy"
          options={ENERGY_OPTIONS}
          value={energy}
          onChange={setEnergy}
        />

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

        {state.error && (
          <p role="alert" className="text-body text-warn">
            {state.error}
          </p>
        )}
      </main>
    </form>
  );
}
