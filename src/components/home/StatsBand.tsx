import { CountUp } from "@/components/home/CountUp";
import { Activity, Clock3, ScrollText, Server } from "lucide-react";
import type { HomeStats } from "@/lib/dashboard";

const ITEMS = [
  {
    key: "servers",
    label: "Servers protected",
    icon: Server,
    fallback: "—",
  },
  {
    key: "activeRoles",
    label: "Active temp roles",
    icon: Clock3,
    fallback: "—",
  },
  {
    key: "logs",
    label: "Actions logged",
    icon: ScrollText,
    fallback: "—",
  },
  {
    key: "totalRoles",
    label: "Roles processed",
    icon: Activity,
    fallback: "—",
  },
] as const;

export function StatsBand({ stats }: { stats: HomeStats | null }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-label="ROLEVEX statistics">
      <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.06] lg:grid-cols-4">
        {ITEMS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="group bg-ink-950/70 px-6 py-7 text-center transition-colors hover:bg-ink-900/80"
          >
            <Icon className="mx-auto h-4.5 w-4.5 text-accent/80 transition-transform group-hover:-translate-y-0.5" />
            <p className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              {stats ? <CountUp value={stats[key]} /> : <span className="text-zinc-600">··</span>}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
