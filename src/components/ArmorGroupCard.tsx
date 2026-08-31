"use client";

import { ArmorGroup } from "@/lib/types";
import ArmorCard from "./ArmorCard";

interface ArmorGroupCardProps {
  group: ArmorGroup;
}

export default function ArmorGroupCard({ group }: ArmorGroupCardProps) {
  const junkCount = group.junkRecommendations.length;
  const reviewCount = group.pieces.filter((p) => p.verdict === "review").length;

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Group Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {group.icon ? (
            <img
              src={group.icon}
              alt={group.label}
              className="w-10 h-10 rounded bg-gray-800"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z" />
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-white">{group.label}</h3>
            <div className="flex items-center gap-2">
              {group.isExoticGroup && (
                <span className="text-xs font-medium text-yellow-400">Exotic</span>
              )}
              <span className="text-xs text-gray-400">
                {group.pieces.length} {group.pieces.length === 1 ? "copy" : "copies"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
        </div>
      </div>

      {/* Pieces Grid */}
      <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {group.pieces.map((piece) => (
          <ArmorCard key={piece.itemInstanceId} piece={piece} />
        ))}
      </div>
    </div>
  );
}
