"use client";

import { useState } from "react";
import {
  DimTag,
  DIM_TAGS,
  DIM_TAG_HINTS,
  DIM_TAG_LABELS,
  DIM_TAG_STYLES,
  WeaponRoll,
} from "@/lib/types";
import { buildDimQuery, instanceIdsByTag } from "@/lib/weapon-comparison";

interface DimTagPanelProps {
  /** Every roll currently in scope — the panel exports what you're looking at */
  rolls: WeaponRoll[];
  /** Describes the current filter, so the counts aren't mistaken for the vault */
  scopeLabel: string;
}

/**
 * Turns the analysis into something you can act on in DIM: each tag gets a
 * search query (`id:… or id:…`) that selects exactly those instances, so you
 * can paste it into DIM's search bar and bulk-tag the whole set at once.
 */
export default function DimTagPanel({ rolls, scopeLabel }: DimTagPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedTag, setCopiedTag] = useState<DimTag | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);

  const byTag = instanceIdsByTag(rolls);
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

  if (rolls.length === 0) return null;

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
            Suggested tags for the {rolls.length} weapon
            {rolls.length !== 1 ? "s" : ""} currently in view ({scopeLabel}). Copy a
            query, paste it into DIM&apos;s search bar, then bulk-tag the results
            from the item actions menu.
          </p>

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
                      {byTag[tag].length} weapon{byTag[tag].length !== 1 ? "s" : ""}
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
