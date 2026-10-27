import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  Activity,
  ArrowLeft,
  Ban,
  Clock3,
  Hash,
  ScrollText,
  Settings2,
  ShieldAlert,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { botIsIn, verifyGuildAccess } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { GuildConfig, RoleLog, TempRole } from "@/lib/models";
import { getGuildChannels, getGuildRoles, guildIconUrl, resolveUsers } from "@/lib/discord";
import { isSnowflake } from "@/lib/validate";
import { botInviteUrl } from "@/lib/env";
import { ServerConfigForm } from "@/components/dashboard/ServerConfigForm";
import { TempRoleTable } from "@/components/dashboard/TempRoleTable";
import { LogList } from "@/components/dashboard/LogList";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import type { LogRow, TempRoleRow } from "@/components/dashboard/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage server",
  description: "Configure ROLEVEX for this server: prefix, log channel, active temp roles and role history.",
};

interface Props {
  params: { guildId: string };
}

function Panel({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass mx-auto mt-16 max-w-lg rounded-3xl p-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent-light">
        {icon}
      </span>
      <h1 className="mt-4 font-display text-xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

export default async function GuildDashboardPage({ params }: Props) {
  const { guildId } = params;

  if (!isSnowflake(guildId)) notFound();

  const session = await getSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/${guildId}`);
  }

  /* ── Server-side permission verification ─────────────────────────── */
  const access = await verifyGuildAccess(session, guildId);

  if (!access.ok) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Panel
          icon={<ShieldAlert className="h-6 w-6" />}
          title="You cannot manage this server"
          description={access.reason}
        >
          <Link href="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
        </Panel>
      </div>
    );
  }

  const guild = access.guild;
  const invite = botInviteUrl();

  /* ── Bot presence ────────────────────────────────────────────────── */
  const botPresent = await botIsIn(guildId);
  if (!botPresent) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Panel
          icon={<Ban className="h-6 w-6" />}
          title="ROLEVEX is not in this server"
          description={`Invite ROLEVEX to ${guild.name} to configure its prefix, log channel and see active temp roles.`}
        >
          <a
            href={`${invite}${invite.includes("?") ? "&" : "?"}guild_id=${guildId}&disable_guild_select=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Invite ROLEVEX
          </a>
          <Link href="/dashboard" className="btn-secondary">
            Back to dashboard
          </Link>
        </Panel>
      </div>
    );
  }

  /* ── Data ────────────────────────────────────────────────────────── */
  let config = { prefix: "r!", logChannelId: "" };
  let channels: { id: string; name: string }[] = [];
  let tempRows: TempRoleRow[] = [];
  let logRows: LogRow[] = [];
  let serverNow = Date.now();
  let loadError: string | null = null;

  try {
    await connectDB();
    const [configDoc, channelList, tempDocs, logDocs, roleList] = await Promise.all([
      GuildConfig.findOne({ guildId }).lean(),
      getGuildChannels(guildId).catch(() => []),
      TempRole.find({ guildId }).sort({ expiresAt: 1 }).limit(250).lean(),
      RoleLog.find({ guildId }).sort({ at: -1 }).limit(50).lean(),
      getGuildRoles(guildId).catch(() => []),
    ]);

    serverNow = Date.now();
    config = {
      prefix: configDoc?.prefix ?? "r!",
      logChannelId: configDoc?.logChannelId ?? "",
    };
    channels = channelList.map((c) => ({ id: c.id, name: c.name }));

    const roleMap = new Map(roleList.map((r) => [r.id, r]));

    const users = await resolveUsers([
      ...tempDocs.flatMap((d) => [d.userId, d.addedBy]),
      ...logDocs.flatMap((d) => [d.userId, d.by]),
    ]);

    tempRows = tempDocs.map((doc) => {
      const role = roleMap.get(doc.roleId);
      return {
        userId: doc.userId,
        roleId: doc.roleId,
        expiresAt: doc.expiresAt.toISOString(),
        addedBy: doc.addedBy,
        user: users[doc.userId] ?? null,
        addedByUser: users[doc.addedBy] ?? null,
        role: role
          ? { id: role.id, name: role.name, color: role.color }
          : { id: doc.roleId, name: `role ${doc.roleId}`, color: 0 },
      };
    });

    logRows = logDocs.map((doc) => ({
      action: doc.action,
      userId: doc.userId,
      roleId: doc.roleId,
      roleName: roleMap.get(doc.roleId)?.name ?? `role ${doc.roleId}`,
      roleColor: roleMap.get(doc.roleId)?.color ?? 0,
      by: doc.by,
      at: doc.at.toISOString(),
      user: users[doc.userId] ?? null,
      byUser: users[doc.by] ?? null,
    }));
  } catch (error) {
    console.error("guild dashboard load failed:", error);
    loadError =
      "The shared database could not be reached. Please try again in a moment.";
  }

  const activeCount = tempRows.filter(
    (row) => Date.parse(row.expiresAt) - serverNow > 0
  ).length;
  const icon = guildIconUrl(guild, 128);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      {/* ── Server header ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="btn-ghost btn-sm !px-2.5"
            title="Back to your servers"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {icon ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={icon}
              alt=""
              className="h-14 w-14 rounded-2xl border border-white/10 bg-ink-800 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-accent/25 to-accent-dark/25 font-display text-lg font-bold text-accent-light">
              {guild.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-2xl font-bold text-white">
                {guild.name}
              </h1>
              <span className="badge border-success/30 bg-success/10 text-success">
                <Activity className="h-3 w-3" /> ROLEVEX installed
              </span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-zinc-500">
              <span className="font-mono text-zinc-600">{guild.id}</span>
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                {config.logChannelId ? "Logging enabled" : "No log channel"}
              </span>
              <span className="flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5" />
                prefix <code className="code-chip text-[11px]">{config.prefix}</code>
              </span>
            </p>
          </div>
        </div>

        <RefreshButton />
      </div>

      {loadError && (
        <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
          {loadError}
        </div>
      )}

      {/* ── Quick stats ─────────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Clock3, label: "Active temp roles", value: activeCount },
          { icon: ScrollText, label: "Recent log entries", value: logRows.length },
          {
            icon: Hash,
            label: "Log channel",
            value: config.logChannelId ? "Set" : "Off",
          },
          { icon: Activity, label: "Bot status", value: "Online" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl px-4 py-4">
            <stat.icon className="h-4 w-4 text-accent/80" />
            <p className="mt-2 font-display text-xl font-bold text-white">
              {stat.value}
            </p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Config ──────────────────────────────────────────────────── */}
      <div className="mt-6">
        <ServerConfigForm
          guildId={guildId}
          initialPrefix={config.prefix}
          initialLogChannelId={config.logChannelId}
          channels={channels}
        />
      </div>

      {/* ── Temp roles ──────────────────────────────────────────────── */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent-light">
              <Clock3 className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Active temp roles
              </h2>
              <p className="text-[13px] text-zinc-500">
                Source: <code className="font-mono text-accent-light">temproles</code>
              </p>
            </div>
          </div>
        </div>

        <TempRoleTable rows={tempRows} serverNow={serverNow} />
      </section>

      {/* ── Role log ────────────────────────────────────────────────── */}
      <section className="mt-10 pb-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent-light">
            <ScrollText className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Recent role history
            </h2>
            <p className="text-[13px] text-zinc-500">
              Source: <code className="font-mono text-accent-light">rolelogs</code> · add,
              remove and expire events
            </p>
          </div>
        </div>

        <LogList logs={logRows} />
      </section>
    </div>
  );
}
