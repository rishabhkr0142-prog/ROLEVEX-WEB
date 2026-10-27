"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure for debugging; nothing sensitive is logged.
    console.error("ROLEVEX dashboard error:", error.message);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/40 bg-danger/15 text-danger">
        <AlertOctagon className="h-7 w-7" />
      </span>

      <p className="mt-6 font-mono text-sm font-bold uppercase tracking-[0.3em] text-danger">
        Something broke
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">
        An unexpected error occurred
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        The ROLEVEX dashboard hit an unexpected state. Try again — if the problem
        persists, check your <code className="font-mono text-accent-light">.env</code>{" "}
        configuration or contact support.
      </p>

      <button type="button" onClick={reset} className="btn-primary mt-8">
        <RotateCcw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
