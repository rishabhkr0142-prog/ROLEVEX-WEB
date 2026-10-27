import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { NoPrefix } from "@/lib/models";
import { apiError, guardWrite, json, requireSession } from "@/lib/api";
import { isOwner } from "@/lib/env";
import { avatarUrl, getDiscordUser, resolveUsers } from "@/lib/discord";
import { isSnowflake } from "@/lib/validate";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const PAGE_SIZE_MAX = 25;
const RESOLVE_SEARCH_CAP = 300;

/**
 * GET /api/owner/noprefix?search=&page=&pageSize=
 * Owner-only paginated list of the NoPrefix collection. Usernames are resolved
 * through the Discord API (bot token, cached) and never stored on this side.
 */
export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session?.user?.id) return apiError("Unauthorized.", 401);
  const me = session.user.id;
  if (!isOwner(me)) return apiError("Forbidden.", 403);

  if (!rateLimit(`noprefix:get:${me}`, { limit: 120, windowMs: 60_000 })) {
    return apiError("Too many requests.", 429);
  }

  const params = req.nextUrl.searchParams;
  const search = (params.get("search") ?? "").trim().slice(0, 40);
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, Number(params.get("pageSize") ?? 10) || 10)
  );

  try {
    await connectDB();

    // Numeric search → snowflake prefix match (cheap, uses the unique index).
    // Username search → resolve every entry (bounded) and filter in memory.
    let filter: Record<string, unknown> = {};
    let usernameMatches: Set<string> | null = null;

    if (search) {
      if (/^\d+$/.test(search)) {
        filter = { userId: { $regex: `^${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` } };
      } else {
        const all = await NoPrefix.find({}).sort({ addedAt: -1 }).limit(RESOLVE_SEARCH_CAP).lean();
        const users = await resolveUsers(all.map((d) => d.userId));
        const needle = search.toLowerCase();
        const matched = all.filter((doc) => {
          const user = users[doc.userId];
          const name = user ? `${user.displayName} ${user.username}` : doc.userId;
          return name.toLowerCase().includes(needle);
        });
        usernameMatches = new Set(matched.map((d) => d.userId));
        filter = { userId: { $in: [...usernameMatches] } };
      }
    }

    const total = await NoPrefix.countDocuments(filter);
    const docs = await NoPrefix.find(filter)
      .sort({ addedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const users = await resolveUsers(docs.flatMap((d) => [d.userId, d.addedBy]));

    return json({
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      items: docs.map((doc) => {
        const user = users[doc.userId];
        const addedByUser = users[doc.addedBy];
        return {
          userId: doc.userId,
          addedBy: doc.addedBy,
          addedAt: doc.addedAt.toISOString(),
          username: user?.displayName ?? doc.userId,
          rawUsername: user?.username ?? null,
          avatar: user?.avatar ?? null,
          addedByName: addedByUser?.displayName ?? `#${doc.addedBy.slice(-4)}`,
        };
      }),
    });
  } catch (err) {
    console.error("noprefix list failed:", err);
    return apiError("Could not load the no-prefix list.", 500);
  }
}

/**
 * POST /api/owner/noprefix  { userId }
 * Owner-only: write directly to the NoPrefix collection. The bot reads this
 * collection live, so no restart is required.
 */
export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session?.user?.id) return apiError("Unauthorized.", 401);
  const me = session.user.id;
  if (!isOwner(me)) return apiError("Forbidden.", 403);

  // CSRF (Origin must match) + per-user rate limit for this write endpoint.
  const blocked = guardWrite(req, me, { limit: 8, windowMs: 60_000 });
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  if (!isSnowflake(userId)) {
    return apiError("Enter a valid Discord user ID (15–25 digits).", 400);
  }

  try {
    // Preview data must exist before we write anything.
    const user = await getDiscordUser(userId);
    if (!user) return apiError("Discord user not found.", 404);
    if (user.bot) return apiError("Bots cannot be added to the no-prefix list.", 400);

    await connectDB();
    const existing = await NoPrefix.findOne({ userId }).lean();
    if (existing) return apiError("That user is already on the no-prefix list.", 409);

    await NoPrefix.create({ userId, addedBy: me, addedAt: new Date() });

    return json({
      ok: true,
      entry: {
        userId,
        addedBy: me,
        addedAt: new Date().toISOString(),
        username: user.global_name || user.username,
        rawUsername: user.username,
        avatar: avatarUrl(user, 64),
        addedByName: "you",
      },
    });
  } catch (err) {
    // MongoDB duplicate key error (code 11000) — unique index on userId.
    const mongoCode = (err as { code?: number } | null)?.code;
    const mongoName = (err as { name?: string } | null)?.name;
    if (mongoCode === 11000 || mongoName === "MongoServerError") {
      return apiError("That user is already on the no-prefix list.", 409);
    }
    console.error("noprefix add failed:", err);
    return apiError("Could not add the user.", 500);
  }
}
