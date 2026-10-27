"use client";

import { useEffect, useState } from "react";
import { History, MinusCircle, PlusCircle, TimerReset, UserRound } from "lucide-react";
import type { LogRow } from "@/components/dashboard/types";

const ACTION_META = {
  add: {
    label: "Added",
    icon: PlusCircle,
    classes: "border-success/30 bg-success/10 text-success",
  },
  remove: {
    label: "Removed",
    icon: MinusCircle,
    classes: "border-danger/30 bg-danger/10 text-danger",
  },
  expire: {
    label: "Expired",
    icon: TimerReset,
    classes: "border-warning/30 bg-warning/10 text-warning",
  },
} as const;

function relativeTime(iso: string, clock: number): string {
  const diff = clock - Date.parse(iso);
  if (Number.isNaN(diff)) return "—";
  const future = diff < 0;
  const abs = Math.abs(diff);
  const minutes = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);

  let value: string;
  if (minutes < 1) value = "just now";
  else if (hours < 1) value = `${minutes}m`;
  else if (days < 1) value = `${hours}h`;
  else value = `${days}d`;

  if (minutes < 1) return value;
  return future ? `in ${value}` : `${value} ago`;
}

/** Recent RoleLog history (add / remove / expire) for one guild. */
export function LogList({ logs }: { logs: LogRow[] }) {
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setClock(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.12] bg-black/20 px-6 py-12 text-center">
        <History className="mx-auto h-7 w-7 text-zinc-600" />
        <p className="mt-3 font-display font-semibold text-zinc-300">No history yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
          Role additions, removals and expiries will appear here once the bot
          starts working in this server.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-black/25">
      <ol className="divide-y divide-white/[0.055]">
        {logs.map((log, index) => {
          const meta = ACTION_META[log.action] ?? ACTION_META.add;
          const Icon = meta.icon;

          return (
            <li key={`${log.at}:${log.userId}:${log.roleId}:${index}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition hover:bg-white/[0.035]">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.classes}`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                {log.user ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={log.user.avatar}
                    alt=""
                    className="h-6 w-6 rounded-full bg-ink-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-700 text-zinc-500">
                    <UserRound className="h-3 w-3" />
                  </span>
                )}

                <span className="text-sm font-medium text-white">
                  {log.user?.displayName ?? log.userId}
                </span>

                <span className="text-sm text-zinc-500">
                  {log.action === "add"
                    ? "was given"
                    : log.action === "remove"
                      ? "lost"
                      : "expired from"}
                </span>

                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[13px] text-zinc-200"
                  title={log.roleId}
                >
                  <span
                    className="h-2 w-2 rounded-full ring-1 ring-white/20"
                    style={{
                      backgroundColor:
                        log.roleColor && log.roleColor !== 0
                          ? `#${log.roleColor.toString(16).padStart(6, "0")}`
                          : "#7C5CFF",
                    }}
                  />
                  {log.roleName}
                </span>

                <span className="text-sm text-zinc-500">by</span>
                <span className="text-sm text-zinc-300">
                  {log.byUser?.displayName ?? `#${log.by.slice(-4)}`}
                </span>
              </div>

              <div className="ml-auto flex shrink-0 flex-col items-end">
                <span className={`badge ${meta.classes}`}>{meta.label}</span>
                <span className="mt-1 text-[11px] text-zinc-600">
                  {relativeTime(log.at, clock)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
