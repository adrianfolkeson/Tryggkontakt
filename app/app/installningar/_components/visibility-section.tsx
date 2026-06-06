"use client";

import { useState, useTransition } from "react";

import { updateDefaultVisibility } from "../actions";

const OPTIONS = [
  { value: "all", label: "Alla i kretsen" },
  { value: "relatives", label: "Bara anhöriga" },
] as const;

type Value = (typeof OPTIONS)[number]["value"];

export default function VisibilitySection({
  initial,
}: {
  initial: boolean;
}) {
  const [value, setValue] = useState<Value>(
    initial ? "relatives" : "all",
  );
  const [pending, startTransition] = useTransition();

  function select(next: Value) {
    if (pending || next === value) return;
    setValue(next);
    startTransition(() => {
      updateDefaultVisibility(next === "relatives");
    });
  }

  return (
    <div
      role="radiogroup"
      aria-label="Standard-synlighet för nya uppdateringar"
      className="grid grid-cols-2 gap-2"
    >
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={pending}
            onClick={() => select(opt.value)}
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
  );
}
