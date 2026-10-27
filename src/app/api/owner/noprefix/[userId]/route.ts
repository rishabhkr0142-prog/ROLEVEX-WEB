import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { NoPrefix } from "@/lib/models";
import { apiError, guardWrite, json, requireSession } from "@/lib/api";
import { isOwner } from "@/lib/env";
import { isSnowflake } from "@/lib/validate";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/owner/noprefix/[userId]
 * Owner-only: remove a user from the NoPrefix collection.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await requireSession();
  if (!session?.user?.id) return apiError("Unauthorized.", 401);
  const me = session.user.id;
  if (!isOwner(me)) return apiError("Forbidden.", 403);
  if (!isSnowflake(params.userId)) return apiError("Invalid user id.", 400);

  const blocked = guardWrite(req, me, { limit: 20, windowMs: 60_000 });
  if (blocked) return blocked;

  try {
    await connectDB();
    const result = await NoPrefix.deleteOne({ userId: params.userId });
    if (result.deletedCount === 0) {
      return apiError("That user is not on the no-prefix list.", 404);
    }
    return json({ ok: true, userId: params.userId });
  } catch (err) {
    console.error("noprefix delete failed:", err);
    return apiError("Could not remove the user.", 500);
  }
}
