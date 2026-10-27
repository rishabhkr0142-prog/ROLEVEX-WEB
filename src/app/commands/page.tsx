import Link from "next/link";
import type { Metadata } from "next";
import {
  Clock3,
  Gauge,
  Keyboard,
  Settings2,
  Sparkles,
  Timer,
} from "lucide-react";
import { CopyChip } from "@/components/CopyChip";
import { COMMAND_GROUPS, DEFAULT_PREFIX, DURATION_UNITS, TOTAL_COMMANDS } from "@/lib/commands";
import { botInviteUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Commands",
  description:
    "Every ROLEVEX Discord command with usage examples: role, remove, temproles, check, prefix, setlog and more — including duration units s, m, h, d, w and mo.",
};

const GROUP_ICONS = {
  clock: Clock3,
  settings: Settings2,
  utility: Gauge,
} as const;

export default function CommandsPage() {
  const invite = botInviteUrl();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Reference</p>
        <h1 className="section-title mt-3">
          Every <span className="text-gradient">ROLEVEX</span> command
        </h1>
        <p className="mt-4 text-zinc-400">
          {TOTAL_COMMANDS} commands, {DEFAULT_PREFIX} prefix by default. Change the
          prefix per server from the dashboard — every example below uses{" "}
          <code className="code-chip text-[12px]">{DEFAULT_PREFIX}</code>.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={invite} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Invite ROLEVEX
          </a>
          <Link href="/dashboard" className="btn-secondary">
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* ── Duration units ────────────────────────────────────────── */}
      <section className="mt-14">
        <div className="glass overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-1.5 border-b border-white/[0.07] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent-light">
                <Timer className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  Duration units
                </h2>
                <p className="text-[13px] text-zinc-500">
                  Append a unit to any <code className="font-mono text-accent-light">role</code> command.
                </p>
              </div>
            </div>
            <span className="badge self-start border-warning/30 bg-warning/10 text-warning sm:self-auto">
              <Sparkles className="h-3 w-3" /> m = minutes, mo = months
            </span>
          </div>

          <div className="grid grid-cols-1 gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {DURATION_UNITS.map((item) => (
              <div
                key={item.unit}
                className="flex items-center justify-between gap-3 bg-ink-950/70 px-5 py-4"
              >
                <div>
                  <p className="font-display font-semibold text-white">
                    {item.label}{" "}
                    <span className="ml-1 rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-accent-light">
                      {item.unit}
                    </span>
                  </p>
                  <p className="text-[13px] text-zinc-500">{item.description}</p>
                </div>
                <CopyChip text={`${DEFAULT_PREFIX}role @user @role ${item.example}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Command groups ───────────────────────────────────────── */}
      <div className="mt-12 space-y-10 pb-8">
        {COMMAND_GROUPS.map((group) => {
          const Icon = GROUP_ICONS[group.icon as keyof typeof GROUP_ICONS];
          return (
            <section key={group.id} id={group.id}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-accent-light">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold text-white">{group.title}</h2>
                  <p className="text-[13px] text-zinc-500">{group.description}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {group.commands.map((command) => (
                  <article
                    key={command.name}
                    className="glass glass-hover flex flex-col rounded-2xl p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <code className="font-mono text-base font-bold text-white">
                        <span className="text-accent">{DEFAULT_PREFIX}</span>
                        {command.name}
                      </code>
                      {command.permissions && (
                        <span className="badge border-white/10 text-zinc-400">
                          <Keyboard className="h-3 w-3" /> {command.permissions}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                      {command.summary}
                    </p>

                    <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/35 p-3.5">
                      <p className="label mb-2">Usage</p>
                      <code className="block break-words font-mono text-[13px] text-zinc-200">
                        <span className="text-accent-light">{DEFAULT_PREFIX}</span>
                        {command.usage}
                      </code>

                      <p className="label mb-2 mt-4">Examples</p>
                      <div className="flex flex-wrap gap-2">
                        {command.examples.map((example) => (
                          <CopyChip
                            key={example}
                            text={
                              example.startsWith(DEFAULT_PREFIX)
                                ? example
                                : `${DEFAULT_PREFIX}${example}`
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Note ─────────────────────────────────────────────────── */}
      <section className="mb-4 rounded-2xl border border-accent/25 bg-accent/[0.07] p-6">
        <h3 className="font-display font-semibold text-white">
          Permission requirements
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          ROLEVEX needs <strong className="text-zinc-200">Manage Roles</strong> to
          grant and revoke roles, and its highest role must sit above every role it
          manages. Server settings commands additionally require{" "}
          <strong className="text-zinc-200">Manage Server</strong>. The dashboard
          verifies your permissions server-side before allowing any change.
        </p>
      </section>
    </div>
  );
}
