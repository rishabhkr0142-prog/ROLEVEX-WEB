"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Loader2,
  PlusCircle,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";

interface Entry {
  userId: string;
  addedBy: string;
  addedAt: string;
  username: string;
  rawUsername: string | null;
  avatar: string | null;
  addedByName: string;
}

interface PreviewUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

interface ListState {
  items: Entry[];
  page: number;
  totalPages: number;
  total: number;
}

const EMPTY: ListState = { items: [], page: 1, totalPages: 1, total: 0 };

export function NoPrefixManager() {
  const [list, setList] = useState<ListState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [idInput, setIdInput] = useState("");
  const [preview, setPreview] = useState<PreviewUser | null>(null);
  const [previewState, setPreviewState] = useState<"idle" | "loading" | "error">("idle");
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch the paginated list ─────────────────────────────────────── */
  const loadList = useCallback(
    async (targetPage: number, targetSearch: string) => {
      setLoading(true);
      setListError(null);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          pageSize: "10",
        });
        if (targetSearch) params.set("search", targetSearch);

        const res = await fetch(`/api/owner/noprefix?${params.toString()}`, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setListError(data.error ?? "Could not load the no-prefix list.");
          setList(EMPTY);
          return;
        }

        setList({
          items: data.items ?? [],
          page: data.page ?? 1,
          totalPages: data.totalPages ?? 1,
          total: data.total ?? 0,
        });
      } catch {
        setListError("Network error while loading the list.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadList(page, search);
  }, [page, search, loadList]);

  /* ── Debounced search ─────────────────────────────────────────────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ── Debounced user preview (only for valid snowflakes) ───────────── */
  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);

    const id = idInput.trim();
    if (!/^\d{15,25}$/.test(id)) {
      setPreview(null);
      setPreviewState("idle");
      setPreviewError(null);
      return;
    }

    setPreviewState("loading");
    previewTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/owner/lookup?userId=${encodeURIComponent(id)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setPreview(null);
          setPreviewError(data.error ?? "User could not be found.");
          setPreviewState("error");
          return;
        }
        setPreview(data.user);
        setPreviewError(null);
        setPreviewState("idle");
      } catch {
        setPreview(null);
        setPreviewError("Could not reach the server.");
        setPreviewState("error");
      }
    }, 400);

    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [idInput]);

  /* ── Actions ──────────────────────────────────────────────────────── */
  async function addUser() {
    const userId = idInput.trim();
    if (!/^\d{15,25}$/.test(userId) || adding) return;

    setAdding(true);
    setNotice(null);
    try {
      const res = await fetch("/api/owner/noprefix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNotice({ kind: "error", text: data.error ?? "Could not add the user." });
        return;
      }

      setNotice({
        kind: "ok",
        text: `${data.entry?.username ?? userId} can now run commands without a prefix.`,
      });
      setIdInput("");
      setPreview(null);
      setPreviewState("idle");
      await loadList(1, search);
      setPage(1);
    } catch {
      setNotice({ kind: "error", text: "Network error — please try again." });
    } finally {
      setAdding(false);
    }
  }

  async function removeUser(entry: Entry) {
    const label = entry.username || entry.userId;
    if (!window.confirm(`Remove ${label} from the no-prefix list?`)) return;

    setRemovingId(entry.userId);
    setNotice(null);
    try {
      const res = await fetch(
        `/api/owner/noprefix/${encodeURIComponent(entry.userId)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNotice({ kind: "error", text: data.error ?? "Could not remove the user." });
        return;
      }

      setNotice({ kind: "ok", text: `${label} removed from the no-prefix list.` });
      if (list.items.length === 1 && page > 1) setPage(page - 1);
      else await loadList(page, search);
    } catch {
      setNotice({ kind: "error", text: "Network error — please try again." });
    } finally {
      setRemovingId(null);
    }
  }

  async function copyId(userId: string) {
    try {
      await navigator.clipboard.writeText(userId);
      setNotice({ kind: "ok", text: `Copied ID ${userId}` });
    } catch {
      /* clipboard unavailable */
    }
  }

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="mt-8 space-y-6">
      {/* Add a user */}
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent-light">
            <UserPlus className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Add a user by Discord ID
            </h2>
            <p className="text-[13px] text-zinc-500">
              Written straight to{" "}
              <code className="font-mono text-accent-light">noprefixes</code> — the bot
              reads it live, no restart needed.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <label htmlFor="noprefix-id" className="label">
              Discord user ID
            </label>
            <input
              id="noprefix-id"
              className="input font-mono"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 112233445566778899"
              value={idInput}
              onChange={(event) => setIdInput(event.target.value.replace(/[^\d]/g, ""))}
              maxLength={25}
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              Enable Developer Mode in Discord, then right-click a user → Copy User ID.
            </p>
          </div>

          <button
            type="button"
            onClick={addUser}
            disabled={!preview || adding}
            className="btn-primary sm:mt-7"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            Add to list
          </button>
        </div>

        {/* Preview before adding */}
        <div className="mt-4">
          {previewState === "loading" && (
            <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-black/25 px-4 py-3 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin text-accent" /> Looking up user…
            </div>
          )}

          {previewState === "error" && previewError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" /> {previewError}
            </div>
          )}

          {preview && (
            <div className="flex items-center gap-4 rounded-xl border border-accent/35 bg-accent/[0.08] px-4 py-3.5 animate-fadeUp">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.avatar}
                alt=""
                className="h-11 w-11 rounded-full bg-ink-700 object-cover ring-1 ring-accent/40"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{preview.displayName}</p>
                <p className="truncate text-[13px] text-zinc-400">
                  @{preview.username}{" "}
                  <span className="font-mono text-zinc-600">· {preview.id}</span>
                </p>
              </div>
              <span className="badge border-accent/40 bg-accent/15 text-accent-light">
                <ShieldCheck className="h-3 w-3" /> Ready to add
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Notices */}
      {notice && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm animate-fadeUp ${
            notice.kind === "ok"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {notice.kind === "ok" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {notice.text}
        </div>
      )}

      {/* List */}
      <section className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              No-prefix list
            </h2>
            <p className="text-[13px] text-zinc-500">
              {list.total} {list.total === 1 ? "user" : "users"} allowed to skip the
              prefix
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              className="input pl-9"
              placeholder="Search by username or ID…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Search the no-prefix list"
            />
          </div>
        </div>

        {listError ? (
          <div className="px-6 py-10 text-center text-sm text-danger">{listError}</div>
        ) : loading ? (
          <div className="space-y-3 px-6 py-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : list.items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShieldCheck className="mx-auto h-7 w-7 text-zinc-600" />
            <p className="mt-3 font-display font-semibold text-zinc-300">
              {search ? "No users match that search" : "The list is empty"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {search
                ? "Try a Discord ID (digits) or part of a username."
                : "Add a user above to let them run commands without a prefix."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.03] text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Discord ID</th>
                  <th className="px-6 py-3.5 font-semibold">Added by</th>
                  <th className="px-6 py-3.5 font-semibold">Date added</th>
                  <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.055]">
                {list.items.map((entry) => (
                  <tr key={entry.userId} className="transition hover:bg-white/[0.035]">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {entry.avatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={entry.avatar}
                            alt=""
                            className="h-8 w-8 rounded-full bg-ink-700 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent-dark/30 text-xs font-bold text-accent-light">
                            {entry.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{entry.username}</p>
                          {entry.rawUsername && entry.rawUsername !== entry.username && (
                            <p className="truncate text-[12px] text-zinc-500">
                              @{entry.rawUsername}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <button
                        type="button"
                        onClick={() => copyId(entry.userId)}
                        title="Copy ID"
                        className="group inline-flex items-center gap-2 font-mono text-[13px] text-zinc-400 transition hover:text-accent-light"
                      >
                        {entry.userId}
                        <Copy className="h-3.5 w-3.5 text-zinc-600 transition group-hover:text-accent-light" />
                      </button>
                    </td>

                    <td className="px-6 py-3.5 text-zinc-400">{entry.addedByName}</td>

                    <td className="px-6 py-3.5 text-zinc-400">
                      {new Date(entry.addedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => removeUser(entry)}
                        disabled={removingId === entry.userId}
                        className="btn-danger btn-sm"
                      >
                        {removingId === entry.userId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!listError && list.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.07] px-6 py-3.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="btn-secondary btn-sm"
            >
              Previous
            </button>
            <span className="text-[13px] text-zinc-500">
              Page <span className="text-zinc-200">{list.page}</span> of{" "}
              <span className="text-zinc-200">{list.totalPages}</span>
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(list.totalPages, p + 1))}
              disabled={page >= list.totalPages || loading}
              className="btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
