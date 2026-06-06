"use client";

import { useState, useTransition } from "react";

import { updateTextSize, type TextSize } from "../actions";

const OPTIONS = [
  { value: "small", label: "Liten" },
  { value: "medium", label: "Medel" },
  { value: "large", label: "Stor" },
] as const;

export default function TextSizeSection({
  initial,
}: {
  initial: string;
}) {
  const safeInitial: TextSize =
    initial === "small" || initial === "large" ? initial : "medium";
  const [value, setValue] = useState<TextSize>(safeInitial);
  const [pending, startTransition] = useTransition();

  function select(next: TextSize) {
    if (pending || next === value) return;
    setValue(next);
    startTransition(() => {
      updateTextSize(next);
    });
  }

  return (
    <div
      role="radiogroup"
      aria-label="Textstorlek"
      className="grid grid-cols-3 gap-2"
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
