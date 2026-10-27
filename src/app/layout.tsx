import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = (
  process.env.SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ROLEVEX — Discord Temp Role Management",
    template: "%s · ROLEVEX",
  },
  description:
    "ROLEVEX is the premium Discord bot for timed roles. Grant a role for 7 days, 12 hours or 30 minutes — ROLEVEX removes it automatically. Manage everything from this dashboard.",
  keywords: [
    "Discord",
    "bot",
    "temp role",
    "temporary role",
    "role management",
    "ROLEVEX",
    "dashboard",
  ],
  applicationName: "ROLEVEX",
  authors: [{ name: "ROLEVEX" }],
  openGraph: {
    type: "website",
    siteName: "ROLEVEX",
    title: "ROLEVEX — Discord Temp Role Management",
    description:
      "Timed roles made simple. Grant, schedule and revoke Discord roles from one premium dashboard.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ROLEVEX — Discord Temp Role Management",
    description:
      "Timed roles made simple. Grant, schedule and revoke Discord roles from one premium dashboard.",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport = {
  themeColor: "#08080C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
