import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Lock, ShieldCheck, Zap } from "lucide-react";
import { getSession } from "@/lib/auth";
import { isOwner } from "@/lib/env";
import { NoPrefixManager } from "@/components/owner/NoPrefixManager";

export const metadata: Metadata = {
  title: "Owner · No-Prefix",
  description:
    "Owner-only tool: manage which Discord users can run ROLEVEX commands without a prefix.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NoPrefixPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/owner/noprefix");
  }

  /* Owner check happens HERE, server-side, using only .env lists. */
  if (!isOwner(session.user.id)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="glass mx-auto max-w-lg rounded-3xl p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-danger/40 bg-danger/15 text-danger">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-white">403 — Forbidden</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            This page is restricted to ROLEVEX owners. Your Discord ID must be
            listed in <code className="font-mono text-accent-light">BOT_OWNER_IDS</code>{" "}
            or <code className="font-mono text-accent-light">WEBSITE_OWNER_IDS</code> in
            the environment configuration.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="btn-primary">
              Back home
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-14 sm:px-6 sm:pt-16">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-fadeUp">
          <p className="eyebrow flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Owner tools
          </p>
          <h1 className="section-title mt-3">No-prefix access</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Users on this list can run{" "}
            <strong className="text-zinc-200">every</strong> ROLEVEX command without
            typing the server prefix. Entries are written directly to the shared{" "}
            <code className="font-mono text-accent-light">noprefixes</code> collection,
            which the bot reads live.
          </p>
        </div>

        <span className="badge self-start border-accent/30 bg-accent/10 text-accent-light sm:self-auto">
          <Zap className="h-3 w-3" /> Applied instantly
        </span>
      </header>

      <NoPrefixManager />

      {/* Explanatory footer */}
      <section className="mt-8 rounded-2xl border border-white/[0.07] bg-black/25 p-5">
        <h2 className="font-display text-sm font-semibold text-white">How this works</h2>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-zinc-500">
          <li>
            • The website writes <code className="font-mono text-zinc-400">userId</code>,{" "}
            <code className="font-mono text-zinc-400">addedBy</code> and{" "}
            <code className="font-mono text-zinc-400">addedAt</code> to the{" "}
            <code className="font-mono text-zinc-400">noprefixes</code> collection.
          </li>
          <li>
            • The bot checks that collection on each message — no restart or
            redeploy required.
          </li>
          <li>
            • Only accounts in <code className="font-mono text-zinc-400">BOT_OWNER_IDS</code>{" "}
            or <code className="font-mono text-zinc-400">WEBSITE_OWNER_IDS</code> can
            reach this page and its API routes (verified server-side on every request).
          </li>
        </ul>
      </section>
    </div>
  );
}
