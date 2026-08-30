/**
 * Enhanced trait normalization.
 *
 * Crafted/adept weapons can have the *enhanced* version of a trait socketed,
 * which is a different item hash from the base perk that wishlists usually
 * reference. DIM maintains a canonical base->enhanced mapping in
 * d2-additional-info; we fetch it and normalize every perk hash (from both
 * the wishlist and the player's weapons) down to the base version so
 * enhanced rolls match wishlist entries that list base perks (and vice versa).
 */

const TRAIT_TO_ENHANCED_URL =
  "https://raw.githubusercontent.com/DestinyItemManager/d2-additional-info/master/output/trait-to-enhanced-trait.json";

let cachedMap: Map<number, number> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetch DIM's base->enhanced trait mapping and invert it to enhanced->base.
 * Returns an empty map on failure (matching then simply skips normalization).
 */
export async function fetchEnhancedToBaseMap(): Promise<Map<number, number>> {
  if (cachedMap && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedMap;
  }

  try {
    const response = await fetch(TRAIT_TO_ENHANCED_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch enhanced trait map: ${response.status}`);
    }

    const baseToEnhanced: Record<string, number> = await response.json();
    const enhancedToBase = new Map<number, number>();
    for (const [base, enhanced] of Object.entries(baseToEnhanced)) {
      enhancedToBase.set(enhanced, parseInt(base, 10));
    }

    cachedMap = enhancedToBase;
    cacheTimestamp = Date.now();
    return enhancedToBase;
  } catch (error) {
    console.error("Failed to fetch enhanced trait map, matching without it:", error);
    // Don't cache the failure so the next call retries
    return cachedMap ?? new Map();
  }
}

/** Map an enhanced trait hash to its base version; other hashes pass through. */
export function normalizePerkHash(
  hash: number,
  enhancedToBase: Map<number, number>
): number {
  return enhancedToBase.get(hash) ?? hash;
}
