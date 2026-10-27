import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { GuildConfig } from "@/lib/models";
import {
  apiError,
  botIsIn,
  guardWrite,
  json,
  requireSession,
  verifyGuildAccess,
} from "@/lib/api";
import { getGuildChannels } from "@/lib/discord";
import { isSnowflake, isValidPrefix } from "@/lib/validate";

export const dynamic = "force-dynamic";

/**
 * GET /api/guilds/[guildId]/config
 * Current GuildConfig + the text channels available for the log picker.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { guildId: string } }
) {
  const session = await requireSession();
  if (!session) return apiError("Unauthorized.", 401);
  if (!isSnowflake(params.guildId)) return apiError("Invalid guild id.", 400);

  const access = await verifyGuildAccess(session, params.guildId);
  if (!access.ok) return apiError(access.reason, access.status);

  try {
    await connectDB();
    const config = await GuildConfig.findOne({ guildId: params.guildId }).lean();
    const channels = await getGuildChannels(params.guildId).catch(() => []);

    return json({
      config: {
        guildId: params.guildId,
        prefix: config?.prefix ?? "r!",
        logChannelId: config?.logChannelId ?? "",
      },
      channels: channels.map((c) => ({ id: c.id, name: c.name })),
    });
  } catch {
    return apiError("Could not load the server configuration.", 500);
  }
}

/**
 * PATCH /api/guilds/[guildId]/config
 * Update the prefix and/or the log channel. Writes to the shared
 * `guildconfigs` collection — the bot picks the change up immediately.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { guildId: string } }
) {
  const session = await requireSession();
  if (!session?.user?.id) return apiError("Unauthorized.", 401);
  if (!isSnowflake(params.guildId)) return apiError("Invalid guild id.", 400);

  const blocked = guardWrite(req, session.user.id, { limit: 12, windowMs: 60_000 });
  if (blocked) return blocked;

  const access = await verifyGuildAccess(session, params.guildId);
  if (!access.ok) return apiError(access.reason, access.status);

  if (!(await botIsIn(params.guildId))) {
    return apiError("ROLEVEX has not been invited to this server yet.", 400);
  }

  let body: { prefix?: unknown; logChannelId?: unknown };
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body.", 400);
  }

  const update: Record<string, string> = {};

  if (body.prefix !== undefined) {
    if (!isValidPrefix(body.prefix)) {
      return apiError(
        "Prefix must be 1–5 printable characters without spaces, backticks or @.",
        400
      );
    }
    update.prefix = body.prefix.trim();
  }

  if (body.logChannelId !== undefined) {
    const channelId = body.logChannelId;
    if (channelId === "") {
      update.logChannelId = "";
    } else {
      if (!isSnowflake(channelId)) return apiError("Invalid channel id.", 400);
      // The channel must be a text channel in THIS guild that the bot can see.
      const channels = await getGuildChannels(params.guildId).catch(() => null);
      if (!channels || !channels.some((c) => c.id === channelId)) {
        return apiError("That channel is not a usable text channel in this server.", 400);
      }
      update.logChannelId = channelId;
    }
  }

  if (Object.keys(update).length === 0) {
    return apiError("Nothing to update.", 400);
  }

  try {
    await connectDB();
    const config = await GuildConfig.findOneAndUpdate(
      { guildId: params.guildId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return json({
      ok: true,
      config: {
        guildId: params.guildId,
        prefix: config?.prefix ?? "r!",
        logChannelId: config?.logChannelId ?? "",
      },
    });
  } catch {
    return apiError("Could not save the configuration.", 500);
  }
}
