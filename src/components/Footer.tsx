import Link from "next/link";
import { Heart, LifeBuoy, MessageCircle } from "lucide-react";
import { LogoMark, LogoText } from "@/components/Logo";
import { botInviteUrl, supportUrl } from "@/lib/env";

export function Footer() {
  const invite = botInviteUrl();
  const support = supportUrl();

  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-ink-950/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-7 w-7" />
              <LogoText />
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              Timed roles made simple. Grant, schedule and revoke Discord roles
              from one premium dashboard.
            </p>
          </div>

          <div>
            <p className="label">Product</p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/" className="transition hover:text-accent-light">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/commands" className="transition hover:text-accent-light">
                  Commands
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition hover:text-accent-light">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="label">Account</p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/login" className="transition hover:text-accent-light">
                  Login with Discord
                </Link>
              </li>
              <li>
                <a href={invite} target="_blank" rel="noopener noreferrer" className="transition hover:text-accent-light">
                  Invite the bot
                </a>
              </li>
              {support && (
                <li>
                  <a href={support} target="_blank" rel="noopener noreferrer" className="transition hover:text-accent-light">
                    Support server
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className="label">Resources</p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="transition hover:text-accent-light">
                  Discord Developer Portal
                </a>
              </li>
              <li>
                <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" className="transition hover:text-accent-light">
                  Next.js docs
                </a>
              </li>
              {support && (
                <li className="flex items-center gap-1.5">
                  <LifeBuoy className="h-3.5 w-3.5 text-accent" />
                  <a href={support} target="_blank" rel="noopener noreferrer" className="transition hover:text-accent-light">
                    Get help
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} ROLEVEX. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            Made with <Heart className="h-3.5 w-3.5 text-danger" /> for Discord
            communities
            {support && (
              <>
                <span className="text-zinc-700">·</span>
                <a
                  href={support}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition hover:text-accent-light"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Support
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
