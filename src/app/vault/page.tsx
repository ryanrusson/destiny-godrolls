"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import DuplicateGroup from "@/components/DuplicateGroup";
import { VaultAnalysis } from "@/lib/types";
import { DEMO_ANALYSIS } from "@/lib/demo-data";

type FilterMode = "all" | "junk" | "godrolls";

function VaultContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [analysis, setAnalysis] = useState<VaultAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
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

  const filteredGroups = analysis?.duplicateGroups.filter((group) => {
    if (filter === "junk") return group.junkRecommendations.length > 0;
    if (filter === "godrolls")
      return group.rolls.some((r) => r.isGodRoll);
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
            {/* Stats */}
            <div className="mb-8">
              <StatsBar analysis={analysis} />
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-gray-700 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  All Duplicates ({analysis.duplicateGroups.length})
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
                    analysis.duplicateGroups.filter(
                      (g) => g.junkRecommendations.length > 0
                    ).length
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
                    analysis.duplicateGroups.filter((g) =>
                      g.rolls.some((r) => r.isGodRoll)
                    ).length
                  }
                  )
                </button>
              </div>

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
                  {filter === "all"
                    ? "No duplicate weapons found in your vault!"
                    : "No weapons match this filter."}
                </p>
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
