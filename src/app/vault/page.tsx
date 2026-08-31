"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import DuplicateGroup from "@/components/DuplicateGroup";
import ArmorView from "@/components/ArmorView";
import { VaultAnalysis, DAMAGE_TYPES } from "@/lib/types";
import { DEMO_ANALYSIS } from "@/lib/demo-data";

type FilterMode = "all" | "junk" | "godrolls" | "nowishlist";
type ViewMode = "weapons" | "armor";

function VaultContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [analysis, setAnalysis] = useState<VaultAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("weapons");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [weaponTypeFilter, setWeaponTypeFilter] = useState<string>("all");
  const [damageTypeFilter, setDamageTypeFilter] = useState<string>("all");
  const [showAllWeapons, setShowAllWeapons] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (isDemo) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAnalysis(DEMO_ANALYSIS);
      setDisplayName("DemoGuardian#1234");
      setLoading(false);
      return;
    }

    try {
      const profileRes = await fetch("/api/bungie/profile");
      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          window.location.href = "/";
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      const profile = await profileRes.json();
      setDisplayName(profile.displayName);

      const inventoryRes = await fetch("/api/bungie/inventory");
      if (!inventoryRes.ok) {
        const errData = await inventoryRes.json();
        throw new Error(errData.error || "Failed to fetch inventory");
      }
      const inventoryData = await inventoryRes.json();
      setAnalysis(inventoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Choose which groups to display based on toggle
  const baseGroups = showAllWeapons
    ? analysis?.allWeaponGroups
    : analysis?.duplicateGroups;

  // Derive unique weapon types and damage types for dropdown options
  const weaponTypes = baseGroups
    ? [...new Set(baseGroups.map((g) => g.weaponType))].sort()
    : [];
  const damageTypes = baseGroups
    ? [...new Set(baseGroups.map((g) => g.damageType))].sort()
    : [];

  const filteredGroups = baseGroups?.filter((group) => {
    // Status filter
    if (filter === "junk" && group.junkRecommendations.length === 0) return false;
    if (filter === "godrolls" && !group.rolls.some((r) => r.isGodRoll)) return false;
    if (filter === "nowishlist" && !group.rolls.some((r) => r.usedFallback)) return false;

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = group.weaponName.toLowerCase().includes(q);
      const typeMatch = group.weaponType.toLowerCase().includes(q);
      const perkMatch = group.rolls.some((r) =>
        r.perks.some((col) =>
          col.activePerks.some((p) => p.name.toLowerCase().includes(q))
        )
      );
      if (!nameMatch && !typeMatch && !perkMatch) return false;
    }

    // Weapon type dropdown
    if (weaponTypeFilter !== "all" && group.weaponType !== weaponTypeFilter) return false;

    // Damage type dropdown
    if (damageTypeFilter !== "all" && String(group.damageType) !== damageTypeFilter) return false;

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header displayName={displayName} isDemo={isDemo} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-yellow-500 animate-spin" />
            </div>
            <p className="text-gray-400 animate-pulse-glow">
              {isDemo
                ? "Loading demo data..."
                : "Scanning your vault and inventory..."}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {isDemo
                ? ""
                : "Downloading manifest and checking community wishlists"}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 mb-6 rounded-full bg-red-900/30 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <p className="text-red-400 font-medium mb-2">
              Failed to load vault data
            </p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchData();
              }}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && !error && (
          <>
            {/* Weapons | Armor view switcher */}
            <div className="mb-6 flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
              {(["weapons", "armor"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors capitalize ${
                    view === v
                      ? "bg-gray-700 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="mb-8">
              <StatsBar analysis={analysis} mode={view} />
            </div>

            {view === "weapons" ? (
              <>
            {/* Search & Filter Bar */}
            <div className="mb-6 space-y-3">
              {/* Search + Dropdowns row */}
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
                    placeholder="Search weapons or perks..."
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

                {/* Weapon type dropdown */}
                <select
                  value={weaponTypeFilter}
                  onChange={(e) => setWeaponTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors cursor-pointer"
                >
                  <option value="all">All Weapon Types</option>
                  {weaponTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {/* Damage type dropdown */}
                <select
                  value={damageTypeFilter}
                  onChange={(e) => setDamageTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors cursor-pointer"
                >
                  <option value="all">All Elements</option>
                  {damageTypes.map((dt) => (
                    <option key={dt} value={String(dt)}>
                      {DAMAGE_TYPES[dt]?.name || `Type ${dt}`}
                    </option>
                  ))}
                </select>

                {/* All weapons toggle */}
                <button
                  onClick={() => setShowAllWeapons(!showAllWeapons)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
                    showAllWeapons
                      ? "bg-blue-900/50 border-blue-700 text-blue-300"
                      : "bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {showAllWeapons ? "All Weapons" : "Duplicates Only"}
                </button>
              </div>

              {/* Status filter tabs + refresh */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === "all"
                        ? "bg-gray-700 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {showAllWeapons ? "All Weapons" : "All Duplicates"} ({baseGroups?.length || 0})
                  </button>
                  <button
                    onClick={() => setFilter("junk")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === "junk"
                        ? "bg-red-900/50 text-red-300"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Has Junk (
                    {
                      baseGroups?.filter(
                        (g) => g.junkRecommendations.length > 0
                      ).length || 0
                    }
                    )
                  </button>
                  <button
                    onClick={() => setFilter("godrolls")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === "godrolls"
                        ? "bg-yellow-900/50 text-yellow-300"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    God Rolls (
                    {
                      baseGroups?.filter((g) =>
                        g.rolls.some((r) => r.isGodRoll)
                      ).length || 0
                    }
                    )
                  </button>
                  <button
                    onClick={() => setFilter("nowishlist")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === "nowishlist"
                        ? "bg-purple-900/50 text-purple-300"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Not in Wishlist (
                    {
                      baseGroups?.filter((g) =>
                        g.rolls.some((r) => r.usedFallback)
                      ).length || 0
                    }
                    )
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Result count */}
                  {(searchQuery || weaponTypeFilter !== "all" || damageTypeFilter !== "all") && (
                    <span className="text-xs text-gray-500">
                      {filteredGroups?.length || 0} result{filteredGroups?.length !== 1 ? "s" : ""}
                    </span>
                  )}

                  {!isDemo && (
                    <button
                      onClick={() => {
                        setLoading(true);
                        setAnalysis(null);
                        fetchData();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                        />
                      </svg>
                      Refresh
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Duplicate Groups */}
            {filteredGroups && filteredGroups.length > 0 ? (
              <div className="space-y-6">
                {filteredGroups.map((group) => (
                  <DuplicateGroup key={group.weaponHash} group={group} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">
                  {searchQuery || weaponTypeFilter !== "all" || damageTypeFilter !== "all"
                    ? `No weapons match "${searchQuery || ""}"${weaponTypeFilter !== "all" ? ` in ${weaponTypeFilter}` : ""}${damageTypeFilter !== "all" ? ` (${DAMAGE_TYPES[Number(damageTypeFilter)]?.name || ""})` : ""}`
                    : filter === "all"
                      ? showAllWeapons
                        ? "No weapons found in your vault!"
                        : "No duplicate weapons found in your vault!"
                      : "No weapons match this filter."}
                </p>
                {(searchQuery || weaponTypeFilter !== "all" || damageTypeFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setWeaponTypeFilter("all");
                      setDamageTypeFilter("all");
                      setFilter("all");
                    }}
                    className="mt-3 text-sm text-gray-400 hover:text-gray-200 underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Junk Summary */}
            {analysis.junkCount > 0 && (
              <div className="mt-8 bg-red-950/20 border border-red-900/30 rounded-xl p-6 text-center">
                <p className="text-red-400 font-semibold text-lg">
                  {analysis.junkCount} weapon{analysis.junkCount !== 1 ? "s" : ""}{" "}
                  safe to dismantle
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  These are duplicate copies that don&apos;t match any community god
                  roll recommendations. The best copy of each weapon has been
                  marked to keep.
                </p>
              </div>
            )}
              </>
            ) : analysis.armor ? (
              <ArmorView armor={analysis.armor} />
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">
                  No armor data available yet. Refresh your vault to analyze armor.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center">
        <p className="text-xs text-gray-600">
          God roll data sourced from the Voltron community wishlist (light.gg +
          community curators). Not affiliated with Bungie.
        </p>
      </footer>
    </div>
  );
}

export default function VaultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
            <div className="absolute inset-0 rounded-full border-4 border-t-yellow-500 animate-spin" />
          </div>
        </div>
      }
    >
      <VaultContent />
    </Suspense>
  );
}
