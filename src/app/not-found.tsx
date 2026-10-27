import Link from "next/link";
import { Compass, Home, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent-light">
        <Compass className="h-7 w-7" />
      </span>

      <p className="mt-6 font-mono text-sm font-bold uppercase tracking-[0.3em] text-accent">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        This page does not exist, or the server ID you followed is invalid.
        ROLEVEX could not find it anywhere in the guild.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          <Home className="h-4 w-4" /> Back home
        </Link>
        <Link href="/commands" className="btn-secondary">
          <Terminal className="h-4 w-4" /> Command reference
        </Link>
      </div>
    </div>
  );
}
