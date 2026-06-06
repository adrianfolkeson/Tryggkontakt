"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { saveDailyUpdate, type State } from "./actions";

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

const MEAL_OPTIONS = [
  { value: "ja", label: "Ja" },
  { value: "nej", label: "Nej" },
  { value: "lite", label: "Lite" },
] as const;

const PERIOD_OPTIONS = [
  { value: "bra", label: "Bra" },
  { value: "okej", label: "Okej" },
  { value: "tuff", label: "Tuff" },
] as const;

const VISIBILITY_OPTIONS = [
  { value: "all", label: "Alla i kretsen" },
  { value: "relatives", label: "Bara anhöriga" },
] as const;

type Slot = "morgon" | "lunch" | "eftermiddag";

const SLOT_TITLES: Record<Slot, string> = {
  morgon: "Morgonuppdatering",
  lunch: "Lunchuppdatering",
  eftermiddag: "Eftermiddagsuppdatering",
};

const MEAL_LABEL_FOR_SLOT: Record<Slot, string> = {
  morgon: "Har han ätit frukost?",
  lunch: "Har han ätit lunch?",
  eftermiddag: "Har han haft mellanmål?",
};

const PERIOD_LABEL_FOR_SLOT: Record<Slot, string> = {
  morgon: "",
  lunch: "Hur har förmiddagen varit?",
  eftermiddag: "Hur har eftermiddagen varit?",
};

type Existing = {
  id: string;
  mood: string | null;
  sleep: string | null;
  energy: string | null;
  meal_eaten: string | null;
  period_summary: string | null;
  free_text: string;
  relatives_only: boolean;
};

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
  const cols =
    options.length === 4
      ? "grid-cols-4"
      : options.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";
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
                <span
                  className="text-[1.75rem] leading-none"
                  aria-hidden="true"
                >
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

export default function NyUppdateringForm({
  slot,
  isRelative,
  defaultRelativesOnly,
  existing,
}: {
  slot: Slot;
  isRelative: boolean;
  defaultRelativesOnly: boolean;
  existing: Existing | null;
}) {
  const [mood, setMood] = useState(existing?.mood ?? "");
  const [sleep, setSleep] = useState(existing?.sleep ?? "");
  const [energy, setEnergy] = useState(existing?.energy ?? "");
  const [meal, setMeal] = useState(existing?.meal_eaten ?? "");
  const [period, setPeriod] = useState(existing?.period_summary ?? "");
  const [freeText, setFreeText] = useState(existing?.free_text ?? "");
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

  const remaining = 280 - freeText.length;
  const canSubmit = (() => {
    if (!freeText.trim()) return false;
    if (!mood || !energy || !meal) return false;
    if (slot === "morgon" && !sleep) return false;
    if ((slot === "lunch" || slot === "eftermiddag") && !period) return false;
    return true;
  })();

  return (
    <form action={formAction} className="min-h-dvh flex flex-col bg-bg">
      <header style={{ paddingTop: "env(safe-area-inset-top)" }} className="sticky top-0 bg-bg flex items-center justify-between h-14 px-4 max-w-content mx-auto w-full">
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
        <h1 className="text-h1 text-text">{SLOT_TITLES[slot]}</h1>

        <input type="hidden" name="slot" value={slot} />
        {existing && <input type="hidden" name="id" value={existing.id} />}

        <PillPicker
          label="Humör"
          name="mood"
          options={MOOD_OPTIONS}
          value={mood}
          onChange={setMood}
        />

        {slot === "morgon" && (
          <PillPicker
            label="Hur har han sovit?"
            name="sleep"
            options={SLEEP_OPTIONS}
            value={sleep}
            onChange={setSleep}
          />
        )}

        {(slot === "lunch" || slot === "eftermiddag") && (
          <PillPicker
            label={PERIOD_LABEL_FOR_SLOT[slot]}
            name="periodSummary"
            options={PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
          />
        )}

        <PillPicker
          label={MEAL_LABEL_FOR_SLOT[slot]}
          name="mealEaten"
          options={MEAL_OPTIONS}
          value={meal}
          onChange={setMeal}
        />

        <PillPicker
          label="Energi"
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

        {isRelative && (
          <PillPicker
            label="Vem ser uppdateringen?"
            name="visibility"
            options={VISIBILITY_OPTIONS}
            value={visibility}
            onChange={(v) => setVisibility(v as "all" | "relatives")}
          />
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
