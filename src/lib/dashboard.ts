import type { Session } from "next-auth";
import { connectDB } from "@/lib/db";
import { GuildConfig, RoleLog, TempRole } from "@/lib/models";
import {
  canManageGuild,
  getBotGuildIds,
  getUserGuilds,
  type DiscordGuild,
} from "@/lib/discord";

export interface DashboardGuild {
  id: string;
  name: string;
  iconUrl: string | null;
  owner: boolean;
  canManage: boolean;
  botPresent: boolean;
}

function iconUrl(guild: DiscordGuild): string | null {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
}

/**
 * The user's servers where they can manage the bot (owner / Manage Server /
 * Administrator), annotated with whether ROLEVEX has already been invited.
 */
export async function getManageableGuilds(session: Session): Promise<DashboardGuild[]> {
  if (!session.accessToken) return [];

  const [userGuilds, botGuildIds] = await Promise.all([
    getUserGuilds(session.accessToken),
    getBotGuildIds(),
  ]);

  return userGuilds
    .filter((guild) => canManageGuild(guild))
    .map((guild) => ({
      id: guild.id,
      name: guild.name,
      iconUrl: iconUrl(guild),
      owner: Boolean(guild.owner),
      canManage: true,
      botPresent: botGuildIds.has(guild.id),
    }))
    .sort((a, b) => {
      if (a.botPresent !== b.botPresent) return a.botPresent ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export interface HomeStats {
  servers: number;
  activeRoles: number;
  totalRoles: number;
  logs: number;
}

/** Public stats for the Home page. Returns null if the DB is unreachable. */
export async function getHomeStats(): Promise<HomeStats | null> {
  try {
    await connectDB();
    const now = new Date();
    const [servers, activeRoles, totalRoles, logs] = await Promise.all([
      GuildConfig.countDocuments(),
      TempRole.countDocuments({ expiresAt: { $gt: now } }),
      TempRole.countDocuments(),
      RoleLog.countDocuments(),
    ]);
    return { servers, activeRoles, totalRoles, logs };
  } catch {
    return null;
  }
}
