import { ArrowRight, CheckCircle2, Crown, PlusCircle } from "lucide-react";
import Link from "next/link";
import type { DashboardGuild } from "@/lib/dashboard";
import { botInviteUrl } from "@/lib/env";

function guildInviteUrl(guildId: string): string {
  const base = botInviteUrl();
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}guild_id=${guildId}&disable_guild_select=true`;
}

export function ServerCard({ guild }: { guild: DashboardGuild }) {
  const initials = guild.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <article className="glass glass-hover flex flex-col rounded-2xl p-5">
      <div className="flex items-start gap-3.5">
        <div className="relative h-12 w-12 shrink-0">
          {guild.iconUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={guild.iconUrl}
              alt=""
              className="h-12 w-12 rounded-2xl border border-white/10 bg-ink-800 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-accent/25 to-accent-dark/25 font-display text-sm font-bold text-accent-light">
              {initials || "?"}
            </div>
          )}

          <span
            title={guild.botPresent ? "ROLEVEX is in this server" : "ROLEVEX is not invited"}
            className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-ink-950 ${
              guild.botPresent ? "bg-success" : "bg-zinc-500"
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display font-semibold text-white">{guild.name}</h3>
            {guild.owner && (
              <span className="badge border-warning/30 bg-warning/10 text-warning">
                <Crown className="h-3 w-3" /> Owner
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            {guild.botPresent ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> ROLEVEX installed
              </>
            ) : (
              <>
                <PlusCircle className="h-3.5 w-3.5" /> Not invited yet
              </>
            )}
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-[11px] text-zinc-600">{guild.id}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {guild.botPresent ? (
          <Link href={`/dashboard/${guild.id}`} className="btn-primary btn-sm flex-1">
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <a
            href={guildInviteUrl(guild.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary btn-sm flex-1"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Invite ROLEVEX
          </a>
        )}
        {guild.botPresent && (
          <a
            href={guildInviteUrl(guild.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost btn-sm"
            title="Re-invite / add to another server"
          >
            Re-invite
          </a>
        )}
      </div>
    </article>
  );
}
