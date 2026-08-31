"use client";

import { VaultAnalysis } from "@/lib/types";

interface StatsBarProps {
  analysis: VaultAnalysis;
  mode?: "weapons" | "armor";
}

export default function StatsBar({ analysis, mode = "weapons" }: StatsBarProps) {
  // Weapon models with no voltron wishlist coverage (scored via fallback perks)
  const noWishlistCount = (analysis.allWeaponGroups ?? []).filter((g) =>
    g.rolls.some((r) => r.usedFallback)
  ).length;

  const weaponStats = [
    {
      label: "Total Weapons",
      value: analysis.totalWeapons,
      color: "text-gray-300",
      bg: "bg-gray-800",
    },
    {
      label: "God Rolls",
      value: analysis.godRollCount,
      color: "text-yellow-400",
      bg: "bg-yellow-900/30",
    },
    {
      label: "Keep",
      value: analysis.keepCount,
      color: "text-green-400",
      bg: "bg-green-900/30",
    },
    {
      label: "Needs Review",
      value: analysis.reviewCount,
      color: "text-amber-400",
      bg: "bg-amber-900/30",
    },
    {
      label: "Safe to Junk",
      value: analysis.junkCount,
      color: "text-red-400",
      bg: "bg-red-900/30",
    },
    {
      label: "Not in Wishlist",
      value: noWishlistCount,
      color: "text-purple-400",
      bg: "bg-purple-900/30",
    },
  ];

  const armor = analysis.armor;
  const armorStats = armor
    ? [
        {
          label: "Total Armor",
          value: armor.totalArmor,
          color: "text-gray-300",
          bg: "bg-gray-800",
        },
        {
          label: "Duplicate Groups",
          value: armor.duplicateGroups.length,
          color: "text-blue-400",
          bg: "bg-blue-900/30",
        },
        {
          label: "Tier 5",
          value: armor.tier5Count,
          color: "text-yellow-400",
          bg: "bg-yellow-900/30",
        },
        {
          label: "Safe to Junk",
          value: armor.junkCount,
          color: "text-red-400",
          bg: "bg-red-900/30",
        },
        {
          label: "Keep",
          value: armor.keepCount,
          color: "text-green-400",
          bg: "bg-green-900/30",
        },
        {
          label: "Legacy",
          value: armor.legacyCount,
          color: "text-purple-400",
          bg: "bg-purple-900/30",
        },
      ]
    : [];

  const stats = mode === "armor" ? armorStats : weaponStats;

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
          </p>
        </div>
      ))}
    </div>
  );
}
