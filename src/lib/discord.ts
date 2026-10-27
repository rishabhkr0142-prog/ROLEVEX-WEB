/**
 * Discord REST helpers (server-side only — the bot token never reaches the
 * client). Every function that touches the Discord API uses a short in-memory
 * TTL cache to stay inside rate limits on serverless.
 */

const DISCORD_API = "https://discord.com/api/v10";

export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string | null;
  owner?: boolean;
  permissions: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parent_id?: string | null;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  hoist?: boolean;
}

/* ── tiny TTL cache ─────────────────────────────────────────────────── */
type Entry = { value: unknown; expires: number };
const cache = new Map<string, Entry>();
const MAX_CACHE_ENTRIES = 2000;

function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function cacheSet<T>(key: string, value: T, ttlMs: number): T {
  if (cache.size > MAX_CACHE_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of cache) if (now > v.expires) cache.delete(k);
  }
  cache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

/* ── helpers ────────────────────────────────────────────────────────── */
function botToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN is not set on the server.");
  return token;
}

export function avatarUrl(
  user: Pick<DiscordUser, "id" | "avatar">,
  size = 64
): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`;
  }
  // Default Discord avatar derived from the user id.
  const index = Number((BigInt(user.id) >> 22n) % 6n);
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function guildIconUrl(
  guild: Pick<DiscordGuild, "id" | "icon">,
  size = 64
): string | null {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=${size}`;
}

export function displayUser(user?: DiscordUser | null): string {
  if (!user) return "Unknown user";
  return user.global_name || user.username;
}

export const PERMISSION_VIEW_AUDIT_LOG = 0x80n;
export const PERMISSION_MANAGE_GUILD = 0x20n;
export const PERMISSION_ADMINISTRATOR = 0x8n;

/** The user may configure the bot: Manage Server, Administrator, or owner. */
export function canManageGuild(guild: DiscordGuild): boolean {
  if (guild.owner) return true;
  try {
    const permissions = BigInt(guild.permissions || "0");
    return (
      (permissions & PERMISSION_MANAGE_GUILD) === PERMISSION_MANAGE_GUILD ||
      (permissions & PERMISSION_ADMINISTRATOR) === PERMISSION_ADMINISTRATOR
    );
  } catch {
    return false;
  }
}

/* ── Discord API calls ──────────────────────────────────────────────── */

/** All guilds the *user* belongs to (paginated, up to 20 pages). */
export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const guilds: DiscordGuild[] = [];
  let after = "0";

  for (let page = 0; page < 20; page++) {
    const res = await fetch(
      `${DISCORD_API}/users/@me/guilds?limit=200&after=${after}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch user guilds (Discord ${res.status}).`);
    }
    const batch = (await res.json()) as DiscordGuild[];
    guilds.push(...batch);
    if (batch.length < 200) break;
    after = batch[batch.length - 1].id;
  }

  return guilds;
}

/** All guild IDs the *bot* is in (cached 5 minutes, paginated). */
export async function getBotGuildIds(): Promise<Set<string>> {
  const cachedIds = cacheGet<Set<string>>("bot:guilds");
  if (cachedIds) return cachedIds;

  const ids = new Set<string>();
  let after = "0";

  for (let page = 0; page < 20; page++) {
    const res = await fetch(
      `${DISCORD_API}/users/@me/guilds?limit=200&after=${after}`,
      {
        headers: { Authorization: `Bot ${botToken()}` },
        cache: "no-store",
      }
    );
    if (!res.ok) break; // graceful: treat as "no guilds" on failure
    const batch = (await res.json()) as DiscordGuild[];
    for (const guild of batch) ids.add(guild.id);
    if (batch.length < 200) break;
    after = batch[batch.length - 1].id;
  }

  return cacheSet("bot:guilds", ids, 5 * 60 * 1000);
}

/** Is the bot a member of this guild? (cached 60 seconds) */
export async function isBotInGuild(guildId: string): Promise<boolean> {
  const key = `bot:in:${guildId}`;
  const cached = cacheGet<boolean>(key);
  if (typeof cached === "boolean") return cached;

  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/@me`, {
    headers: { Authorization: `Bot ${botToken()}` },
    cache: "no-store",
  });

  const present = res.status === 200;
  return cacheSet(key, present, 60 * 1000);
}

/** Text/announcement channels of a guild, for the log-channel picker. */
export async function getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  const key = `channels:${guildId}`;
  const cached = cacheGet<DiscordChannel[]>(key);
  if (cached) return cached;

  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${botToken()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch channels (Discord ${res.status}).`);

  const channels = ((await res.json()) as DiscordChannel[])
    .filter((c) => c.type === 0 || c.type === 5) // text + announcement
    .sort((a, b) => a.name.localeCompare(b.name));

  return cacheSet(key, channels, 60 * 1000);
}

/** Roles of a guild (cached 60 seconds). */
export async function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
  const key = `roles:${guildId}`;
  const cached = cacheGet<DiscordRole[]>(key);
  if (cached) return cached;

  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
    headers: { Authorization: `Bot ${botToken()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch roles (Discord ${res.status}).`);

  const roles = (await res.json()) as DiscordRole[];
  return cacheSet(key, roles, 60 * 1000);
}

/** Fetch a single user with the bot token (cached 10 minutes). */
export async function getDiscordUser(userId: string): Promise<DiscordUser | null> {
  const key = `user:${userId}`;
  const cached = cacheGet<DiscordUser | null>(key);
  if (cached !== undefined) return cached;

  const res = await fetch(`${DISCORD_API}/users/${userId}`, {
    headers: { Authorization: `Bot ${botToken()}` },
    cache: "no-store",
  });
  if (res.status === 404) return cacheSet(key, null, 10 * 60 * 1000);
  if (!res.ok) throw new Error(`Failed to fetch user (Discord ${res.status}).`);

  const user = (await res.json()) as DiscordUser;
  return cacheSet(key, user, 10 * 60 * 1000);
}

export interface ResolvedUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

/** Resolve many user IDs at once (bounded + cached), for tables and logs. */
export async function resolveUsers(userIds: string[]): Promise<Record<string, ResolvedUser>> {
  const unique = [...new Set(userIds.filter(Boolean))].slice(0, 40);
  const out: Record<string, ResolvedUser> = {};

  // Small concurrency pool so we never spam Discord.
  const queue = [...unique];
  const workers = Array.from({ length: 5 }, async () => {
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id) continue;
      try {
        const user = await getDiscordUser(id);
        if (user) {
          out[id] = {
            id: user.id,
            username: user.username,
            displayName: user.global_name || user.username,
            avatar: avatarUrl(user, 64),
          };
        }
      } catch {
        // Ignore individual failures — the table falls back to the raw ID.
      }
    }
  });

  await Promise.all(workers);
  return out;
}
