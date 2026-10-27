import type { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { isOwner } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      // Discord now returns the RFC 9207 `iss` param in the callback, so
      // next-auth needs the issuer configured to validate it.
      issuer: "https://discord.com/oauth2",
      // `guilds` is required to list the user's servers on the dashboard.
      authorization: { params: { scope: "identify guilds" } },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account }) {
      // Keep the OAuth access token inside the encrypted JWT so API routes
      // can call the Discord API as the logged-in user (user guild list).
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        // Owner flag is decided HERE, server-side, purely from BOT_OWNER_IDS /
        // WEBSITE_OWNER_IDS in .env. It is only used to show UI hints — every
        // API route re-checks ownership independently.
        session.user.isOwner = isOwner(token.sub);
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

/** Returns the logged-in user (with id) or null. */
export async function getSessionUser(): Promise<Session["user"] | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    return session.user;
  } catch {
    // Missing/invalid NextAuth configuration or an unreadable cookie:
    // treat as "not logged in" instead of crashing the page.
    return null;
  }
}

/** Returns the full session (includes the Discord OAuth access token). */
export async function getSession(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}
