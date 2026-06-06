"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ExportForm({
  fromDefault,
  today,
}: {
  fromDefault: string;
  today: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      method="POST"
      action="/api/export/pdf"
      onSubmit={() => {
        setPending(true);
        // Binary download — no load event fires when the file
        // starts arriving. Clear the pending state after a fixed
        // window so a slow generate doesn't strand the button.
        setTimeout(() => setPending(false), 5000);
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="from" className="text-caption text-text font-medium">
          Från
        </label>
        <input
          id="from"
          name="from"
          type="date"
          required
          defaultValue={fromDefault}
          className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="to" className="text-caption text-text font-medium">
          Till
        </label>
        <input
          id="to"
          name="to"
          type="date"
          required
          defaultValue={today}
          className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-all duration-quick ease-standard hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {pending ? (
          <Loader2
            size={20}
            strokeWidth={1.75}
            className="animate-spin"
            aria-label="Genererar"
          />
        ) : (
          "Generera PDF"
        )}
      </button>
    </form>
  );
}
