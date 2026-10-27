import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Lock } from "lucide-react";
import { LoginCard } from "@/components/login/LoginCard";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login with Discord",
  description:
    "Sign in to the ROLEVEX dashboard with Discord (identify + guilds) to manage your servers, prefixes, log channels and temp roles.",
};

export const dynamic = "force-dynamic";

const SECURITY_POINTS = [
  "OAuth2 with the identify and guilds scopes only",
  "Session stored in a signed, httpOnly, SameSite cookie",
  "Permissions re-verified server-side on every request",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await getSession();

  if (session?.user?.id) {
    redirect(searchParams.callbackUrl?.startsWith("/") ? searchParams.callbackUrl : "/dashboard");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24">
      <div className="animate-fadeUp">
        <p className="eyebrow">Sign in</p>
        <h1 className="section-title mt-3">
          Your servers, <span className="text-gradient">one login</span>
        </h1>
        <p className="mt-4 max-w-lg leading-relaxed text-zinc-400">
          ROLEVEX uses Discord&apos;s official OAuth2 flow. We only ask for the
          permissions needed to list the servers you can manage — and every
          request is re-checked on the server before anything changes.
        </p>

        <ul className="mt-7 space-y-3">
          {SECURITY_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-zinc-300">
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-black/25 p-4 text-[13px] leading-relaxed text-zinc-500">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>
            The bot token and database credentials never leave the server. Owner
            tools are unlocked only when your Discord ID is listed in{" "}
            <code className="font-mono text-zinc-300">BOT_OWNER_IDS</code> or{" "}
            <code className="font-mono text-zinc-300">WEBSITE_OWNER_IDS</code>.
          </span>
        </div>
      </div>

      <div className="flex justify-center animate-fadeUp">
        <Suspense
          fallback={
            <div className="glass h-[420px] w-full max-w-md animate-pulse rounded-3xl" />
          }
        >
          <LoginCard />
        </Suspense>
      </div>

      <p className="text-center text-[13px] text-zinc-500 lg:col-span-2">
        Trouble signing in?{" "}
        <Link href="/commands" className="text-accent-light hover:underline">
          Read the command reference
        </Link>{" "}
        or contact support.
      </p>
    </div>
  );
}
