import { WishlistEntry, WishlistDatabase } from "./types";

// Voltron wishlist URL - a popular aggregated community wishlist
// This combines recommendations from light.gg, Pandapaxxy, and other community sources
const VOLTRON_WISHLIST_URL =
  "https://raw.githubusercontent.com/48klocs/dim-wish-list-sources/master/voltron.txt";

let cachedWishlist: WishlistDatabase | null = null;
let wishlistCacheTimestamp = 0;
const WISHLIST_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Parse DIM wishlist format lines.
 *
 * Format: dimwishlist:item=ITEM_HASH&perks=PERK1,PERK2,PERK3,PERK4#notes:Some description
 * Also handles: dimwishlist:item=-ITEM_HASH (trash list / anti-wishlist)
 */
export function parseWishlistLine(
  line: string
): { itemHash: number; perks: number[]; notes: string; isTrash: boolean } | null {
  const trimmed = line.trim();

  if (!trimmed.startsWith("dimwishlist:item=")) return null;

  const isTrash = trimmed.includes("item=-");

  // Extract item hash
  const itemMatch = trimmed.match(/item=-?(\d+)/);
  if (!itemMatch) return null;
  const itemHash = parseInt(itemMatch[1], 10);

  // Extract perks
  const perksMatch = trimmed.match(/perks=([\d,]+)/);
  const perks = perksMatch
    ? perksMatch[1]
        .split(",")
        .map((p) => parseInt(p, 10))
        .filter((p) => !isNaN(p) && p > 0)
    : [];

  // Extract notes
  const notesMatch = trimmed.match(/#notes:(.*)/);
  const notes = notesMatch ? notesMatch[1].trim() : "";

  return { itemHash, perks, notes, isTrash };
}

export function parseWishlistText(text: string): WishlistDatabase {
  const entries = new Map<number, WishlistEntry[]>();
  let title = "Community Wishlist";
  let description = "";

  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Parse title/description comments
    if (trimmed.startsWith("title:")) {
      title = trimmed.substring(6).trim();
      continue;
    }
    if (trimmed.startsWith("description:")) {
      description = trimmed.substring(12).trim();
      continue;
    }

    const parsed = parseWishlistLine(trimmed);
    if (!parsed || parsed.isTrash) continue;
    if (parsed.perks.length === 0) continue;

    const existing = entries.get(parsed.itemHash) || [];
    // Check if this exact perk set already exists
    const isDuplicate = existing.some(
      (e) =>
        e.recommendedPerks.length > 0 &&
        e.recommendedPerks.some(
          (perkSet) =>
            perkSet.length === parsed.perks.length &&
            perkSet.every((p) => parsed.perks.includes(p))
        )
    );

    if (!isDuplicate) {
      existing.push({
        itemHash: parsed.itemHash,
        recommendedPerks: [parsed.perks],
        notes: parsed.notes,
        isExpert: parsed.notes.toLowerCase().includes("pve") ||
          parsed.notes.toLowerCase().includes("pvp") ||
          parsed.notes.toLowerCase().includes("god"),
      });
      entries.set(parsed.itemHash, existing);
    }
  }

  return {
    entries,
    title,
    description,
    lastUpdated: new Date(),
  };
}

export async function fetchWishlist(): Promise<WishlistDatabase> {
  if (cachedWishlist && Date.now() - wishlistCacheTimestamp < WISHLIST_CACHE_TTL) {
    return cachedWishlist;
  }

  try {
    const response = await fetch(VOLTRON_WISHLIST_URL, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wishlist: ${response.status}`);
    }

    const text = await response.text();
    cachedWishlist = parseWishlistText(text);
    wishlistCacheTimestamp = Date.now();
    return cachedWishlist;
  } catch (error) {
    console.error("Failed to fetch wishlist, using empty:", error);
    return {
      entries: new Map(),
      title: "Empty Wishlist",
      description: "Failed to load community wishlist",
      lastUpdated: new Date(),
    };
  }
}

/**
 * Check if a weapon's equipped perks match any wishlist entry.
 * Returns match info including how many perks matched and any notes.
 */
export function checkWishlistMatch(
  itemHash: number,
  equippedPerkHashes: number[],
  wishlist: WishlistDatabase
): {
  isGodRoll: boolean;
  isRecommended: boolean;
  matchedPerkCount: number;
  maxPossibleMatch: number;
  matchingNotes: string[];
  matchingPerkHashes: Set<number>;
} {
  const entries = wishlist.entries.get(itemHash);
  if (!entries || entries.length === 0) {
    return {
      isGodRoll: false,
      isRecommended: false,
      matchedPerkCount: 0,
      maxPossibleMatch: 0,
      matchingNotes: [],
      matchingPerkHashes: new Set(),
    };
  }

  let bestMatchCount = 0;
  let bestMaxPerks = 0;
  const allNotes: string[] = [];
  const allMatchingPerks = new Set<number>();
  let hasFullMatch = false;

  for (const entry of entries) {
    for (const perkSet of entry.recommendedPerks) {
      const matchCount = perkSet.filter((p) =>
        equippedPerkHashes.includes(p)
      ).length;

      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestMaxPerks = perkSet.length;
      }

      // Full match = all perks from the wishlist entry are present
      if (matchCount === perkSet.length && perkSet.length >= 2) {
        hasFullMatch = true;
        if (entry.notes) allNotes.push(entry.notes);
      }

      // Track which perks are in wishlists
      for (const p of perkSet) {
        if (equippedPerkHashes.includes(p)) {
          allMatchingPerks.add(p);
        }
      }
    }
  }

  // "God roll" = matches all perks in at least one wishlist entry
  // "Recommended" = matches 3+ perks from a wishlist entry
  return {
    isGodRoll: hasFullMatch,
    isRecommended: bestMatchCount >= 3 || hasFullMatch,
    matchedPerkCount: bestMatchCount,
    maxPossibleMatch: bestMaxPerks,
    matchingNotes: [...new Set(allNotes)],
    matchingPerkHashes: allMatchingPerks,
  };
}
