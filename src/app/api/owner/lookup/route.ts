import { NextRequest } from "next/server";
import { apiError, json, requireSession } from "@/lib/api";
import { isOwner } from "@/lib/env";
import { avatarUrl, getDiscordUser } from "@/lib/discord";
import { isSnowflake } from "@/lib/validate";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * GET /api/owner/lookup?userId=1234…
 * Owner-only: preview a Discord user (avatar + username) before adding them
 * to the NoPrefix collection.
 */
export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session?.user?.id) return apiError("Unauthorized.", 401);
  if (!isOwner(session.user.id)) return apiError("Forbidden.", 403);

  if (!rateLimit(`lookup:${session.user.id}`, { limit: 60, windowMs: 60_000 })) {
    return apiError("Too many requests.", 429);
  }

  const userId = req.nextUrl.searchParams.get("userId") ?? "";
  if (!isSnowflake(userId)) return apiError("Enter a valid Discord user ID.", 400);

  try {
    const user = await getDiscordUser(userId);
    if (!user) return apiError("Discord user not found.", 404);
    if (user.bot) return apiError("Bots cannot be added to the no-prefix list.", 400);

    return json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.global_name || user.username,
        avatar: avatarUrl(user, 128),
        bot: Boolean(user.bot),
      },
    });
  } catch {
    return apiError("Could not reach Discord. Try again shortly.", 502);
  }
}
