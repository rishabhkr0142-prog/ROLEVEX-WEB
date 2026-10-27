/**
 * The ROLEVEX command catalogue displayed on /commands.
 * The prefix is `r!` by default and can be changed per server
 * (GuildConfig.prefix) — the UI uses `r!` as the documented example.
 */

export const DEFAULT_PREFIX = "r!";

export interface Command {
  name: string;
  usage: string;
  summary: string;
  examples: string[];
  permissions?: string;
}

export interface CommandGroup {
  id: string;
  title: string;
  description: string;
  icon: "clock" | "shield" | "settings" | "utility";
  commands: Command[];
}

export const DURATION_UNITS = [
  { unit: "s", label: "seconds", example: "30s", description: "30 seconds" },
  { unit: "m", label: "minutes", example: "45m", description: "45 minutes (NOT months)" },
  { unit: "h", label: "hours", example: "12h", description: "12 hours" },
  { unit: "d", label: "days", example: "7d", description: "7 days" },
  { unit: "w", label: "weeks", example: "2w", description: "2 weeks" },
  { unit: "mo", label: "months", example: "6mo", description: "6 months" },
];

export const COMMAND_GROUPS: CommandGroup[] = [
  {
    id: "temporary-roles",
    title: "Temporary roles",
    description: "Grant, inspect and revoke timed roles.",
    icon: "clock",
    commands: [
      {
        name: "role",
        usage: "role <@user> <@role> [duration] [reason]",
        summary:
          "Grant a role immediately. Add a duration and ROLEVEX will revoke it automatically when it expires; without a duration it stays until removed.",
        examples: [
          "role @user @role",
          "role @user @role 7d",
          "role @user @role 12h raid access",
          "role @user @role 30m",
        ],
        permissions: "Manage Roles",
      },
      {
        name: "remove",
        usage: "remove <@user> <@role>",
        summary:
          "Remove a role right now and delete its timer if one was scheduled. Writes a remove entry to the log.",
        examples: ["remove @user @role", "remove @user @Member"],
        permissions: "Manage Roles",
      },
      {
        name: "temproles",
        usage: "temproles [@user]",
        summary:
          "List every active temp role in the server — or only the ones attached to a specific user — with their remaining time.",
        examples: ["temproles", "temproles @user"],
      },
      {
        name: "check",
        usage: "check <@user>",
        summary:
          "Show a single user's temp roles, who granted them, and exactly when each one expires.",
        examples: ["check @user"],
      },
      {
        name: "expire",
        usage: "expire <@user> <@role>",
        summary:
          "End a temp role immediately as an expiry (logged as an expire action instead of a manual remove).",
        examples: ["expire @user @role"],
        permissions: "Manage Roles",
      },
    ],
  },
  {
    id: "setup",
    title: "Server setup",
    description: "Prefix and logging — also editable from this dashboard.",
    icon: "settings",
    commands: [
      {
        name: "prefix",
        usage: "prefix",
        summary: "Show the server's current command prefix.",
        examples: ["prefix"],
      },
      {
        name: "prefix set",
        usage: "prefix set <new prefix>",
        summary:
          "Change the command prefix for this server. 1–5 characters, no spaces. Saved in guildconfigs and applied instantly.",
        examples: ["prefix set ?", "prefix set r!", "prefix set ."],
        permissions: "Manage Server",
      },
      {
        name: "setlog",
        usage: "setlog <#channel>",
        summary:
          "Set the channel where ROLEVEX posts add / remove / expire entries (RoleLog). Use the dashboard for the same setting.",
        examples: ["setlog #mod-logs", "setlog #role-log"],
        permissions: "Manage Server",
      },
      {
        name: "setlog off",
        usage: "setlog off",
        summary: "Disable log posting for this server without clearing your other settings.",
        examples: ["setlog off"],
        permissions: "Manage Server",
      },
    ],
  },
  {
    id: "utility",
    title: "Utility",
    description: "Everyday commands for moderators and members.",
    icon: "utility",
    commands: [
      {
        name: "help",
        usage: "help [command]",
        summary:
          "Show every command, or detailed usage for a single one — e.g. help role.",
        examples: ["help", "help role"],
      },
      {
        name: "ping",
        usage: "ping",
        summary: "Check bot latency and API response time.",
        examples: ["ping"],
      },
      {
        name: "about",
        usage: "about",
        summary:
          "Show ROLEVEX version info, server count, and the invite link for the dashboard.",
        examples: ["about"],
      },
      {
        name: "noprefix",
        usage: "noprefix (owner-approved users only)",
        summary:
          "Users added on the /owner/noprefix page can run every command without typing a prefix at all.",
        examples: ["role @user @role 7d"],
        permissions: "No-prefix entry",
      },
    ],
  },
];

export const TOTAL_COMMANDS = COMMAND_GROUPS.reduce(
  (total, group) => total + group.commands.length,
  0
);
