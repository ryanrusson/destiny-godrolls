"use client";

import { ArmorPiece, ARCHETYPE_STATS, ARMOR_SLOT_LABELS, CLASS_NAMES } from "@/lib/types";
import { bungieIconUrl } from "@/lib/bungie-api";

interface ArmorCardProps {
  piece: ArmorPiece;
}

const locationLabels: Record<string, string> = {
  vault: "Vault",
  inventory: "Inventory",
  equipped: "Equipped",
  postmaster: "Postmaster",
};

const MAX_STAT = 30; // Armor 3.0 primary stat cap per piece

function verdictBadge(piece: ArmorPiece) {
  switch (piece.verdict) {
    case "keep":
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-900/60 text-green-300 border border-green-800/50">
          KEEP
        </span>
      );
    case "junk":
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-800/50">
          JUNK
        </span>
      );
    default:
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
          REVIEW
        </span>
      );
  }
}

function tierBadge(piece: ArmorPiece) {
  if (piece.isLegacy && piece.gearTier === null) {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
        LEGACY
      </span>
    );
  }
  if (piece.gearTier === null) return null;
  const isT5 = piece.gearTier === 5;
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
        isT5
          ? "bg-yellow-900/60 text-yellow-300 border-yellow-700/50"
          : "bg-gray-800 text-gray-300 border-gray-700"
      }`}
      title={
        piece.gearTierSource === "derived"
          ? "Tier estimated from stat total"
          : "Gear tier from Bungie API"
      }
    >
      TIER {piece.gearTier}
    </span>
  );
}

function reasonChipClass(verdict: ArmorPiece["verdict"]): string {
  if (verdict === "junk") return "bg-red-950/40 text-red-300/90 border-red-900/40";
  if (verdict === "keep") return "bg-green-950/40 text-green-300/90 border-green-900/40";
  return "bg-amber-950/40 text-amber-300/90 border-amber-900/40";
}

export default function ArmorCard({ piece }: ArmorCardProps) {
  const primarySecondary =
    piece.archetype !== "Unknown" ? ARCHETYPE_STATS[piece.archetype] : null;

  const borderClass =
    piece.verdict === "junk"
      ? "border-red-900/50 bg-red-950/20 hover:border-red-800/50"
      : piece.verdict === "review"
        ? "border-amber-900/50 bg-amber-950/10 hover:border-amber-800/50"
        : piece.gearTier === 5
          ? "border-yellow-700/50 bg-yellow-950/20 hover:border-yellow-600/50"
          : "border-green-900/50 bg-green-950/20 hover:border-green-800/50";

  return (
    <div className={`rounded-lg border p-4 transition-all ${borderClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {piece.icon ? (
            <img
              src={piece.icon.startsWith("http") ? piece.icon : bungieIconUrl(piece.icon)}
              alt={piece.name}
              className="w-12 h-12 rounded bg-gray-800"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z" />
              </svg>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-white text-sm">{piece.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              {piece.isExotic && (
                <span className="text-xs font-medium text-yellow-400">Exotic</span>
              )}
              <span className="text-xs text-gray-500">
                {CLASS_NAMES[piece.classType] ?? ""} {ARMOR_SLOT_LABELS[piece.slot]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {tierBadge(piece)}
              {piece.archetype !== "Unknown" && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-sky-950/50 text-sky-300 border border-sky-800/40">
                  {piece.archetype}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {verdictBadge(piece)}
          <span className="text-xs text-gray-500">
            {locationLabels[piece.location] || piece.location}
          </span>
        </div>
      </div>

      {/* Power + stat total */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-yellow-500" fill="currentColor">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span className="text-xs text-yellow-500 font-medium">{piece.powerLevel}</span>
        </div>
        <span className="text-xs text-gray-400">
          Total <span className="font-bold text-gray-200 tabular-nums">{piece.statTotal}</span>
        </span>
      </div>

      {/* Stat bars */}
      <div className="mb-3 space-y-1">
        {piece.stats.map((stat) => {
          const isPrimary = primarySecondary?.[0] === stat.statHash;
          const isSecondary = primarySecondary?.[1] === stat.statHash;
          const isTertiary = piece.tertiaryStat?.statHash === stat.statHash;
          const barColor = isPrimary
            ? "bg-sky-400"
            : isSecondary
              ? "bg-sky-600"
              : isTertiary
                ? "bg-teal-500"
                : "bg-gray-600";
          const labelColor = isPrimary || isSecondary
            ? "text-sky-300"
            : isTertiary
              ? "text-teal-300"
              : "text-gray-400";

          return (
            <div key={stat.statHash} className="flex items-center gap-2">
              <span className={`text-[10px] w-16 text-right shrink-0 ${labelColor}`}>
                {stat.name}
              </span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${Math.min((stat.value / MAX_STAT) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 w-6 text-right tabular-nums">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Exotic class item perks */}
      {piece.exoticPerks && piece.exoticPerks.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {piece.exoticPerks.map((perk) => (
            <div key={perk.perkHash} className="bg-gray-800/30 rounded px-2 py-1.5 flex items-center gap-2">
              {perk.icon ? (
                <img
                  src={perk.icon.startsWith("http") ? perk.icon : bungieIconUrl(perk.icon)}
                  alt={perk.name}
                  className="w-7 h-7 rounded bg-gray-800 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded bg-gray-800 shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-600" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-medium text-yellow-300">{perk.name}</span>
                {perk.description && (
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                    {perk.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reason tags */}
      {piece.reasons.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-800">
          {piece.reasons.map((reason) => (
            <span
              key={reason}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${reasonChipClass(piece.verdict)}`}
            >
              {reason}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
