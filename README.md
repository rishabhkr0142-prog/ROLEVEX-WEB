# ROLEVEX — Web Dashboard

Premium, dark-mode dashboard for the **ROLEVEX** Discord temp-role management bot.

The website and the bot are **separate projects sharing the same MongoDB
database**. This repository contains only the website: Discord OAuth2 login,
per-server configuration, live temp-role tables, role history, and owner-only
no-prefix management.

> **No background jobs live here.** The site runs on Vercel serverless
> functions — all role expiry logic is executed by the bot.

---

## Features

| Page | What it does |
| --- | --- |
| `/` | Hero, feature cards, Discord Components V2-style command preview, live stats, Invite + Login CTAs |
| `/commands` | Every command with usage, examples (click to copy) and duration units `s m h d w mo` |
| `/login` | Discord OAuth2 (`identify`, `guilds`) with scope explanation |
| `/dashboard` | Your servers where you have **Manage Server / Administrator / owner**. "Manage" if the bot is present, "Invite ROLEVEX" otherwise |
| `/dashboard/[guildId]` | Change prefix, set log channel, active temp roles with live countdowns, recent add/remove/expire history |
| `/owner/noprefix` | **Owners only (403 otherwise, link hidden from navbar).** Add a user by Discord ID with avatar/username preview, remove, search, pagination |

**Stack:** Next.js 14 (App Router) · Tailwind CSS · mongoose · NextAuth
(Discord) · lucide-react · TypeScript · Vercel-ready.

---

## 1. Prerequisites

- Node.js 18.17+ (20 LTS recommended)
- A MongoDB Atlas database (**the same one the ROLEVEX bot uses**)
- A Discord application (Developer Portal)

---

## 2. Discord Developer Portal setup

1. Go to <https://discord.com/developers/applications> → **New Application**.
2. **OAuth2** tab:
   - Copy **Client ID** and **Client Secret**.
   - Add these **Redirect URLs**:

   | Environment | Redirect URL |
   | --- | --- |
   | Local | `http://localhost:3000/api/auth/callback/discord` |
   | Production | `https://YOUR-VERCEL-APP.vercel.app/api/auth/callback/discord` |

   > Add both. Vercel preview deployments use
   > `https://YOUR-PROJECT-*.vercel.app/api/auth/callback/discord` (add a
   > redirect URL with a wildcard pattern if you need previews to log in).
3. **Bot** tab:
   - Copy the **Bot Token** (server-side only — never exposed to the browser).
   - Enable **Privileged Gateway Intents** only if your bot needs them; the
     website does not.
4. Build an invite link (or set `BOT_INVITE_URL`):
   `https://discord.com/oauth2/authorize?client_id=CLIENT_ID&permissions=268438528&scope=bot%20applications.commands`
   (Manage Roles + View/Send Messages). ROLEVEX's highest role must sit above
   every role it grants.

---

## 3. MongoDB Atlas setup

1. Create a cluster (M0 free tier is fine) in the **same project the bot uses**.
2. **Database Access** → create a user with read/write on the database.
3. **Network Access** → **Add IP Address → `0.0.0.0/0` (Allow Access From Anywhere)**
   — required for Vercel serverless, which uses changing outbound IPs.
4. **Connect → Drivers** → copy the connection string into `MONGO_URI`
   (e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/rolevex`).

The website expects these collections created by the bot (names are fixed):

| Model | Collection | Key fields |
| --- | --- | --- |
| `GuildConfig` | `guildconfigs` | `guildId` (unique), `prefix`, `logChannelId` |
| `NoPrefix` | `noprefixes` | `userId` (unique), `addedBy`, `addedAt` |
| `TempRole` | `temproles` | `guildId`, `userId`, `roleId`, `expiresAt`, `addedBy` |
| `RoleLog` | `rolelogs` | `guildId`, `action` (`add`\|`remove`\|`expire`), `userId`, `roleId`, `by`, `at` |

Never rename these fields — the bot and website read and write the same data.

---

## 4. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord OAuth2 application |
| `DISCORD_BOT_TOKEN` | Server-side only: check guilds/roles/users |
| `MONGO_URI` | Shared MongoDB connection string |
| `BOT_OWNER_IDS` | Comma-separated IDs with full bot + website control |
| `WEBSITE_OWNER_IDS` | Comma-separated IDs with website owner tools only |
| `NEXTAUTH_URL` / `SITE_URL` | Base URL — `http://localhost:3000` locally, your Vercel URL in prod |
| `NEXTAUTH_SECRET` | Session/JWT encryption secret (`openssl rand -base64 32`) |
| `BOT_INVITE_URL` | Invite button target |
| `SUPPORT_URL` | Footer support link |

**Owner detection is 100% server-side and comes only from `.env`**: a logged-in
user is an owner exactly when their Discord ID is listed in `BOT_OWNER_IDS` or
`WEBSITE_OWNER_IDS`. The client is never trusted for ownership.

---

## 5. Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Log in at <http://localhost:3000/login>. Add your own Discord ID to
`WEBSITE_OWNER_IDS` (or `BOT_OWNER_IDS`) to unlock `/owner/noprefix`.

```bash
npm run build   # production build + type checking
npm run start   # serve the production build
```

---

## 6. Deploy to Vercel (step by step)

1. Push this folder to a GitHub repository.
2. Go to <https://vercel.com/new> → **Import** the repository. Framework
   preset: **Next.js** (auto-detected; `vercel.json` is included).
3. **Settings → Environment Variables** — add every variable from
   `.env.example`:

   | Name | Value |
   | --- | --- |
   | `DISCORD_CLIENT_ID` | from the Developer Portal |
   | `DISCORD_CLIENT_SECRET` | from the Developer Portal |
   | `DISCORD_BOT_TOKEN` | bot token (server-side only) |
   | `MONGO_URI` | Atlas connection string (`0.0.0.0/0` allowed) |
   | `BOT_OWNER_IDS` | `111111111111111111,222222222222222222` |
   | `WEBSITE_OWNER_IDS` | `333333333333333333,444444444444444444` |
   | `NEXTAUTH_URL` | `https://YOUR-APP.vercel.app` |
   | `SITE_URL` | `https://YOUR-APP.vercel.app` |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `BOT_INVITE_URL` | your invite link |
   | `SUPPORT_URL` | support server link |

   Set them for **Production, Preview and Development**, then click **Deploy**.
4. After the first deploy, copy the real URL
   (`https://YOUR-APP.vercel.app`) back into:
   - Discord Developer Portal → OAuth2 → **Redirects** →
     `https://YOUR-APP.vercel.app/api/auth/callback/discord`
   - Vercel env vars → `NEXTAUTH_URL` and `SITE_URL`
   - Vercel → **Deployments → … → Redeploy** (env changes need a redeploy).
5. Open the site, log in, and check `/dashboard`.

---

## 7. Project structure

```
ROLEVEX-WEB/
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── vercel.json
├── public/                    # icon.svg, avatar-fallback.svg
└── src/
    ├── app/
    │   ├── layout.tsx         # fonts, metadata (ROLEVEX branding), navbar/footer
    │   ├── globals.css        # glassmorphism, buttons, Discord container styles
    │   ├── page.tsx           # Home
    │   ├── commands/page.tsx
    │   ├── login/page.tsx
    │   ├── dashboard/page.tsx
    │   ├── dashboard/[guildId]/page.tsx
    │   ├── owner/noprefix/page.tsx        # 403 for non-owners
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       ├── guilds/route.ts            # GET manageable servers
    │       ├── guilds/[guildId]/config/route.ts   # GET / PATCH prefix + log channel
    │       ├── guilds/[guildId]/temproles/route.ts
    │       ├── guilds/[guildId]/logs/route.ts
    │       ├── owner/lookup/route.ts      # preview a Discord user (owner only)
    │       └── owner/noprefix/…           # GET list · POST add · DELETE remove
    ├── components/            # Navbar, Footer, home/, dashboard/, owner/, login/
    └── lib/
        ├── auth.ts            # NextAuth options + session helpers
        ├── api.ts             # session guard, CSRF/origin guard, rate limit, guild access
        ├── db.ts              # cached mongoose connection (serverless-safe)
        ├── discord.ts         # bot/user Discord REST helpers + TTL cache
        ├── env.ts             # owner lists from .env, invite/support URLs
        ├── models.ts          # GuildConfig / NoPrefix / TempRole / RoleLog
        ├── commands.ts        # command catalogue for /commands
        ├── dashboard.ts       # dashboard + home stats queries
        ├── ratelimit.ts       # token-bucket limiter
        └── validate.ts        # snowflake/prefix validation, duration formatting
```

---

## 8. Security model

- **Session verification** — every API route calls `requireSession()`; nothing
  is reachable anonymously.
- **Permission checks** — guild routes re-fetch the *user's* guild list from
  Discord with their own OAuth token and require owner / Manage Server /
  Administrator. Bot presence is checked with the bot token.
- **Owner routes** — `/owner/noprefix` and its APIs call `isOwner()` which only
  reads `BOT_OWNER_IDS` / `WEBSITE_OWNER_IDS` from `.env`.
- **Input validation** — all IDs must be 15–25 digit snowflakes; prefixes are
  restricted to 1–5 printable ASCII characters without spaces/backticks/@;
  log channels must exist in the target guild.
- **CSRF** — state-changing requests verify the `Origin` header against
  `SITE_URL`; cookies are signed httpOnly + `SameSite=Lax`.
- **Rate limiting** — token-bucket limits on every write endpoint, keyed per
  user + route (in-memory; swap for Redis/Upstash if you need a global limit).
- **Secrets** — `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_SECRET` and `MONGO_URI`
  are read only in server code and never shipped to the browser.
- **Data** — a single cached mongoose connection is reused across warm
  serverless invocations.

---

## 9. Commands reference (bot side)

```
role @user @role          → permanent until removed
role @user @role 7d       → auto-revoke after 7 days
role @user @role 12h msg  → 12 hours with a reason
remove @user @role        → remove now + delete timer
temproles [@user]         → list active temp roles
check @user               → a user's temp roles
expire @user @role        → expire immediately (logged as "expire")
prefix / prefix set <p>   → view / change prefix
setlog #channel / off     → set the log channel
help · ping · about       → utility
```

Duration units: `s` seconds · `m` **minutes** · `h` hours · `d` days ·
`w` weeks · `mo` months.

---

## 10. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Configuration - NEXTAUTH_SECRET` error | Set `NEXTAUTH_SECRET` in `.env.local` / Vercel and redeploy |
| Login redirects to Discord then fails | Redirect URL mismatch — add `/api/auth/callback/discord` exactly |
| Dashboard shows "Could not reach Discord" | Token expired → log out and back in (refreshes `guilds` scope) |
| Empty stats on Home | `MONGO_URI` unreachable from your network, or the bot has not run yet |
| `Forbidden` on `/owner/noprefix` | Your ID is not in `BOT_OWNER_IDS` / `WEBSITE_OWNER_IDS` |
| Changes don't save | Check the console for 429 (rate limit) or 403 (Origin/permission) |

---

## License

MIT — built for ROLEVEX.
#   R O L E V E X - W E B  
 