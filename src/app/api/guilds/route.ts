import { NextResponse } from "next/server";
import { requireSession, apiError } from "@/lib/api";
import { getManageableGuilds } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

/**
 * GET /api/guilds
 * The logged-in user's manageable servers, annotated with bot presence.
 */
export async function GET() {
  const session = await requireSession();
  if (!session) return apiError("Unauthorized.", 401);

  try {
    const guilds = await getManageableGuilds(session);
    return NextResponse.json({ guilds });
  } catch {
    return apiError("Could not fetch your servers from Discord.", 502);
  }
}
