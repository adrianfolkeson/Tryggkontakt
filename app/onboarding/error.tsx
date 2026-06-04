"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("onboarding error boundary:", error);
  }, [error]);

  return (
    <main className="min-h-dvh flex flex-col px-4 max-w-content mx-auto w-full">
      <div className="flex-1 flex flex-col py-16 gap-6">
        <h1 className="text-h1 text-text">Något gick fel</h1>
        <p className="text-body text-text-muted">
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
          className="text-body text-primary font-medium text-center transition-colors duration-quick ease-standard hover:text-primary-hover"
        >
          Tillbaka till inloggning
        </Link>
      </div>
    </main>
  );
}
