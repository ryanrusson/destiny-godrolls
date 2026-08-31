"use client";

import { useState } from "react";
import {
  ArmorAnalysis,
  ArmorArchetype,
  ArmorSlot,
  ARMOR_SLOT_LABELS,
  CLASS_NAMES,
} from "@/lib/types";
import ArmorGroupCard from "./ArmorGroupCard";
import DimTagPanel from "./DimTagPanel";

type ArmorFilterMode = "all" | "junk" | "review" | "tier5" | "legacy" | "exotics";

const ARCHETYPE_OPTIONS: ArmorArchetype[] = [
  "Brawler",
  "Bulwark",
  "Grenadier",
  "Gunner",
  "Paragon",
  "Specialist",
  "Unknown",
];

const SLOT_OPTIONS: ArmorSlot[] = ["helmet", "gauntlets", "chest", "legs", "classItem"];

interface ArmorViewProps {
  armor: ArmorAnalysis;
  isDemo?: boolean;
}

export default function ArmorView({ armor, isDemo = false }: ArmorViewProps) {
  const [filter, setFilter] = useState<ArmorFilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [archetypeFilter, setArchetypeFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [showAllArmor, setShowAllArmor] = useState(false);

  const baseGroups = showAllArmor ? armor.allArmorGroups : armor.duplicateGroups;

  const filteredGroups = baseGroups.filter((group) => {
    // Status filter tabs
    if (filter === "junk" && group.junkRecommendations.length === 0) return false;
    if (filter === "review" && !group.pieces.some((p) => p.verdict === "review"))
      return false;
    if (filter === "tier5" && !group.pieces.some((p) => p.gearTier === 5)) return false;
    if (filter === "legacy" && !group.pieces.some((p) => p.isLegacy)) return false;
    if (filter === "exotics" && !group.isExoticGroup) return false;

    // Text search: name or archetype
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = group.pieces.some((p) => p.name.toLowerCase().includes(q));
      const archetypeMatch = group.pieces.some((p) =>
        p.archetype.toLowerCase().includes(q)
      );
      if (!nameMatch && !archetypeMatch) return false;
    }

    // Dropdowns
    if (classFilter !== "all" && String(group.classType) !== classFilter) return false;
    if (slotFilter !== "all" && group.slot !== slotFilter) return false;
    if (
      archetypeFilter !== "all" &&
      !group.pieces.some((p) => p.archetype === archetypeFilter)
    )
      return false;
    if (tierFilter === "legacy" && !group.pieces.some((p) => p.isLegacy)) return false;
    if (
      tierFilter !== "all" &&
      tierFilter !== "legacy" &&
      !group.pieces.some((p) => String(p.gearTier) === tierFilter)
    )
      return false;

    return true;
  });

  const hasActiveFilters =
    Boolean(searchQuery) ||
    classFilter !== "all" ||
    slotFilter !== "all" ||
    archetypeFilter !== "all" ||
    tierFilter !== "all";

  // Deduplicate pieces for the DIM export: a group can appear in both the
  // duplicates and all-armor lists, but a piece only belongs to one group.
  const visiblePieces = [
    ...new Map(
      filteredGroups
        .flatMap((g) => g.pieces)
        .map((piece) => [piece.itemInstanceId, piece])
    ).values(),
  ];

  const filterTabs: { mode: ArmorFilterMode; label: string; count: number; active: string }[] = [
    {
      mode: "all",
      label: showAllArmor ? "All Armor" : "All Duplicates",
      count: baseGroups.length,
      active: "bg-gray-700 text-white",
    },
    {
      mode: "junk",
      label: "Has Junk",
      count: baseGroups.filter((g) => g.junkRecommendations.length > 0).length,
      active: "bg-red-900/50 text-red-300",
    },
    {
      mode: "review",
      label: "Needs Review",
      count: baseGroups.filter((g) => g.pieces.some((p) => p.verdict === "review")).length,
      active: "bg-amber-900/50 text-amber-300",
    },
    {
      mode: "tier5",
      label: "Tier 5",
      count: baseGroups.filter((g) => g.pieces.some((p) => p.gearTier === 5)).length,
      active: "bg-yellow-900/50 text-yellow-300",
    },
    {
      mode: "legacy",
      label: "Legacy",
      count: baseGroups.filter((g) => g.pieces.some((p) => p.isLegacy)).length,
      active: "bg-gray-700/80 text-gray-300",
    },
    {
      mode: "exotics",
      label: "Exotics",
      count: baseGroups.filter((g) => g.isExoticGroup).length,
      active: "bg-yellow-900/50 text-yellow-300",
    },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setClassFilter("all");
    setSlotFilter("all");
    setArchetypeFilter("all");
    setTierFilter("all");
    setFilter("all");
  };

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search field */}
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search armor or archetypes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Class dropdown */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors cursor-pointer"
          >
            <option value="all">All Classes</option>
            {Object.entries(CLASS_NAMES).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>

          {/* Slot dropdown */}
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors cursor-pointer"
          >
            <option value="all">All Slots</option>
            {SLOT_OPTIONS.map((slot) => (
              <option key={slot} value={slot}>
                {ARMOR_SLOT_LABELS[slot]}
              </option>
            ))}
          </select>

          {/* Archetype dropdown */}
          <select
            value={archetypeFilter}
            onChange={(e) => setArchetypeFilter(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors cursor-pointer"
          >
            <option value="all">All Archetypes</option>
            {ARCHETYPE_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Gear tier dropdown */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors cursor-pointer"
          >
            <option value="all">All Tiers</option>
            {[5, 4, 3, 2, 1].map((t) => (
              <option key={t} value={String(t)}>
                Tier {t}
              </option>
            ))}
            <option value="legacy">Legacy</option>
          </select>

          {/* All armor toggle */}
          <button
            onClick={() => setShowAllArmor(!showAllArmor)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
              showAllArmor
                ? "bg-blue-900/50 border-blue-700 text-blue-300"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            {showAllArmor ? "All Armor" : "Duplicates Only"}
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.mode}
                onClick={() => setFilter(tab.mode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.mode ? tab.active : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <span className="text-xs text-gray-500">
              {filteredGroups.length} result{filteredGroups.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* DIM tagging export for whatever is currently in view */}
      <DimTagPanel
        items={visiblePieces}
        scopeLabel={showAllArmor ? "all armor" : "duplicate groups"}
        itemNoun="armor piece"
        isDemo={isDemo}
      />

      {/* Armor Groups */}
      {filteredGroups.length > 0 ? (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <ArmorGroupCard key={group.groupKey} group={group} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">
            {hasActiveFilters
              ? "No armor matches these filters."
              : filter === "all"
                ? showAllArmor
                  ? "No armor found in your vault!"
                  : "No duplicate armor found in your vault!"
                : "No armor matches this filter."}
          </p>
          {(hasActiveFilters || filter !== "all") && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-gray-400 hover:text-gray-200 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Junk Summary */}
      {armor.junkCount > 0 && (
        <div className="mt-8 bg-red-950/20 border border-red-900/30 rounded-xl p-6 text-center">
          <p className="text-red-400 font-semibold text-lg">
            {armor.junkCount} armor piece{armor.junkCount !== 1 ? "s" : ""} safe to
            dismantle
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Legacy pieces, low gear tiers, and rolls strictly worse than armor you
            already own. The best piece of each archetype has been marked to keep,
            and exotics are never bulk-junked.
          </p>
        </div>
      )}
    </>
  );
}
