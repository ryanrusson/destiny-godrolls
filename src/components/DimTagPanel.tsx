"use client";

import { useState } from "react";
import {
  DimTag,
  DIM_TAGS,
  DIM_TAG_HINTS,
  DIM_TAG_LABELS,
  DIM_TAG_STYLES,
} from "@/lib/types";
import {
  buildDimAnnotations,
  buildDimQuery,
  DimItemAnnotation,
  DimTaggable,
  DIM_NOTE_PREFIX,
  instanceIdsByTag,
} from "@/lib/dim-tags";

interface DimTagPanelProps {
  /** Every item currently in scope — the panel exports what you're looking at */
  items: DimTaggable[];
  /** Describes the current filter, so the counts aren't mistaken for the vault */
  scopeLabel: string;
  /** What an item is called in this view, e.g. "weapon" or "armor piece" */
  itemNoun?: string;
  /** Demo mode has no Bungie session, so direct sync is unavailable */
  isDemo?: boolean;
}

/** Existing DIM annotations from /api/dim/preview, keyed by instance id. */
type ExistingTags = Record<string, { tag: string | null; notes: string | null }>;

interface SyncPlan {
  /** Annotations that will be pushed */
  annotations: DimItemAnnotation[];
  /** Items whose DIM tag differs from the suggestion (pushed only when overwriting) */
  conflicts: number;
  /** Notes withheld because the item has a hand-written DIM note */
  protectedNotes: number;
  perTag: Record<DimTag, number>;
}

/**
 * Only overwrite DIM tags the user hasn't set differently, and never clobber a
 * note this app didn't write.
 */
function buildSyncPlan(
  items: DimTaggable[],
  existing: ExistingTags,
  overwrite: boolean
): SyncPlan {
  const annotations: DimItemAnnotation[] = [];
  let conflicts = 0;
  let protectedNotes = 0;
  const perTag = Object.fromEntries(DIM_TAGS.map((t) => [t, 0])) as Record<
    DimTag,
    number
  >;

  for (const annotation of buildDimAnnotations(items)) {
    const current = existing[annotation.id];
    if (current?.tag && current.tag !== annotation.tag) {
      conflicts += 1;
      if (!overwrite) continue;
    }
    if (
      annotation.notes &&
      current?.notes &&
      !current.notes.startsWith(DIM_NOTE_PREFIX)
    ) {
      protectedNotes += 1;
      delete annotation.notes;
    }
    annotations.push(annotation);
    if (annotation.tag) perTag[annotation.tag] += 1;
  }

  return { annotations, conflicts, protectedNotes, perTag };
}

type SyncState =
  | { step: "idle" }
  | { step: "loading" }
  | { step: "unconfigured" }
  | { step: "confirm"; existing: ExistingTags }
  | { step: "syncing"; existing: ExistingTags }
  | { step: "done"; tagged: number; failed: number; errors: string[] }
  | { step: "error"; message: string };

/**
 * Turns the analysis into something you can act on in DIM. Two paths:
 * "Sync to DIM" pushes the suggested tags straight into DIM Sync, and each
 * tag's search query (`id:… or id:…`) can be copied for manual bulk tagging.
 */
export default function DimTagPanel({
  items,
  scopeLabel,
  itemNoun = "weapon",
  isDemo = false,
}: DimTagPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedTag, setCopiedTag] = useState<DimTag | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const [sync, setSync] = useState<SyncState>({ step: "idle" });
  const [overwrite, setOverwrite] = useState(false);

  const byTag = instanceIdsByTag(items);
  const tagsWithItems = DIM_TAGS.filter((tag) => byTag[tag].length > 0);

  const copyQuery = async (tag: DimTag) => {
    const query = buildDimQuery(byTag[tag]);
    try {
      await navigator.clipboard.writeText(query);
      setCopyFailed(false);
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 2000);
    } catch {
      setCopyFailed(true);
    }
  };

  const startSync = async () => {
    setSync({ step: "loading" });
    try {
      const res = await fetch("/api/dim/preview");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Couldn't read your DIM tags");
      }
      const data = (await res.json()) as { configured: boolean; tags: ExistingTags };
      if (!data.configured) {
        setSync({ step: "unconfigured" });
        return;
      }
      setOverwrite(false);
      setSync({ step: "confirm", existing: data.tags });
    } catch (err) {
      setSync({
        step: "error",
        message: err instanceof Error ? err.message : "Couldn't reach DIM",
      });
    }
  };

  const confirmSync = async (existing: ExistingTags) => {
    const plan = buildSyncPlan(items, existing, overwrite);
    setSync({ step: "syncing", existing });
    try {
      const res = await fetch("/api/dim/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: plan.annotations }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Sync failed");
      }
      setSync({
        step: "done",
        tagged: data.tagged ?? 0,
        failed: data.failed ?? 0,
        errors: data.errors ?? [],
      });
    } catch (err) {
      setSync({
        step: "error",
        message: err instanceof Error ? err.message : "Sync failed",
      });
    }
  };

  if (items.length === 0) return null;

  const plan =
    sync.step === "confirm" || sync.step === "syncing"
      ? buildSyncPlan(items, sync.existing, overwrite)
      : null;

  return (
    <div className="mb-6 bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-900/80 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-200">DIM Tagging</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {tagsWithItems.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${DIM_TAG_STYLES[tag]}`}
              >
                {DIM_TAG_LABELS[tag]} {byTag[tag].length}
              </span>
            ))}
          </div>
        </div>
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-800 space-y-3">
          <p className="text-xs text-gray-500">
            Suggested tags for the {items.length} {itemNoun}
            {items.length !== 1 ? "s" : ""} currently in view ({scopeLabel}).
            Sync them straight into DIM, or copy a query, paste it into
            DIM&apos;s search bar, and bulk-tag the results from the item
            actions menu.
          </p>

          {/* Direct DIM Sync */}
          {!isDemo && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 space-y-2">
              {(sync.step === "idle" ||
                sync.step === "loading" ||
                sync.step === "error" ||
                sync.step === "done" ||
                sync.step === "unconfigured") && (
                <div className="flex items-center gap-3 justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300 font-medium">Sync to DIM</p>
                    <p className="text-[11px] text-gray-500">
                      Writes these tags to your DIM account (DIM Sync). Tags you
                      set differently in DIM are left alone unless you say so.
                    </p>
                  </div>
                  <button
                    onClick={startSync}
                    disabled={sync.step === "loading"}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-blue-800 bg-blue-950/50 text-blue-300 hover:text-blue-100 hover:border-blue-600 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    {sync.step === "loading" ? "Checking DIM…" : "Sync to DIM"}
                  </button>
                </div>
              )}

              {sync.step === "unconfigured" && (
                <p className="text-xs text-amber-400">
                  Direct sync isn&apos;t configured on this server (missing DIM
                  API key) — use the copy queries below instead.
                </p>
              )}

              {sync.step === "error" && (
                <p className="text-xs text-red-400">{sync.message}</p>
              )}

              {sync.step === "done" && (
                <p className="text-xs text-green-400">
                  Tagged {sync.tagged} item{sync.tagged !== 1 ? "s" : ""} in DIM
                  {sync.failed > 0 && (
                    <span className="text-amber-400">
                      {" "}
                      · {sync.failed} failed
                      {sync.errors.length > 0 ? ` (${sync.errors[0]})` : ""}
                    </span>
                  )}
                  . Refresh DIM to see them.
                </p>
              )}

              {(sync.step === "confirm" || sync.step === "syncing") && plan && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-300">
                    Ready to tag{" "}
                    <span className="font-semibold">{plan.annotations.length}</span>{" "}
                    {itemNoun}
                    {plan.annotations.length !== 1 ? "s" : ""} in DIM:{" "}
                    {DIM_TAGS.filter((t) => plan.perTag[t] > 0)
                      .map((t) => `${plan.perTag[t]} ${DIM_TAG_LABELS[t].toLowerCase()}`)
                      .join(", ")}
                    .
                  </p>
                  {plan.conflicts > 0 && (
                    <label className="flex items-center gap-2 text-[11px] text-amber-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={overwrite}
                        onChange={(e) => setOverwrite(e.target.checked)}
                        className="accent-amber-500"
                      />
                      Overwrite {plan.conflicts} item
                      {plan.conflicts !== 1 ? "s" : ""} you tagged differently in
                      DIM {overwrite ? "" : "(currently skipped)"}
                    </label>
                  )}
                  {plan.protectedNotes > 0 && (
                    <p className="text-[11px] text-gray-500">
                      {plan.protectedNotes} hand-written DIM note
                      {plan.protectedNotes !== 1 ? "s" : ""} will be left
                      untouched.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => confirmSync(sync.existing)}
                      disabled={sync.step === "syncing" || plan.annotations.length === 0}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border border-green-800 bg-green-950/50 text-green-300 hover:text-green-100 hover:border-green-600 transition-colors disabled:opacity-50"
                    >
                      {sync.step === "syncing" ? "Syncing…" : "Confirm sync"}
                    </button>
                    <button
                      onClick={() => setSync({ step: "idle" })}
                      disabled={sync.step === "syncing"}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {tagsWithItems.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-3 justify-between bg-gray-900 border border-gray-800 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${DIM_TAG_STYLES[tag]}`}
                  >
                    {DIM_TAG_LABELS[tag]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300">
                      {byTag[tag].length} {itemNoun}
                      {byTag[tag].length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {DIM_TAG_HINTS[tag]}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => copyQuery(tag)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors whitespace-nowrap shrink-0"
                >
                  {copiedTag === tag ? "Copied!" : "Copy DIM search"}
                </button>
              </div>
            ))}
          </div>

          {copyFailed && (
            <p className="text-xs text-amber-400">
              Couldn&apos;t reach the clipboard — your browser may block it outside a
              secure context.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
