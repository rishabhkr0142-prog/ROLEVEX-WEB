"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BadgeCheck, ChevronDown, LayoutDashboard, LogOut, Menu, Shield, X } from "lucide-react";
import { LogoMark, LogoText } from "@/components/Logo";

interface NavLink {
  href: string;
  label: string;
  ownerOnly?: boolean;
}

const LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/commands", label: "Commands" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/owner/noprefix", label: "No-Prefix", ownerOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const isOwnerBadge = Boolean(user?.isOwner);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const visibleLinks = LINKS.filter((link) => !link.ownerOnly || isOwnerBadge);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-1000/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[18deg]" />
          <LogoText />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[3px] h-0.5 rounded-full bg-accent shadow-[0_0_12px_rgba(124,92,255,0.9)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {status === "authenticated" && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] py-1.5 pl-1.5 pr-2.5 transition hover:border-white/25 hover:bg-white/[0.09]"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.image ?? "/avatar-fallback.svg"}
                  alt=""
                  className="h-7 w-7 rounded-lg bg-ink-700 object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden max-w-[9rem] truncate text-sm font-semibold text-zinc-100 sm:block">
                  {user.name ?? "Discord user"}
                </span>
                {isOwnerBadge && (
                  <span className="hidden items-center gap-1 rounded-md border border-accent/40 bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-light sm:inline-flex">
                    Owner
                  </span>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-ink-850/95 shadow-card backdrop-blur-xl animate-fadeUp">
                  <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.image ?? "/avatar-fallback.svg"}
                      alt=""
                      className="h-9 w-9 rounded-full bg-ink-700 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.name ?? "Discord user"}
                      </p>
                      <p className="truncate font-mono text-[11px] text-zinc-500">
                        ID {user.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 px-4 pt-3">
                    <span className="badge">
                      <BadgeCheck className="h-3 w-3 text-success" /> Logged in
                    </span>
                    {isOwnerBadge && (
                      <span className="badge border-accent/40 bg-accent/15 text-accent-light">
                        <Shield className="h-3 w-3" /> Owner
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col gap-0.5 border-t border-white/[0.07] p-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link
                      href="/owner/noprefix"
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-white/[0.07] hover:text-white ${
                        isOwnerBadge ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      <Shield className="h-4 w-4" /> Owner tools
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-danger transition hover:bg-danger/10"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : status === "loading" ? (
            <div className="h-9 w-28 animate-pulse rounded-xl border border-white/10 bg-white/[0.05]" />
          ) : (
            <>
              <Link href="/commands" className="btn-ghost btn-sm hidden sm:inline-flex">
                Commands
              </Link>
              <Link href="/login" className="btn-primary btn-sm">
                Login with Discord
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            className="btn-ghost btn-sm md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-ink-950/95 px-4 py-3 md:hidden animate-fadeUp">
          <div className="flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  pathname === link.href
                    ? "bg-accent/15 text-accent-light"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {status !== "authenticated" && (
              <Link href="/login" className="btn-primary mt-1">
                Login with Discord
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
