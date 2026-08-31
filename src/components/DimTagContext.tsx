"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DimTag } from "@/lib/types";

interface DimTagOverridesValue {
  /** itemInstanceId -> user-chosen tag, when it differs from the suggestion */
  overrides: Record<string, DimTag>;
  /** Set a manual tag, or null to go back to the analyzer's suggestion */
  setOverride: (itemInstanceId: string, tag: DimTag | null) => void;
}

/** No-op default so cards render fine outside a provider (tags just aren't editable). */
const DimTagOverridesContext = createContext<DimTagOverridesValue>({
  overrides: {},
  setOverride: () => {},
});

/**
 * Holds the user's manual DIM tag choices for the current session. Lives above
 * both the weapons and armor views so a change on a card is reflected in the
 * DIM Tagging panel's counts, copy queries, and sync.
 */
export function DimTagOverridesProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, DimTag>>({});

  const setOverride = (itemInstanceId: string, tag: DimTag | null) => {
    setOverrides((current) => {
      if (tag === null) {
        if (!(itemInstanceId in current)) return current;
        const next = { ...current };
        delete next[itemInstanceId];
        return next;
      }
      return { ...current, [itemInstanceId]: tag };
    });
  };

  return (
    <DimTagOverridesContext.Provider value={{ overrides, setOverride }}>
      {children}
    </DimTagOverridesContext.Provider>
  );
}

export function useDimTagOverrides(): DimTagOverridesValue {
  return useContext(DimTagOverridesContext);
}
