"use client";

import { useState } from "react";

interface Props {
  shareUrl: string;
}

export function TripShareButton({ shareUrl }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="flex-1 truncate text-xs text-white/50">{shareUrl}</span>
      <button
        onClick={copy}
        className="shrink-0 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
      >
        {copied ? "Kopiert ✓" : "Del tur"}
      </button>
    </div>
  );
}
