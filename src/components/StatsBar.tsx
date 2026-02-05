"use client";

import { VaultAnalysis } from "@/lib/types";

interface StatsBarProps {
  analysis: VaultAnalysis;
}

export default function StatsBar({ analysis }: StatsBarProps) {
  const stats = [
    {
      label: "Total Weapons",
      value: analysis.totalWeapons,
      color: "text-gray-300",
      bg: "bg-gray-800",
    },
    {
      label: "Duplicate Groups",
      value: analysis.duplicateGroups.length,
      color: "text-blue-400",
      bg: "bg-blue-900/30",
    },
    {
      label: "God Rolls",
      value: analysis.godRollCount,
      color: "text-yellow-400",
      bg: "bg-yellow-900/30",
    },
    {
      label: "Safe to Junk",
      value: analysis.junkCount,
      color: "text-red-400",
      bg: "bg-red-900/30",
    },
    {
      label: "Keep",
      value: analysis.keepCount,
      color: "text-green-400",
      bg: "bg-green-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
