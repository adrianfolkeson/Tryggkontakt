"use client";

import { useState } from "react";

export default function CopyLinkBanner({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // older browsers / permissions blocked; user can still hand-copy
    }
  }

  return (
    <div
      role="status"
      className="rounded-md bg-primary-soft p-4 flex flex-col gap-3"
    >
      <p className="text-body text-text">
        Inbjudan skapad. Skicka länken till personen:
      </p>
      <code className="text-meta text-text break-all rounded-sm bg-surface px-3 py-2">
        {link}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard"
      >
        {copied ? "Kopierad" : "Kopiera länk"}
      </button>
    </div>
  );
}
