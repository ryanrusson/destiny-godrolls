/**
 * Fallback perk scoring system for weapons not covered by the Voltron wishlist.
 *
 * Perks are matched by name (case-insensitive) since hashes can change across
 * seasons but names remain stable. Each perk is assigned a tier:
 *   S = universally excellent
 *   A = strong in most situations
 *   B = situationally good
 *
 * Only trait perks (columns 3 & 4) are scored — barrel/magazine choices have
 * much smaller impact and are too weapon-specific to rate generically.
 */

export type PerkTier = "S" | "A" | "B";

const PERK_TIERS: Record<string, PerkTier> = {
  // --- S-tier: universally excellent damage / reload perks ---
  "rampage": "S",
  "kill clip": "S",
  "outlaw": "S",
  "vorpal weapon": "S",
  "feeding frenzy": "S",
  "rapid hit": "S",
  "frenzy": "S",
  "desperado": "S",
  "fourth time's the charm": "S",
  "triple tap": "S",
  "reconstruction": "S",
  "overflow": "S",
  "voltshot": "S",
  "incandescent": "S",
  "firefly": "S",
  "explosive payload": "S",
  "timed payload": "S",
  "repulsor brace": "S",
  "destabilizing rounds": "S",
  "hatchling": "S",

  // --- A-tier: strong in most situations ---
  "demolitionist": "A",
  "one for all": "A",
  "multikill clip": "A",
  "swashbuckler": "A",
  "adrenaline junkie": "A",
  "subsistence": "A",
  "ambitious assassin": "A",
  "auto-loading holster": "A",
  "snapshot sights": "A",
  "slideshot": "A",
  "threat detector": "A",
  "perpetual motion": "A",
  "stats for all": "A",
  "wellspring": "A",
  "dragonfly": "A",
  "chain reaction": "A",
  "cluster bomb": "A",
  "explosive light": "A",
  "lasting impression": "A",
  "bait and switch": "A",
  "envious assassin": "A",
  "golden tricorn": "A",
  "target lock": "A",
  "collective action": "A",
  "precision instrument": "A",
  "cascade point": "A",
  "enlightened action": "A",
  "slice": "A",
  "cold steel": "A",
  "whirlwind blade": "A",
  "relentless strikes": "A",
  "surrounded": "A",
  "firing line": "A",
  "field prep": "A",
  "clown cartridge": "A",
  "lead from gold": "A",

  // --- B-tier: situationally good ---
  "rangefinder": "B",
  "opening shot": "B",
  "moving target": "B",
  "eye of the storm": "B",
  "killing wind": "B",
  "heating up": "B",
  "tunnel vision": "B",
  "steady hands": "B",
  "hip-fire grip": "B",
  "no distractions": "B",
  "zen moment": "B",
  "under pressure": "B",
  "unrelenting": "B",
  "grave robber": "B",
  "pulse monitor": "B",
  "sympathetic arsenal": "B",
  "encore": "B",
  "headstone": "B",
  "chill clip": "B",
  "gutshot straight": "B",
  "focused fury": "B",
  "successful warm-up": "B",
  "pugilist": "B",
};

const TIER_SCORES: Record<PerkTier, number> = { S: 3, A: 2, B: 1 };

export interface PerkRating {
  name: string;
  tier: PerkTier;
  score: number;
}

/**
 * Look up a perk's tier by name. Returns null for unrated perks.
 */
export function getPerkRating(perkName: string): PerkRating | null {
  const tier = PERK_TIERS[perkName.toLowerCase()];
  if (!tier) return null;
  return { name: perkName, tier, score: TIER_SCORES[tier] };
}

export type FallbackRating = "great" | "good" | "ok" | "none";

export interface FallbackResult {
  rating: FallbackRating;
  score: number;           // raw score (sum of selected trait perk tiers)
  maxScore: number;        // max possible score across all available perks
  ratedPerks: PerkRating[];
  bestAvailablePerks: PerkRating[];
}

/**
 * Score a weapon roll based on its selected trait perks (columns 3 & 4).
 *
 * Scoring thresholds (based on two trait columns, max 6 with two S-tier):
 *   great  – score >= 5  (e.g. two S-tier perks, or S + A)
 *   good   – score >= 3  (e.g. one S-tier, or A + A)
 *   ok     – score >= 1  (at least one rated perk)
 *   none   – score == 0  (no recognised perks)
 */
export function scoreFallbackRoll(
  perkColumns: { columnIndex: number; selectedPerk?: { name: string }; activePerks: { name: string }[] }[]
): FallbackResult {
  const traitColumns = perkColumns.filter((c) => c.columnIndex >= 3 && c.columnIndex <= 4);

  const ratedPerks: PerkRating[] = [];
  const bestAvailablePerks: PerkRating[] = [];
  let score = 0;
  let maxScore = 0;

  for (const col of traitColumns) {
    // Score the selected perk
    if (col.selectedPerk) {
      const rating = getPerkRating(col.selectedPerk.name);
      if (rating) {
        ratedPerks.push(rating);
        score += rating.score;
      }
    }

    // Find the best available perk in this column (for max score)
    let bestInCol: PerkRating | null = null;
    for (const perk of col.activePerks) {
      const rating = getPerkRating(perk.name);
      if (rating && (!bestInCol || rating.score > bestInCol.score)) {
        bestInCol = rating;
      }
    }
    if (bestInCol) {
      bestAvailablePerks.push(bestInCol);
      maxScore += bestInCol.score;
    }
  }

  let rating: FallbackRating;
  if (score >= 5) rating = "great";
  else if (score >= 3) rating = "good";
  else if (score >= 1) rating = "ok";
  else rating = "none";

  return { rating, score, maxScore, ratedPerks, bestAvailablePerks };
}
