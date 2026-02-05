"use client";

import { DuplicateGroup as DuplicateGroupType, DAMAGE_TYPES } from "@/lib/types";
import WeaponCard from "./WeaponCard";

interface DuplicateGroupProps {
  group: DuplicateGroupType;
}

export default function DuplicateGroup({ group }: DuplicateGroupProps) {
  const damageInfo = DAMAGE_TYPES[group.damageType] || DAMAGE_TYPES[0];
  const junkCount = group.junkRecommendations.length;

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Group Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {group.weaponIcon ? (
            <img
              src={group.weaponIcon}
              alt={group.weaponName}
              className="w-10 h-10 rounded bg-gray-800"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-white">{group.weaponName}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: damageInfo.color }}>
                {damageInfo.name}
              </span>
              <span className="text-xs text-gray-500">{group.weaponType}</span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs text-gray-400">
                {group.rolls.length} copies
              </span>
            </div>
          </div>
        </div>

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

      {/* Rolls Grid */}
      <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {group.rolls.map((roll) => {
          const isJunk = group.junkRecommendations.includes(roll.itemInstanceId);
          return (
            <WeaponCard
              key={roll.itemInstanceId}
              roll={roll}
              recommendation={isJunk ? "junk" : "keep"}
            />
          );
        })}
      </div>
    </div>
  );
}
