import { Schema, model, models, type Model } from "mongoose";

/**
 * ⚠️ These schemas are SHARED WITH THE DISCORD BOT.
 * Do NOT rename fields, collections, or indexes — the bot reads/writes the
 * exact same MongoDB database.
 */

export type RoleAction = "add" | "remove" | "expire";

export interface GuildConfigAttrs {
  guildId: string;
  prefix: string;
  logChannelId: string;
}

export interface NoPrefixAttrs {
  userId: string;
  addedBy: string;
  addedAt: Date;
}

export interface TempRoleAttrs {
  guildId: string;
  userId: string;
  roleId: string;
  expiresAt: Date;
  addedBy: string;
}

export interface RoleLogAttrs {
  guildId: string;
  action: RoleAction;
  userId: string;
  roleId: string;
  by: string;
  at: Date;
}

/* ── GuildConfig → collection: guildconfigs ─────────────────────────── */
const GuildConfigSchema = new Schema<GuildConfigAttrs>(
  {
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, required: true, default: "r!" },
    logChannelId: { type: String, default: "" },
  },
  { collection: "guildconfigs", minimize: false }
);

/* ── NoPrefix → collection: noprefixes ──────────────────────────────── */
const NoPrefixSchema = new Schema<NoPrefixAttrs>(
  {
    userId: { type: String, required: true, unique: true },
    addedBy: { type: String, required: true },
    addedAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "noprefixes" }
);

/* ── TempRole → collection: temproles ───────────────────────────────── */
const TempRoleSchema = new Schema<TempRoleAttrs>(
  {
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    roleId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    addedBy: { type: String, required: true },
  },
  { collection: "temproles" }
);
TempRoleSchema.index({ guildId: 1, expiresAt: -1 });

/* ── RoleLog → collection: rolelogs ─────────────────────────────────── */
const RoleLogSchema = new Schema<RoleLogAttrs>(
  {
    guildId: { type: String, required: true, index: true },
    action: { type: String, enum: ["add", "remove", "expire"], required: true },
    userId: { type: String, required: true },
    roleId: { type: String, required: true },
    by: { type: String, required: true },
    at: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "rolelogs" }
);
RoleLogSchema.index({ guildId: 1, at: -1 });

export const GuildConfig: Model<GuildConfigAttrs> =
  (models.GuildConfig as Model<GuildConfigAttrs>) ||
  model<GuildConfigAttrs>("GuildConfig", GuildConfigSchema);

export const NoPrefix: Model<NoPrefixAttrs> =
  (models.NoPrefix as Model<NoPrefixAttrs>) ||
  model<NoPrefixAttrs>("NoPrefix", NoPrefixSchema);

export const TempRole: Model<TempRoleAttrs> =
  (models.TempRole as Model<TempRoleAttrs>) ||
  model<TempRoleAttrs>("TempRole", TempRoleSchema);

export const RoleLog: Model<RoleLogAttrs> =
  (models.RoleLog as Model<RoleLogAttrs>) ||
  model<RoleLogAttrs>("RoleLog", RoleLogSchema);
