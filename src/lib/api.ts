import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, type RateLimitOptions } from "@/lib/ratelimit";
import { canManageGuild, isBotInGuild, getUserGuilds, type DiscordGuild } from "@/lib/discord";
import { siteUrl } from "@/lib/env";
import type { Session } from "next-auth";

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function apiError(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

/** Session guard used by every API route. */
export async function requireSession(): Promise<Session | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    return session;
  } catch {
    return null;
  }
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Guard for state-changing (POST/PATCH/DELETE) endpoints:
 *  1. Verifies the Origin header against SITE_URL (CSRF protection — the
 *     session cookie is also SameSite=Lax, so this is defence in depth).
 *  2. Applies a per-user rate limit.
 * Returns a NextResponse to send on failure, or null when the request is OK.
 */
export function guardWrite(
  req: NextRequest,
  userId: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60_000 }
): NextResponse | null {
  const origin = req.headers.get("origin");
  const expected = siteUrl();

  if (expected && expected !== "http://localhost:3000") {
    if (!origin || origin.replace(/\/+$/, "") !== expected) {
      return apiError("Invalid request origin.", 403);
    }
  } else if (origin && origin.replace(/\/+$/, "") !== expected) {
    return apiError("Invalid request origin.", 403);
  }

  const key = `write:${userId}:${req.nextUrl.pathname}`;
  if (!rateLimit(key, options)) {
    return apiError("Too many requests — please slow down.", 429);
  }

  return null;
}

export type GuildAccessResult =
  | { ok: true; guild: DiscordGuild }
  | { ok: false; status: number; reason: string };

/**
 * Server-side verification that the logged-in user may manage this guild
 * (owner, Manage Server, or Administrator).
 */
export async function verifyGuildAccess(
  session: Session,
  guildId: string
): Promise<GuildAccessResult> {
  if (!session.accessToken) {
    return {
      ok: false,
      status: 401,
      reason: "Your session is missing guild permissions. Please sign in again.",
    };
  }

  let guilds: DiscordGuild[];
  try {
    guilds = await getUserGuilds(session.accessToken);
  } catch {
    return { ok: false, status: 502, reason: "Could not verify your servers with Discord." };
  }

  const guild = guilds.find((g) => g.id === guildId);
  if (!guild) {
    return { ok: false, status: 403, reason: "You are not a member of this server." };
  }
  if (!canManageGuild(guild)) {
    return {
      ok: false,
      status: 403,
      reason: "You need the Manage Server permission to configure ROLEVEX here.",
    };
  }

  return { ok: true, guild };
}

/** True when the bot is currently a member of the guild. */
export async function botIsIn(guildId: string): Promise<boolean> {
  try {
    return await isBotInGuild(guildId);
  } catch {
    return false;
  }
}
