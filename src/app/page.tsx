import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CalendarClock,
  Gauge,
  ListChecks,
  PlugZap,
  ScrollText,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { CommandPreviewCard } from "@/components/home/CommandPreviewCard";
import { FeatureCard } from "@/components/home/FeatureCard";
import { StatsBand } from "@/components/home/StatsBand";
import { getHomeStats } from "@/lib/dashboard";
import { botInviteUrl, supportUrl } from "@/lib/env";
import { getSession } from "@/lib/auth";

export const revalidate = 60;

const FEATURES = [
  {
    icon: CalendarClock,
    title: "Timed roles, zero babysitting",
    description:
      "Grant a role for 7d, 12h or 30mo. ROLEVEX keeps the schedule and revokes it the moment it expires — no cron jobs, no forgotten grants.",
    accent: true,
  },
  {
    icon: ScrollText,
    title: "Full audit trail",
    description:
      "Every add, remove and expiry is written to rolelogs and mirrored to your configured log channel, so moderators always know who did what.",
  },
  {
    icon: ListChecks,
    title: "Live server dashboard",
    description:
      "See every active temp role in one table with real-time remaining time, the user behind it, and the role it belongs to.",
  },
  {
    icon: Ban,
    title: "No-prefix access",
    description:
      "Owner-approved users can run commands without typing a prefix at all. Add or revoke them instantly — the bot picks changes up live.",
  },
  {
    icon: Gauge,
    title: "Built for serverless",
    description:
      "A cached MongoDB connection, strict server-side permission checks and rate-limited endpoints keep the dashboard fast and safe on Vercel.",
  },
  {
    icon: PlugZap,
    title: "Shares the bot's database",
    description:
      "Same MongoDB collections as the ROLEVEX bot — guildconfigs, temproles, rolelogs and noprefixes stay perfectly in sync, both ways.",
  },
];

export default async function HomePage() {
  const [stats, session] = await Promise.all([getHomeStats(), getSession()]);
  const invite = botInviteUrl();
  const support = supportUrl();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/25 blur-[110px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-20 sm:px-6 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center animate-fadeUp">
            <span className="badge border-accent/30 bg-accent/10 text-accent-light">
              <ShieldCheck className="h-3.5 w-3.5" /> The temp-role bot for Discord
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Give roles now.
              <br />
              <span className="text-gradient">Revoke them on time. Every time.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              ROLEVEX is a premium Discord role management bot. Grant a role for
              <span className="text-zinc-200"> 7 days</span>,
              <span className="text-zinc-200"> 12 hours</span> or
              <span className="text-zinc-200"> 30 months</span> — and manage it all from
              one fast, secure dashboard.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={invite} target="_blank" rel="noopener noreferrer" className="btn-primary w-full px-7 py-3.5 text-base sm:w-auto">
                Invite ROLEVEX <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href={session ? "/dashboard" : "/login"}
                className="btn-secondary w-full px-7 py-3.5 text-base sm:w-auto"
              >
                {session ? "Open Dashboard" : "Login with Discord"}
              </Link>
            </div>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              Prefix <code className="code-chip text-[11px]">r!</code> · commands like
              <code className="code-chip text-[11px]">r!role @user @role 7d</code>
            </p>
          </div>

          {/* Floating command preview */}
          <div className="relative mt-14 flex justify-center sm:mt-16">
            <div
              className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-56 max-w-xl rounded-full bg-accent/20 blur-[90px]"
              aria-hidden="true"
            />
            <div className="relative w-full max-w-2xl animate-fadeUp">
              <CommandPreviewCard inviteHref={invite} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="mt-16 sm:mt-20">
        <StatsBand stats={stats} />
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6" id="features">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why ROLEVEX</p>
          <h2 className="section-title mt-3">Everything a role manager should do</h2>
          <p className="mt-4 text-zinc-400">
            Fast, reliable and auditable — built on the same MongoDB collections your
            bot already uses.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="glass overflow-hidden rounded-3xl p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="eyebrow">Three steps</p>
              <h2 className="section-title mt-3 text-2xl sm:text-3xl">
                From invite to expiry in under a minute
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                No dashboards to configure, no webhooks to wire up. Invite the bot,
                pick a log channel, and start issuing timed roles in chat.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={invite} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Invite the bot
                </a>
                <Link href="/commands" className="btn-secondary">
                  Browse commands
                </Link>
              </div>
            </div>

            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                { step: "01", title: "Invite", text: "Add ROLEVEX with Manage Roles to your server." },
                { step: "02", title: "Configure", text: "Set your prefix and log channel in the dashboard." },
                { step: "03", title: "Grant", text: "Run role @user @role 7d — done, ROLEVEX handles the rest." },
              ].map((item) => (
                <li key={item.step} className="rounded-2xl border border-white/[0.07] bg-black/25 p-5">
                  <span className="font-mono text-sm font-bold text-accent">{item.step}</span>
                  <p className="mt-2 font-display font-semibold text-white">{item.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-4xl px-4 text-center sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-b from-accent/[0.14] to-transparent px-6 py-12 sm:px-12">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-accent/30 blur-[80px]" />
          <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to stop tracking roles manually?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-zinc-400">
            Join the servers already using ROLEVEX to keep their permissions clean.
          </p>
          <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={invite} target="_blank" rel="noopener noreferrer" className="btn-primary px-7 py-3 text-base">
              Invite ROLEVEX
            </a>
            <Link href="/login" className="btn-secondary px-7 py-3 text-base">
              Login with Discord
            </Link>
            {support && (
              <a href={support} target="_blank" rel="noopener noreferrer" className="btn-ghost px-5 py-3 text-base">
                Get support
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
