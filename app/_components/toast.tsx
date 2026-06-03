"use client";

import { Check } from "lucide-react";

export default function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 z-50 flex justify-center pointer-events-none"
      style={{
        bottom: "calc(5rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-primary-soft text-primary text-body font-medium shadow-soft animate-toast-in motion-reduce:animate-none">
        <Check size={20} strokeWidth={1.75} aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
}
