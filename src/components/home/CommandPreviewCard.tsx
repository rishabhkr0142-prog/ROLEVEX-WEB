"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Hash, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { LogoMark } from "@/components/Logo";

/** Starting countdown: 6d 23h 12m 44s — ticks down live in the preview. */
const START_MS = ((6 * 24 + 23) * 60 * 60 + 12 * 60 + 44) * 1000;

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Command preview rendered like a Discord Components V2 container message:
 * header → section → separator → section (fields) → separator → separator
 * → action row with buttons.
 */
export function CommandPreviewCard({ inviteHref }: { inviteHref: string }) {
  const [remaining, setRemaining] = useState(START_MS);

  useEffect(() => {
    const interval = setInterval(() => setRemaining((v) => Math.max(0, v - 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const { days, hours, minutes, seconds } = split(remaining);
  const totalHours = Math.floor(START_MS / 3_600_000);
  const progress = Math.min(100, Math.max(2, ((START_MS - remaining) / START_MS) * 100 + 4));

  return (
    <div className="dc-container w-full max-w-2xl overflow-hidden text-left">
      {/* Message header */}
      <div className="flex items-start gap-3 px-4 pt-4 sm:px-5">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent-dark/30 ring-1 ring-accent/40">
          <LogoMark className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-white">ROLEVEX</span>
            <span className="rounded bg-[#5865F2] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              App
            </span>
            <span className="text-[11px] text-zinc-500">Today at 4:20 PM</span>
          </div>

          {/* Container card */}
          <div className="mt-2 overflow-hidden rounded-xl bg-[#1E1F22] ring-1 ring-white/[0.06]">
            {/* Section 1 — title + description */}
            <div className="px-4 py-3.5">
              <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-[#23A55A]">
                <ShieldCheck className="h-4 w-4" /> Temp role granted
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                <span className="font-semibold text-[#949CF7]">@nova</span> now has{" "}
                <span className="font-semibold text-[#949CF7]">@Community</span> for{" "}
                <span className="font-semibold text-white">7 days</span>. ROLEVEX will remove
                it automatically when the timer ends.
              </p>
            </div>

            <div className="dc-separator" />

            {/* Section 2 — fields */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3.5 sm:grid-cols-4">
              {[
                { label: "User", value: "@nova" },
                { label: "Role", value: "@Community" },
                { label: "Duration", value: "7d" },
                { label: "Issued by", value: "@alex" },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    {field.label}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-zinc-200">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="dc-separator" />

            {/* Section 3 — live countdown */}
            <div className="px-4 py-3.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 font-medium text-zinc-400">
                  <Clock3 className="h-4 w-4 text-accent-light" /> Expires in
                </span>
                <span className="font-mono font-semibold text-white">
                  {days}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
                </span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-dark via-accent to-accent-light transition-[width] duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                of {totalHours}h total · auto-revoked by ROLEVEX
              </p>
            </div>

            <div className="dc-separator" />

            {/* Section 4 — audit meta */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-3 text-[12px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" /> logs to <span className="text-zinc-300">#mod-logs</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" /> prefix <span className="code-chip text-[11px]">r!</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> stored in <span className="text-zinc-300">temproles</span>
              </span>
            </div>
          </div>

          {/* Action row (Components V2 style buttons) */}
          <div className="mt-2.5 flex flex-wrap gap-2 pb-4">
            <a
              href={inviteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#4752C4]"
            >
              Invite ROLEVEX
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-[#4E5058] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#6D6F78]"
            >
              Open Dashboard
            </Link>
            <Link
              href="/commands"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-[13px] font-semibold text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              All commands
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
