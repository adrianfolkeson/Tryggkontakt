"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function InviteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("invite error boundary:", error);
  }, [error]);

  return (
    <main className="min-h-dvh flex flex-col px-4 max-w-content mx-auto w-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-16">
        <h1 className="text-h1 text-text text-center">Något gick fel</h1>
        <p className="text-body text-text-muted text-center">
          Vi kunde inte hämta innehållet just nu. Försök igen om en stund.
        </p>
        <button
          type="button"
          onClick={reset}
          className="min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-all duration-quick ease-standard hover:bg-primary-hover active:scale-[0.98]"
        >
          Försök igen
        </button>
        <Link
          href="/sign-in"
          className="text-body text-primary font-medium transition-colors duration-quick ease-standard hover:text-primary-hover"
        >
          Tillbaka till inloggning
        </Link>
      </div>
    </main>
  );
}
