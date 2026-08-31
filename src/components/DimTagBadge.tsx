"use client";

import { useState } from "react";
import {
  DimTag,
  DIM_TAGS,
  DIM_TAG_HINTS,
  DIM_TAG_LABELS,
  DIM_TAG_STYLES,
} from "@/lib/types";
import { DimTaggable } from "@/lib/dim-tags";
import { useDimTagOverrides } from "./DimTagContext";

interface DimTagBadgeProps {
  item: DimTaggable;
}

/**
 * The item's DIM tag as a clickable badge: click to pick a different tag when
 * you disagree with the suggestion. The choice feeds the DIM Tagging panel's
 * counts, copy queries, and sync.
 */
export default function DimTagBadge({ item }: DimTagBadgeProps) {
  const { overrides, setOverride } = useDimTagOverrides();
  const [open, setOpen] = useState(false);

  const override = overrides[item.itemInstanceId];
  const effectiveTag = override ?? item.suggestedTag;
  const isOverridden = override !== undefined && override !== item.suggestedTag;

  const pick = (tag: DimTag) => {
    setOverride(item.itemInstanceId, tag === item.suggestedTag ? null : tag);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border uppercase cursor-pointer hover:brightness-125 transition-all ${DIM_TAG_STYLES[effectiveTag]}`}
        title={`DIM tag: ${DIM_TAG_LABELS[effectiveTag]} — ${DIM_TAG_HINTS[effectiveTag]}. Click to change.`}
      >
        {DIM_TAG_LABELS[effectiveTag]}
        {isOverridden && <span title="Manually set">*</span>}
        <svg
          viewBox="0 0 24 24"
          className="w-2.5 h-2.5 opacity-70"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {DIM_TAGS.map((tag) => (
            <button
              key={tag}
              // onMouseDown so it fires before the badge's onBlur closes the menu
              onMouseDown={(e) => {
                e.preventDefault();
                pick(tag);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-gray-800 transition-colors ${
                tag === effectiveTag ? "bg-gray-800/60" : ""
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${DIM_TAG_STYLES[tag]}`}
              >
                {DIM_TAG_LABELS[tag]}
              </span>
              {tag === item.suggestedTag && (
                <span className="text-[10px] text-gray-500">suggested</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
