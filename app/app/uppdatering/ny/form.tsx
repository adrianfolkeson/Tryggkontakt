"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import {
  ENERGY_LABEL,
  MOOD_LABEL,
  SLOT_FIELD_LABELS,
  SLOT_TITLES,
  type NamedSlot,
} from "@/lib/slots";

import { saveDailyUpdate, type State } from "./actions";

const VISIBILITY_OPTIONS = [
  { value: "all", label: "Alla i kretsen" },
  { value: "relatives", label: "Bara anhöriga" },
] as const;

type Existing = {
  id: string;
  period_note: string | null;
  meal_note: string | null;
  mood: string | null;
  energy: string | null;
  relatives_only: boolean;
};

const initialState: State = {};

export default function NyUppdateringForm({
  slot,
  isRelative,
  defaultRelativesOnly,
  existing,
}: {
  slot: NamedSlot;
  isRelative: boolean;
  defaultRelativesOnly: boolean;
  existing: Existing | null;
}) {
  const fieldLabels = SLOT_FIELD_LABELS[slot];

  const [periodNote, setPeriodNote] = useState(existing?.period_note ?? "");
  const [mealNote, setMealNote] = useState(existing?.meal_note ?? "");
  const [mood, setMood] = useState(existing?.mood ?? "");
  const [energy, setEnergy] = useState(existing?.energy ?? "");
  const [visibility, setVisibility] = useState<"all" | "relatives">(
    existing
      ? existing.relatives_only
        ? "relatives"
        : "all"
      : defaultRelativesOnly
        ? "relatives"
        : "all",
  );

  const [state, formAction, pending] = useActionState(
    saveDailyUpdate,
    initialState,
  );

  return (
    <form action={formAction} className="min-h-dvh flex flex-col bg-bg">
      <header
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        className="sticky top-0 bg-bg flex items-center justify-between h-14 px-4 max-w-content mx-auto w-full"
      >
        <Link
          href="/app"
          aria-label="Tillbaka"
          className="w-12 h-12 -ml-3 flex items-center justify-center text-text transition-all duration-quick ease-standard hover:text-text-muted active:scale-[0.95]"
        >
          <ArrowLeft size={24} strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <button
          type="submit"
          disabled={pending}
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
        <h1 className="text-h1 text-text">{SLOT_TITLES[slot]}</h1>

        <input type="hidden" name="slot" value={slot} />
        {existing && <input type="hidden" name="id" value={existing.id} />}

        <FieldTextarea
          id="periodNote"
          name="periodNote"
          label={fieldLabels.period}
          value={periodNote}
          onChange={setPeriodNote}
        />

        <FieldTextarea
          id="mealNote"
          name="mealNote"
          label={fieldLabels.meal}
          value={mealNote}
          onChange={setMealNote}
        />

        <FieldInput
          id="mood"
          name="mood"
          label={MOOD_LABEL}
          value={mood}
          onChange={setMood}
        />

        <FieldInput
          id="energy"
          name="energy"
          label={ENERGY_LABEL}
          value={energy}
          onChange={setEnergy}
        />

        {isRelative && (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-caption text-text font-medium">
              Vem ser uppdateringen?
            </legend>
            <input type="hidden" name="visibility" value={visibility} />
            <div
              role="radiogroup"
              aria-label="Vem ser uppdateringen?"
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
                    className={`flex items-center justify-center min-h-[64px] px-2 rounded-pill transition-colors duration-quick ease-standard ${
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

function FieldTextarea({
  id,
  name,
  label,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-caption text-text font-medium">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        maxLength={280}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[80px] px-4 py-3 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none resize-y"
      />
    </div>
  );
}

function FieldInput({
  id,
  name,
  label,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-caption text-text font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        maxLength={80}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
      />
    </div>
  );
}
