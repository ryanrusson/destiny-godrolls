"use client";

import { WeaponRoll, PerkInfo, DAMAGE_TYPES } from "@/lib/types";
import { bungieIconUrl } from "@/lib/bungie-api";

interface WeaponCardProps {
  roll: WeaponRoll;
  recommendation: "keep" | "junk";
}

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

export default function WeaponCard({ roll, recommendation }: WeaponCardProps) {
  const damageInfo = DAMAGE_TYPES[roll.damageType] || DAMAGE_TYPES[0];

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        recommendation === "junk"
          ? "border-red-900/50 bg-red-950/20 hover:border-red-800/50"
          : roll.isGodRoll
            ? "border-yellow-700/50 bg-yellow-950/20 hover:border-yellow-600/50"
            : "border-green-900/50 bg-green-950/20 hover:border-green-800/50"
      }`}
    >
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
          {/* Recommendation badge */}
          {recommendation === "junk" ? (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-800/50">
              JUNK
            </span>
          ) : roll.isGodRoll ? (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-900/60 text-yellow-300 border border-yellow-700/50">
              {roll.usedFallback ? "GREAT ROLL" : "GOD ROLL"}
            </span>
          ) : roll.isRecommended ? (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-900/60 text-green-300 border border-green-800/50">
              {roll.usedFallback ? "GOOD ROLL" : "KEEP"}
            </span>
          ) : (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-800/40">
              KEEP (BEST)
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
          {roll.stats.map((stat) => (
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
              <span className="text-[10px] text-gray-400 w-6 text-right tabular-nums">
                {stat.value}
              </span>
            </div>
          ))}
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

      {/* Wishlist Notes */}
      {roll.wishlistNotes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          {roll.wishlistNotes.map((note, i) => (
            <p key={i} className="text-xs text-yellow-400/80 italic">
              {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
