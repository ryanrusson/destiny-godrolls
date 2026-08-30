import { WishlistEntry, WishlistDatabase } from "./types";

// Voltron wishlist URL - a popular aggregated community wishlist
// This combines recommendations from light.gg, Pandapaxxy, and other community sources
const VOLTRON_WISHLIST_URL =
  "https://raw.githubusercontent.com/48klocs/dim-wish-list-sources/master/voltron.txt";

let cachedWishlist: WishlistDatabase | null = null;
let wishlistCacheTimestamp = 0;
const WISHLIST_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// DIM wishlists use -69420 as a wildcard "any item" hash
const WILDCARD_ITEM_HASH = 69420;

/**
 * Split a DIM note string into display text and tags.
 * Notes may end with a tag block: "...some text|tags:PvE,God-PvP,MKB"
 * Tags are separated by commas and/or whitespace.
 */
export function splitNotesAndTags(rawNotes: string): { notes: string; tags: string[] } {
  const tagIndex = rawNotes.lastIndexOf("|tags:");
  if (tagIndex === -1) return { notes: rawNotes.trim(), tags: [] };

  const tags = rawNotes
    .substring(tagIndex + 6)
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  return { notes: rawNotes.substring(0, tagIndex).trim(), tags };
}

/**
 * Parse DIM wishlist format lines.
 *
 * Format: dimwishlist:item=ITEM_HASH&perks=PERK1,PERK2,PERK3,PERK4#notes:Some description
 * Also handles: dimwishlist:item=-ITEM_HASH (trash list / anti-wishlist)
 */
export function parseWishlistLine(
  line: string
): { itemHash: number; perks: number[]; notes: string | null; isTrash: boolean } | null {
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

  // Extract inline notes (null means "no inline notes" so block notes can apply)
  const notesMatch = trimmed.match(/#notes:(.*)/);
  const notes = notesMatch ? notesMatch[1].trim() : null;

  return { itemHash, perks, notes, isTrash };
}

/**
 * Parse a full DIM-format wishlist file (e.g. voltron.txt).
 *
 * Voltron is a concatenation of many sub-wishlists. Important format details:
 *  - The first title:/description: lines describe the overall list; later ones
 *    belong to embedded sub-lists and are ignored.
 *  - Most rolls get their notes from a preceding `//notes:` block line, which
 *    applies to every dimwishlist line after it until the next `//notes:` line
 *    (inline `#notes:` on a roll line takes precedence).
 *  - Notes may carry a trailing `|tags:` block (pve, pvp, god-pve, ...).
 */
export function parseWishlistText(text: string): WishlistDatabase {
  const entries = new Map<number, WishlistEntry[]>();
  let title = "";
  let description = "";

  // Notes from the current `//notes:` block, applied to subsequent rolls
  let blockNotes = "";
  let blockTags: string[] = [];

  // Dedupe identical item+perk-set combinations across sub-lists
  const seenRolls = new Set<string>();

  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Keep only the first (top-level) title/description
    if (trimmed.startsWith("title:")) {
      if (!title) title = trimmed.substring(6).trim();
      continue;
    }
    if (trimmed.startsWith("description:")) {
      if (!description) description = trimmed.substring(12).trim();
      continue;
    }

    // Block notes: apply to all following rolls until the next notes block
    if (trimmed.startsWith("//notes:")) {
      const split = splitNotesAndTags(trimmed.substring(8));
      blockNotes = split.notes;
      blockTags = split.tags;
      continue;
    }

    const parsed = parseWishlistLine(trimmed);
    if (!parsed || parsed.isTrash) continue;
    if (parsed.itemHash === WILDCARD_ITEM_HASH) continue;
    if (parsed.perks.length === 0) continue;

    const dedupeKey = `${parsed.itemHash}:${[...parsed.perks].sort((a, b) => a - b).join(",")}`;
    if (seenRolls.has(dedupeKey)) continue;
    seenRolls.add(dedupeKey);

    // Inline notes override the current block notes
    let notes = blockNotes;
    let tags = blockTags;
    if (parsed.notes !== null) {
      const split = splitNotesAndTags(parsed.notes);
      notes = split.notes;
      tags = split.tags;
    }

    const existing = entries.get(parsed.itemHash);
    if (!existing) {
      entries.set(parsed.itemHash, [
        { itemHash: parsed.itemHash, recommendedPerks: [parsed.perks], notes, tags },
      ]);
      continue;
    }

    // Rolls from the same notes block are grouped into one entry. Blocks are
    // contiguous in the file, so checking the last entry is enough.
    const last = existing[existing.length - 1];
    if (last.notes === notes && last.tags === tags) {
      last.recommendedPerks.push(parsed.perks);
    } else {
      existing.push({ itemHash: parsed.itemHash, recommendedPerks: [parsed.perks], notes, tags });
    }
  }

  return {
    entries,
    title: title || "Community Wishlist",
    description,
    lastUpdated: new Date(),
  };
}

export async function fetchWishlist(): Promise<WishlistDatabase> {
  if (cachedWishlist && Date.now() - wishlistCacheTimestamp < WISHLIST_CACHE_TTL) {
    return cachedWishlist;
  }

  try {
    // no-store: the file is ~26MB, far over Next.js' 2MB data-cache limit.
    // Caching is handled by the module-level cache above instead.
    const response = await fetch(VOLTRON_WISHLIST_URL, { cache: "no-store" });

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

const MAX_MATCHING_NOTES = 3;

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
  matchingTags: string[];
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
      matchingTags: [],
      matchingPerkHashes: new Set(),
    };
  }

  const equipped = new Set(equippedPerkHashes);

  let bestMatchCount = 0;
  let bestMaxPerks = 0;
  const allNotes = new Set<string>();
  const allTags = new Set<string>();
  const allMatchingPerks = new Set<number>();
  let hasFullMatch = false;

  for (const entry of entries) {
    for (const perkSet of entry.recommendedPerks) {
      let matchCount = 0;
      for (const p of perkSet) {
        if (equipped.has(p)) {
          matchCount++;
          allMatchingPerks.add(p);
        }
      }

      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestMaxPerks = perkSet.length;
      }

      // Full match = all perks from the wishlist entry are present
      if (matchCount === perkSet.length && perkSet.length >= 2) {
        hasFullMatch = true;
        if (entry.notes) allNotes.add(entry.notes);
        for (const tag of entry.tags) allTags.add(tag);
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
    matchingNotes: [...allNotes].slice(0, MAX_MATCHING_NOTES),
    matchingTags: [...allTags],
    matchingPerkHashes: allMatchingPerks,
  };
}
