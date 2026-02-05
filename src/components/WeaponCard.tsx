"use client";

import { WeaponRoll, DAMAGE_TYPES } from "@/lib/types";
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
              GOD ROLL
            </span>
          ) : roll.isRecommended ? (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-900/60 text-green-300 border border-green-800/50">
              KEEP
            </span>
          ) : (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-800/40">
              KEEP (BEST)
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

      {/* Perks */}
      <div className="space-y-1.5">
        {roll.perks.map((col) => {
          const perk = col.selectedPerk;
          if (!perk) return null;

          return (
            <div
              key={col.columnIndex}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
                perk.isWishlistPerk
                  ? "bg-yellow-900/30 border border-yellow-800/40"
                  : "bg-gray-800/50"
              }`}
            >
              {perk.icon ? (
                <img
                  src={perk.icon.startsWith("http") ? perk.icon : bungieIconUrl(perk.icon)}
                  alt={perk.name}
                  className="w-5 h-5 rounded-sm"
                />
              ) : (
                <div className="w-5 h-5 rounded-sm bg-gray-700 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                </div>
              )}
              <span
                className={`font-medium ${
                  perk.isWishlistPerk ? "text-yellow-300" : "text-gray-300"
                }`}
              >
                {perk.name}
              </span>
              {perk.isWishlistPerk && (
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-yellow-500 ml-auto" fill="currentColor">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              )}
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
