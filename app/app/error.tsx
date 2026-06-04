"use client";

import { useEffect } from "react";

import BottomNav from "./_components/bottom-nav";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <main className="flex-1 px-4 pt-16 pb-32 max-w-content mx-auto w-full flex flex-col gap-6">
        <h1 className="text-h1 text-text">Något gick fel</h1>
        <p className="text-body text-text-muted">
          Vi kunde inte hämta innehållet just nu. Försök igen om en stund.
        </p>
        <button
          type="button"
          onClick={reset}
          className="w-full min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-all duration-quick ease-standard hover:bg-primary-hover active:scale-[0.98]"
        >
          Försök igen
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
