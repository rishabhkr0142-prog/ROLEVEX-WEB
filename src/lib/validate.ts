/** Shared validation helpers — all IDs must be Discord snowflakes. */

export function isSnowflake(value: unknown): value is string {
  return typeof value === "string" && /^\d{15,25}$/.test(value);
}

/**
 * Prefix: 1–5 printable ASCII characters without spaces.
 * (Backticks and @ are excluded so the prefix cannot break markdown/mentions.)
 */
export function isValidPrefix(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 5) return false;
  if (/[\s`@]/.test(trimmed)) return false;
  return /^[\x21-\x7E]+$/.test(trimmed);
}

/** Allowed duration suffixes used by the bot: s, m, h, d, w, mo */
export const DURATION_UNITS = ["s", "m", "h", "d", "w", "mo"] as const;

export function formatDuration(ms: number): string {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
  if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds}s`);
  return parts.join(" ") || "0s";
}
