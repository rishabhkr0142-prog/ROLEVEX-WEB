import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  LayoutDashboard,
  PlusCircle,
  RefreshCw,
  SearchX,
  Shield,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getManageableGuilds } from "@/lib/dashboard";
import { ServerCard } from "@/components/dashboard/ServerCard";
import { botInviteUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Choose a ROLEVEX server. Every server where you have Manage Server or Administrator, with live bot presence.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const invite = botInviteUrl();
  let guilds: Awaited<ReturnType<typeof getManageableGuilds>> = [];
  let failed = false;

  try {
    guilds = await getManageableGuilds(session);
  } catch {
    failed = true;
  }

  const installed = guilds.filter((g) => g.botPresent).length;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-16">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-fadeUp">
          <p className="eyebrow">Dashboard</p>
          <h1 className="section-title mt-3">Your servers</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Welcome back
            {session.user.name ? (
              <>
                , <span className="font-semibold text-white">{session.user.name}</span>
              </>
            ) : null}
            . Servers are listed only when your account has{" "}
            <span className="text-zinc-200">Manage Server</span>,{" "}
            <span className="text-zinc-200">Administrator</span>, or you own them.
            {guilds.length > 0 && (
              <>
                {" "}
                <span className="text-zinc-200">{installed}</span> of{" "}
                <span className="text-zinc-200">{guilds.length}</span> have ROLEVEX
                installed.
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <a href={invite} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
            <PlusCircle className="h-4 w-4" /> Invite bot
          </a>
          <a
            href="https://discord.com/developers/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost btn-sm"
          >
            Discord portal <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      {failed ? (
        <div className="glass mt-8 rounded-2xl p-10 text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-zinc-500" />
          <h2 className="mt-4 font-display text-lg font-semibold text-white">
            Could not reach Discord
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Discord did not return your server list. Please log out and sign in
            again so the <code className="font-mono text-accent-light">guilds</code>{" "}
            scope is refreshed.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/login" className="btn-secondary">
              Re-authenticate
            </Link>
          </div>
        </div>
      ) : guilds.length === 0 ? (
        <div className="glass mt-8 rounded-2xl p-10 text-center">
          <SearchX className="mx-auto h-8 w-8 text-zinc-500" />
          <h2 className="mt-4 font-display text-lg font-semibold text-white">
            No manageable servers found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            You are not a member of any server where you have Manage Server,
            Administrator, or ownership. Create a server or ask an admin to grant
            you the permission.
          </p>
          <a href={invite} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5">
            <PlusCircle className="h-4 w-4" /> Invite ROLEVEX somewhere new
          </a>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guilds.map((guild) => (
            <ServerCard key={guild.id} guild={guild} />
          ))}
        </div>
      )}

      {/* ── Owner banner (only for accounts in BOT_OWNER_IDS / WEBSITE_OWNER_IDS) ── */}
      {session.user.isOwner && (
        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-accent/25 bg-accent/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent-light">
              <Shield className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-white">
                Owner tools unlocked
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-400">
                Grant individual Discord users permission to run commands without
                a prefix from the owner-only page.
              </p>
            </div>
          </div>
          <Link href="/owner/noprefix" className="btn-primary btn-sm shrink-0">
            <LayoutDashboard className="h-3.5 w-3.5" /> Open owner tools
          </Link>
        </div>
      )}
    </div>
  );
}
