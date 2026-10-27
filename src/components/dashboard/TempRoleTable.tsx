"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Infinity as InfinityIcon, UserRound } from "lucide-react";
import type { TempRoleRow } from "@/components/dashboard/types";
import { formatDuration } from "@/lib/validate";

interface Props {
  rows: TempRoleRow[];
  /** Server timestamp (ms) captured when the page was rendered. */
  serverNow: number;
}

/** Table of active temp roles with a live "remaining time" countdown. */
export function TempRoleTable({ rows, serverNow }: Props) {
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Correct the client clock against the server clock once on mount.
    setOffset(serverNow - Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [serverNow]);

  const clock = now + offset;

  const sorted = useMemo(() => {
    return [...rows].sort(
      (a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt)
    );
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.12] bg-black/20 px-6 py-12 text-center">
        <Clock3 className="mx-auto h-7 w-7 text-zinc-600" />
        <p className="mt-3 font-display font-semibold text-zinc-300">
          No active temp roles
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
          Grant one in chat with{" "}
          <code className="font-mono text-accent-light">role @user @role 7d</code>{" "}
          — it will appear here with a live countdown.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-black/25">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.03] text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              <th className="px-5 py-3.5 font-semibold">User</th>
              <th className="px-5 py-3.5 font-semibold">Role</th>
              <th className="px-5 py-3.5 font-semibold">Expires</th>
              <th className="px-5 py-3.5 font-semibold">Remaining</th>
              <th className="px-5 py-3.5 font-semibold">Added by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.055]">
            {sorted.map((row) => {
              const expiresAt = Date.parse(row.expiresAt);
              const remaining = expiresAt - clock;
              const expired = remaining <= 0;
              const urgent = !expired && remaining < 60 * 60 * 1000;
              const roleColor =
                row.role.color && row.role.color !== 0
                  ? `#${row.role.color.toString(16).padStart(6, "0")}`
                  : "#7C5CFF";

              return (
                <tr key={`${row.userId}:${row.roleId}`} className="transition hover:bg-white/[0.035]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {row.user ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={row.user.avatar}
                          alt=""
                          className="h-7 w-7 rounded-full bg-ink-700 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-700 text-zinc-500">
                          <UserRound className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {row.user?.displayName ?? row.userId}
                        </p>
                        <p className="font-mono text-[11px] text-zinc-600">{row.userId}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1">
                      <span
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                        style={{ backgroundColor: roleColor }}
                      />
                      <span className="text-zinc-200">{row.role.name}</span>
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-zinc-400">
                    {new Date(expiresAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-5 py-3.5">
                    {expired ? (
                      <span className="badge border-danger/30 bg-danger/10 text-danger">
                        Expired
                      </span>
                    ) : (
                      <span
                        className={`font-mono text-[13px] font-semibold ${
                          urgent ? "text-warning" : "text-accent-light"
                        }`}
                      >
                        {formatDuration(remaining)}
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {row.addedByUser && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={row.addedByUser.avatar}
                          alt=""
                          className="h-5 w-5 rounded-full bg-ink-700 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span className="truncate text-zinc-400">
                        {row.addedByUser?.displayName ?? `#${row.addedBy.slice(-4)}`}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-xs text-zinc-500">
        <span>
          {rows.length} active {rows.length === 1 ? "entry" : "entries"}
        </span>
        <span className="flex items-center gap-1.5">
          <InfinityIcon className="h-3.5 w-3.5 text-accent" />
          Countdowns are computed against the server clock
        </span>
      </div>
    </div>
  );
}
