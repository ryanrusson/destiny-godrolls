"use client";

import { useState } from "react";
import { WeaponGroup, DAMAGE_TYPES, WEAPON_STAT_ORDER } from "@/lib/types";
import WeaponCard from "./WeaponCard";

interface ComparisonGroupCardProps {
  group: WeaponGroup;
}

/**
 * Side-by-side stat table for a comparison group. This is the part that makes
 * a cross-weapon group useful: which of these five void SMGs actually has the
 * range, and by how much.
 */
function StatComparison({ group }: { group: WeaponGroup }) {
  // Only show stats at least one roll in the group reports, in the canonical
  // display order, and skip stats every roll agrees on — they compare nothing.
  const rows = WEAPON_STAT_ORDER.filter(({ hash }) => {
    const values = group.rolls
      .map((roll) => roll.stats.find((s) => s.statHash === hash)?.value)
      .filter((v): v is number => v !== undefined);
    return values.length > 1 && new Set(values).size > 1;
  });

  if (rows.length === 0) {
    return (
      <p className="text-xs text-gray-500 px-5 py-3">
        These rolls report no differing stats to compare.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left font-medium text-gray-500 px-5 py-2 sticky left-0 bg-gray-900/50">
              Stat
            </th>
            {group.rolls.map((roll) => (
              <th
                key={roll.itemInstanceId}
                className="text-right font-medium text-gray-400 px-3 py-2 whitespace-nowrap"
              >
                {roll.name}
                <span className="block text-[10px] font-normal text-gray-600">
                  {roll.powerLevel} PL
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ hash, name }) => {
            const leader = group.statLeaders[hash];
            return (
              <tr key={hash} className="border-b border-gray-800/50 last:border-0">
                <td className="text-gray-400 px-5 py-1.5 sticky left-0 bg-gray-900/50 whitespace-nowrap">
                  {name}
                </td>
                {group.rolls.map((roll) => {
                  const value = roll.stats.find((s) => s.statHash === hash)?.value;
                  const leads = value !== undefined && value === leader;
                  return (
                    <td
                      key={roll.itemInstanceId}
                      className={`text-right px-3 py-1.5 tabular-nums ${
                        leads ? "text-blue-300 font-semibold" : "text-gray-500"
                      }`}
                    >
                      {value ?? "—"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ComparisonGroupCard({ group }: ComparisonGroupCardProps) {
  const [showStats, setShowStats] = useState(false);

  const damageInfo = DAMAGE_TYPES[group.damageType] || DAMAGE_TYPES[0];
  const junkCount = group.junkRecommendations.length;
  const reviewCount = group.reviewRecommendations.length;
  const isCrossWeapon = group.scope === "archetype" || group.scope === "type";
  const canCompare = group.rolls.length > 1;

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Group Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {group.icon ? (
            <img
              src={group.icon}
              alt={group.label}
              className="w-10 h-10 rounded bg-gray-800 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate">{group.label}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {!isCrossWeapon && (
                <span className="text-xs" style={{ color: damageInfo.color }}>
                  {damageInfo.name}
                </span>
              )}
              <span className="text-xs text-gray-500">{group.sublabel}</span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs text-gray-400">
                {group.rolls.length}{" "}
                {isCrossWeapon
                  ? group.rolls.length === 1
                    ? "weapon"
                    : "weapons"
                  : group.rolls.length === 1
                    ? "copy"
                    : "copies"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {reviewCount > 0 && (
            <span className="text-sm font-medium text-amber-400">
              {reviewCount} to review
            </span>
          )}

          {junkCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-red-400">
                {junkCount} to dismantle
              </span>
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </div>
          )}

          {canCompare && (
            <button
              onClick={() => setShowStats(!showStats)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                showStats
                  ? "bg-blue-900/50 border-blue-700 text-blue-300"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              {showStats ? "Hide stats" : "Compare stats"}
            </button>
          )}
        </div>
      </div>

      {/* Stat comparison table */}
      {showStats && canCompare && (
        <div className="border-b border-gray-800 bg-gray-900/50 py-1">
          <StatComparison group={group} />
        </div>
      )}

      {/* Rolls Grid */}
      <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {group.rolls.map((roll) => (
          <WeaponCard
            key={roll.itemInstanceId}
            roll={roll}
            statLeaders={canCompare ? group.statLeaders : undefined}
          />
        ))}
      </div>
    </div>
  );
}
