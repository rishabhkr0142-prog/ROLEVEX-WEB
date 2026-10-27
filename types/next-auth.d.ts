import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** True when the ID is in BOT_OWNER_IDS / WEBSITE_OWNER_IDS (.env). */
      isOwner?: boolean;
    } & DefaultSession["user"];
    /** Discord OAuth access token (identify + guilds). Server-side only. */
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
