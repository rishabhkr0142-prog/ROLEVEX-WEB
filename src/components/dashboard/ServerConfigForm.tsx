"use client";

import { useState } from "react";
import { Check, Hash, Loader2, Save, Settings2, X } from "lucide-react";
import type { ChannelOption } from "@/components/dashboard/types";

interface Props {
  guildId: string;
  initialPrefix: string;
  initialLogChannelId: string;
  channels: ChannelOption[];
}

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; message: string }
  | { kind: "error"; message: string };

const PREFIX_SUGGESTIONS = ["r!", "!", "?", ".", "-"];

export function ServerConfigForm({
  guildId,
  initialPrefix,
  initialLogChannelId,
  channels,
}: Props) {
  const [prefix, setPrefix] = useState(initialPrefix);
  const [logChannelId, setLogChannelId] = useState(initialLogChannelId);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const dirty =
    prefix !== initialPrefix || logChannelId !== initialLogChannelId;
  const saving = status.kind === "saving";

  async function save() {
    if (!dirty || saving) return;
    setStatus({ kind: "saving" });

    try {
      const res = await fetch(`/api/guilds/${guildId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: prefix.trim(), logChannelId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({ kind: "error", message: data.error ?? "Could not save changes." });
        return;
      }

      setStatus({
        kind: "saved",
        message: "Saved — the bot picks this up immediately, no restart needed.",
      });
    } catch {
      setStatus({ kind: "error", message: "Network error — please try again." });
    }
  }

  async function reset() {
    setPrefix(initialPrefix);
    setLogChannelId(initialLogChannelId);
    setStatus({ kind: "idle" });
  }

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent-light">
            <Settings2 className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Server configuration
            </h2>
            <p className="text-[13px] text-zinc-500">
              Stored in <code className="font-mono text-accent-light">guildconfigs</code>
            </p>
          </div>
        </div>
        {dirty && <span className="badge border-warning/30 bg-warning/10 text-warning">Unsaved changes</span>}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {/* Prefix */}
        <div>
          <label htmlFor="prefix" className="label">
            Command prefix
          </label>
          <input
            id="prefix"
            className="input font-mono"
            value={prefix}
            onChange={(event) => setPrefix(event.target.value.slice(0, 5))}
            placeholder="r!"
            maxLength={5}
            autoComplete="off"
            spellCheck={false}
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {PREFIX_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrefix(suggestion)}
                className={`rounded-lg border px-2.5 py-1 font-mono text-xs transition ${
                  prefix === suggestion
                    ? "border-accent/60 bg-accent/15 text-accent-light"
                    : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:text-white"
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            1–5 printable characters, no spaces. Try{" "}
            <code className="font-mono text-zinc-300">{prefix || "r!"}role @user @role 7d</code>
          </p>
        </div>

        {/* Log channel */}
        <div>
          <label htmlFor="logChannel" className="label">
            Log channel
          </label>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <select
              id="logChannel"
              className="input appearance-none pl-9"
              value={logChannelId}
              onChange={(event) => setLogChannelId(event.target.value)}
            >
              <option value="">No log channel (disabled)</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {channels.length > 0
              ? `${channels.length} text channels visible to ROLEVEX.`
              : "No text channels were returned — make sure the bot can view a channel."}
          </p>
        </div>
      </div>

      {/* Status + actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
        <div className="min-h-[20px] text-[13px]">
          {status.kind === "saved" && (
            <span className="flex items-center gap-1.5 text-success">
              <Check className="h-4 w-4" /> {status.message}
            </span>
          )}
          {status.kind === "error" && (
            <span className="flex items-center gap-1.5 text-danger">
              <X className="h-4 w-4" /> {status.message}
            </span>
          )}
          {status.kind === "saving" && (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </span>
          )}
          {status.kind === "idle" && (
            <span className="text-zinc-500">
              Changes apply to the live bot instantly.
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={!dirty || saving}
            className="btn-ghost btn-sm"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="btn-primary btn-sm"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save changes
          </button>
        </div>
      </div>
    </section>
  );
}
