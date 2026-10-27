"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Click-to-copy chip used for command examples. */
export function CopyChip({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard unavailable (insecure context) — do nothing.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy: ${text}`}
      className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/45 px-2.5 py-1.5 font-mono text-[13px] text-accent-light transition hover:border-accent/50 hover:bg-accent/10"
    >
      <span className="truncate">{text}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition group-hover:text-accent-light" />
      )}
    </button>
  );
}
