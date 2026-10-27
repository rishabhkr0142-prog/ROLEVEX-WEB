import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { TempRole } from "@/lib/models";
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
 * GET /api/guilds/[guildId]/temproles
 * Active temp roles for a guild, with resolved user + role info.
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
    const docs = await TempRole.find({ guildId: params.guildId })
      .sort({ expiresAt: 1 })
      .limit(250)
      .lean();

    const [users, roles] = await Promise.all([
      resolveUsers(docs.flatMap((d) => [d.userId, d.addedBy])),
      getGuildRoles(params.guildId).catch(() => []),
    ]);
    const roleMap = new Map(roles.map((r) => [r.id, r]));

    return json({
      serverNow: Date.now(),
      temproles: docs.map((doc) => {
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
      }),
    });
  } catch {
    return apiError("Could not load temp roles.", 500);
  }
}
