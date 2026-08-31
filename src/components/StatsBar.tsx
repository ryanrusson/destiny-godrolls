"use client";

import { ArmorAnalysis, ArmorPiece, VaultAnalysis, WeaponRoll } from "@/lib/types";

interface StatTile {
  label: string;
  /** Count within the current filtered view */
  value: number;
  /** Vault-wide count; shown as "value / total" when the view is narrower */
  total: number;
  color: string;
  bg: string;
}

interface StatsBarProps {
  mode?: "weapons" | "armor";
  /** Weapons mode: vault-wide totals */
  analysis?: VaultAnalysis;
  /** Weapons mode: deduplicated rolls currently in view (filters + scope applied) */
  visibleRolls?: WeaponRoll[];
  /** Armor mode: vault-wide totals */
  armor?: ArmorAnalysis;
  /** Armor mode: deduplicated pieces currently in view */
  visiblePieces?: ArmorPiece[];
  /** Armor mode: visible groups with 2+ pieces */
  visibleDuplicateGroupCount?: number;
}

/**
 * Stat tiles that follow the current view: each shows the count within the
 * active filters, with the vault-wide total alongside when they differ.
 */
export default function StatsBar({
  mode = "weapons",
  analysis,
  visibleRolls,
  armor,
  visiblePieces,
  visibleDuplicateGroupCount,
}: StatsBarProps) {
  let stats: StatTile[] = [];

  if (mode === "weapons" && analysis) {
    const rolls = visibleRolls ?? [];
    // Weapon models (not copies) with no wishlist coverage
    const visibleNoWishlist = new Set(
      rolls.filter((r) => r.usedFallback).map((r) => r.itemHash)
    ).size;
    const totalNoWishlist = (analysis.allWeaponGroups ?? []).filter((g) =>
      g.rolls.some((r) => r.usedFallback)
    ).length;

    stats = [
      {
        label: "Weapons",
        value: rolls.length,
        total: analysis.totalWeapons,
        color: "text-gray-300",
        bg: "bg-gray-800",
      },
      {
        label: "God Rolls",
        value: rolls.filter((r) => r.isGodRoll).length,
        total: analysis.godRollCount,
        color: "text-yellow-400",
        bg: "bg-yellow-900/30",
      },
      {
        label: "Keep",
        value: rolls.filter((r) => r.verdict === "keep").length,
        total: analysis.keepCount,
        color: "text-green-400",
        bg: "bg-green-900/30",
      },
      {
        label: "Needs Review",
        value: rolls.filter((r) => r.verdict === "review").length,
        total: analysis.reviewCount,
        color: "text-amber-400",
        bg: "bg-amber-900/30",
      },
      {
        label: "Safe to Junk",
        value: rolls.filter((r) => r.verdict === "junk").length,
        total: analysis.junkCount,
        color: "text-red-400",
        bg: "bg-red-900/30",
      },
      {
        label: "Not in Wishlist",
        value: visibleNoWishlist,
        total: totalNoWishlist,
        color: "text-purple-400",
        bg: "bg-purple-900/30",
      },
    ];
  } else if (mode === "armor" && armor) {
    const pieces = visiblePieces ?? [];
    stats = [
      {
        label: "Armor",
        value: pieces.length,
        total: armor.totalArmor,
        color: "text-gray-300",
        bg: "bg-gray-800",
      },
      {
        label: "Duplicate Groups",
        value: visibleDuplicateGroupCount ?? armor.duplicateGroups.length,
        total: armor.duplicateGroups.length,
        color: "text-blue-400",
        bg: "bg-blue-900/30",
      },
      {
        label: "Tier 5",
        value: pieces.filter((p) => p.gearTier === 5).length,
        total: armor.tier5Count,
        color: "text-yellow-400",
        bg: "bg-yellow-900/30",
      },
      {
        label: "Safe to Junk",
        value: pieces.filter((p) => p.verdict === "junk").length,
        total: armor.junkCount,
        color: "text-red-400",
        bg: "bg-red-900/30",
      },
      {
        label: "Keep",
        value: pieces.filter((p) => p.verdict === "keep").length,
        total: armor.keepCount,
        color: "text-green-400",
        bg: "bg-green-900/30",
      },
      {
        label: "Legacy",
        value: pieces.filter((p) => p.isLegacy).length,
        total: armor.legacyCount,
        color: "text-purple-400",
        bg: "bg-purple-900/30",
      },
    ];
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} rounded-lg p-4 border border-gray-800`}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className={`text-2xl font-bold ${stat.color} mt-1`}>
            {stat.value}
            {stat.value !== stat.total && (
              <span
                className="text-sm font-medium text-gray-500"
                title="In view / vault-wide"
              >
                {" "}
                / {stat.total}
              </span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
