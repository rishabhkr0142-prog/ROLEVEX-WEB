/**
 * Environment access. Owner detection happens ONLY here, from .env lists.
 * Never trust anything the client sends about ownership.
 */

function parseIdList(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^\d{15,25}$/.test(id));
}

/** Users with full bot + website control. */
export function botOwnerIds(): Set<string> {
  return new Set(parseIdList(process.env.BOT_OWNER_IDS));
}

/** Users with website-owner tools only (e.g. /owner/noprefix). */
export function websiteOwnerIds(): Set<string> {
  return new Set(parseIdList(process.env.WEBSITE_OWNER_IDS));
}

/** A user is an owner ONLY if their Discord ID is in one of the .env lists. */
export function isOwner(userId?: string | null): boolean {
  if (!userId) return false;
  return botOwnerIds().has(userId) || websiteOwnerIds().has(userId);
}

export function siteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function botInviteUrl(): string {
  if (process.env.BOT_INVITE_URL) return process.env.BOT_INVITE_URL;
  const clientId = process.env.DISCORD_CLIENT_ID ?? "";
  // Manage Roles + View/ Send Messages in the log channel.
  return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=268438528&scope=bot%20applications.commands`;
}

export function supportUrl(): string {
  return process.env.SUPPORT_URL || "";
}
