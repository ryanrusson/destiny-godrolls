"use client";

import { useState } from "react";
import { WeaponRoll, PerkInfo, DAMAGE_TYPES } from "@/lib/types";
import { bungieIconUrl } from "@/lib/bungie-api";
import DimTagBadge from "./DimTagBadge";

interface WeaponCardProps {
  roll: WeaponRoll;
  /** Best value per stat hash in the surrounding comparison group */
  statLeaders?: Record<number, number>;
}

const verdictCardClass: Record<WeaponRoll["verdict"], string> = {
  keep: "border-green-900/50 bg-green-950/20 hover:border-green-800/50",
  review: "border-amber-900/50 bg-amber-950/20 hover:border-amber-800/50",
  junk: "border-red-900/50 bg-red-950/20 hover:border-red-800/50",
};

const locationLabels: Record<string, string> = {
  vault: "Vault",
  inventory: "Inventory",
  equipped: "Equipped",
  postmaster: "Postmaster",
};

const perkColumnLabels: Record<number, string> = {
  0: "Intrinsic",
  1: "Barrel / Sight",
  2: "Magazine",
  3: "Trait 1",
  4: "Trait 2",
};

function tagChipClass(tag: string): string {
  if (tag.includes("god")) return "bg-yellow-900/50 text-yellow-300 border-yellow-700/50";
  if (tag.includes("pvp")) return "bg-purple-900/50 text-purple-300 border-purple-700/50";
  if (tag.includes("pve")) return "bg-sky-900/50 text-sky-300 border-sky-700/50";
  return "bg-gray-800/60 text-gray-400 border-gray-700/50";
}

/** Notes can be long community write-ups, so clamp them with a toggle. */
function WishlistNote({ note }: { note: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = note.length > 180;

  return (
    <div>
      <p
        className={`text-xs text-yellow-400/80 italic ${
          !expanded && isLong ? "line-clamp-3" : ""
        }`}
      >
        {note}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-gray-500 hover:text-gray-300 mt-0.5"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function statBarColor(value: number): string {
  if (value >= 80) return "bg-green-500";
  if (value >= 60) return "bg-blue-400";
  if (value >= 40) return "bg-yellow-500";
  return "bg-red-400";
}

function PerkIcon({ perk, isSelected, size = "sm" }: { perk: PerkInfo; isSelected: boolean; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "w-8 h-8" : "w-6 h-6";

  const borderClass = isSelected
    ? perk.isWishlistPerk
      ? "ring-2 ring-yellow-500 border-yellow-600"
      : "ring-2 ring-white/60 border-white/40"
    : perk.isWishlistPerk
      ? "ring-1 ring-yellow-600/50 border-yellow-700/30"
      : "border-gray-700/50";

  const opacityClass = isSelected ? "opacity-100" : "opacity-40 hover:opacity-70";

  return (
    <div
      className={`relative ${sizeClass} rounded border ${borderClass} ${opacityClass} transition-opacity bg-gray-800 shrink-0`}
      title={`${perk.name}${perk.description ? `: ${perk.description}` : ""}`}
    >
      {perk.icon ? (
        <img
          src={perk.icon.startsWith("http") ? perk.icon : bungieIconUrl(perk.icon)}
          alt={perk.name}
          className={`${sizeClass} rounded`}
        />
      ) : (
        <div className={`${sizeClass} rounded flex items-center justify-center`}>
          <div className="w-2 h-2 rounded-full bg-gray-500" />
        </div>
      )}
      {perk.isWishlistPerk && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full border border-gray-900" />
      )}
    </div>
  );
}

export default function WeaponCard({ roll, statLeaders }: WeaponCardProps) {
  const damageInfo = DAMAGE_TYPES[roll.damageType] || DAMAGE_TYPES[0];

  return (
    <div className={`rounded-lg border p-4 transition-all ${verdictCardClass[roll.verdict]}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {roll.icon ? (
            <img
              src={roll.icon.startsWith("http") ? roll.icon : bungieIconUrl(roll.icon)}
              alt={roll.name}
              className="w-12 h-12 rounded bg-gray-800"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-white text-sm">{roll.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs font-medium"
                style={{ color: damageInfo.color }}
              >
                {damageInfo.name}
              </span>
              <span className="text-xs text-gray-500">{roll.typeName}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {/* DIM tag — the actionable verdict, click to override */}
          <DimTagBadge item={roll} />
          {(roll.isGodRoll || roll.isRecommended) && (
            <span
              className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                roll.isGodRoll
                  ? "bg-yellow-900/40 text-yellow-300/90 border-yellow-700/40"
                  : "bg-green-900/40 text-green-300/90 border-green-800/40"
              }`}
            >
              {roll.isGodRoll
                ? roll.usedFallback
                  ? "Great roll"
                  : "God roll"
                : roll.usedFallback
                  ? "Good roll"
                  : "Wishlist match"}
            </span>
          )}
          {roll.usedFallback && (
            <span
              className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded border bg-purple-900/40 text-purple-300/90 border-purple-800/40"
              title="This weapon has no entries in the Voltron community wishlist; it was rated by generic perk quality instead."
            >
              Not in wishlist
            </span>
          )}
          {roll.usedFallback && roll.fallbackRating && (
            <span className="text-[10px] text-gray-500 italic">
              perk score: {roll.fallbackScore}/{roll.fallbackMaxScore}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {locationLabels[roll.location] || roll.location}
          </span>
        </div>
      </div>

      {/* Power Level */}
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-yellow-500" fill="currentColor">
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        <span className="text-xs text-yellow-500 font-medium">{roll.powerLevel}</span>
      </div>

      {/* Weapon Stats */}
      {roll.stats.length > 0 && (
        <div className="mb-3 space-y-1">
          {roll.stats.map((stat) => {
            // Only a genuine win counts — everything ties when nothing differs.
            const leads =
              statLeaders !== undefined && statLeaders[stat.statHash] === stat.value;

            return (
              <div key={stat.statHash} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-24 text-right shrink-0">
                  {stat.name}
                </span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${statBarColor(stat.value)}`}
                    style={{ width: `${Math.min(stat.value, 100)}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] w-6 text-right tabular-nums ${
                    leads ? "text-blue-300 font-semibold" : "text-gray-400"
                  }`}
                  title={leads ? "Best in this comparison group" : undefined}
                >
                  {stat.value}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Perks Grid */}
      <div className="space-y-2">
        {roll.perks.map((col) => {
          const selected = col.selectedPerk;
          if (!selected) return null;
          const hasMultiple = col.activePerks.length > 1;

          return (
            <div key={col.columnIndex} className="bg-gray-800/30 rounded px-2 py-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] text-gray-500 uppercase">
                  {perkColumnLabels[col.columnIndex] || `Perk ${col.columnIndex}`}
                </span>
                {selected.isWishlistPerk && (
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-yellow-500" fill="currentColor">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                )}
              </div>

              {/* Perk icons row */}
              {hasMultiple && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {col.activePerks.map((perk) => (
                    <PerkIcon
                      key={perk.perkHash}
                      perk={perk}
                      isSelected={perk.perkHash === selected.perkHash}
                    />
                  ))}
                </div>
              )}

              {/* Selected perk details */}
              <div className="flex items-center gap-2">
                {!hasMultiple && (
                  <PerkIcon perk={selected} isSelected size="md" />
                )}
                <div className="min-w-0">
                  <span
                    className={`text-xs font-medium ${
                      selected.isWishlistPerk ? "text-yellow-300" : "text-gray-300"
                    }`}
                  >
                    {selected.name}
                  </span>
                  {selected.description && (
                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                      {selected.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Why this verdict */}
      {roll.reasons.length > 0 && (
        <ul className="mt-3 pt-3 border-t border-gray-800 space-y-1">
          {roll.reasons.map((reason) => (
            <li
              key={reason}
              className="text-[11px] text-gray-400 leading-snug flex gap-1.5"
            >
              <span className="text-gray-600 shrink-0">&bull;</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Wishlist Tags & Notes */}
      {((roll.wishlistTags?.length ?? 0) > 0 || roll.wishlistNotes.length > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
          {(roll.wishlistTags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {roll.wishlistTags!.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border ${tagChipClass(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {roll.wishlistNotes.map((note, i) => (
            <WishlistNote key={i} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
