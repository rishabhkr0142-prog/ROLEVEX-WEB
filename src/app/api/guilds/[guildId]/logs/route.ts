import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { RoleLog } from "@/lib/models";
import {
  apiError,
  json,
  requireSession,
  verifyGuildAccess,
} from "@/lib/api";
import { getGuildRoles, resolveUsers } from "@/lib/discord";
import { isSnowflake } from "@/lib/validate";

export const dynamic = "force-dynamic";

/**
 * GET /api/guilds/[guildId]/logs
 * Recent role history (add / remove / expire) for a guild.
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
    const docs = await RoleLog.find({ guildId: params.guildId })
      .sort({ at: -1 })
      .limit(50)
      .lean();

    const [users, roles] = await Promise.all([
      resolveUsers(docs.flatMap((d) => [d.userId, d.by])),
      getGuildRoles(params.guildId).catch(() => []),
    ]);
    const roleMap = new Map(roles.map((r) => [r.id, r]));

    return json({
      serverNow: Date.now(),
      logs: docs.map((doc) => ({
        action: doc.action,
        userId: doc.userId,
        roleId: doc.roleId,
        roleName: roleMap.get(doc.roleId)?.name ?? `role ${doc.roleId}`,
        roleColor: roleMap.get(doc.roleId)?.color ?? 0,
        by: doc.by,
        at: doc.at.toISOString(),
        user: users[doc.userId] ?? null,
        byUser: users[doc.by] ?? null,
      })),
    });
  } catch {
    return apiError("Could not load the role log.", 500);
  }
}
