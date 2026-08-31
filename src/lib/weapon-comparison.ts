/**
 * Weapon comparison engine.
 *
 * The vault view originally only compared *duplicates* — two copies of the
 * same weapon hash. That misses the bigger cleanup question: you may own one
 * copy each of five Void submachine guns, and only need the best one or two.
 *
 * This module compares every roll along three axes:
 *
 *   1. Duplicates  - same weapon hash
 *   2. Archetype   - same weapon type + intrinsic frame + element
 *   3. Weapon type - same weapon type + equipment slot, any element
 *
 * Each roll gets a single verdict (keep / review / junk) and a suggested DIM
 * tag, computed once from all three passes, so the same instance carries the
 * same recommendation no matter which comparison you're looking at. That's
 * what makes the output usable for DIM bulk tagging: a DIM tag belongs to an
 * item, not to a grouping.
 */

import {
  ComparisonScope,
  DimTag,
  DIM_TAGS,
  DAMAGE_TYPES,
  WeaponGroup,
  WeaponRoll,
  WeaponSlot,
  WEAPON_SLOT_LABELS,
} from "./types";

/**
 * A junk roll is worth tagging "infuse" instead of "junk" when it out-powers
 * everything you're keeping in its slot by at least this much.
 */
const INFUSE_POWER_MARGIN = 1;

/**
 * How many strictly better rolls of the same role it takes before an
 * otherwise-keepable roll gets demoted to "review". Two means you always keep
 * a comfortable top pair for any given role.
 */
const OUTCLASSED_THRESHOLD = 2;

/** Score gap that counts as "meaningfully better" when comparing roles. */
const OUTCLASSED_SCORE_GAP = 100;

// ------------------------------------------------------------------
// Scoring
// ------------------------------------------------------------------

/**
 * Rank a roll against any other roll. Wishlist evidence dominates, then
 * generic perk quality, with power level as a tiebreaker.
 */
export function scoreRoll(roll: WeaponRoll): number {
  let score = 0;

  if (roll.isGodRoll) score += 1000;
  else if (roll.isRecommended) score += 500;

  score += roll.matchedPerkCount * 60;
  score += (roll.fallbackScore ?? 0) * 50;

  if (roll.location === "equipped") score += 150;

  // Tiebreaker only — power is trivially re-earned.
  score += roll.powerLevel * 0.01;

  return Math.round(score);
}

/** Sum of a roll's rated stats, used to break ties between similar rolls. */
function statTotal(roll: WeaponRoll): number {
  return roll.stats.reduce((sum, stat) => sum + stat.value, 0);
}

function compareRolls(a: WeaponRoll, b: WeaponRoll): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.powerLevel !== b.powerLevel) return b.powerLevel - a.powerLevel;
  return statTotal(b) - statTotal(a);
}

// ------------------------------------------------------------------
// Group keys and labels
// ------------------------------------------------------------------

function elementName(damageType: number): string {
  return DAMAGE_TYPES[damageType]?.name ?? "Unknown";
}

function frameName(roll: WeaponRoll): string | null {
  const trimmed = roll.frame?.trim();
  return trimmed ? trimmed : null;
}

export function archetypeKey(roll: WeaponRoll): string {
  return [roll.typeName, roll.damageType, frameName(roll) ?? "unknown-frame"].join("|");
}

export function typeKey(roll: WeaponRoll): string {
  return [roll.typeName, roll.slot].join("|");
}

function archetypeLabel(roll: WeaponRoll): string {
  return `${elementName(roll.damageType)} ${roll.typeName}`;
}

function archetypeSublabel(roll: WeaponRoll): string {
  const frame = frameName(roll);
  const slot = WEAPON_SLOT_LABELS[roll.slot];
  if (frame) return `${frame} · ${slot}`;
  // Exotics have no shared frame, so they land in their own archetype group.
  return roll.isExotic ? `Exotic · ${slot}` : `${slot} slot`;
}

function typeLabel(roll: WeaponRoll): string {
  return `${WEAPON_SLOT_LABELS[roll.slot]} ${roll.typeName}`;
}

/** The label already carries slot and type, so the sublabel covers the spread. */
function typeSublabel(rolls: WeaponRoll[]): string {
  const frames = [
    ...new Set(
      rolls
        .map((r) => frameName(r) ?? (r.isExotic ? "Exotic" : null))
        .filter((f): f is string => f !== null)
    ),
  ];
  const elements = [...new Set(rolls.map((r) => elementName(r.damageType)))];

  const parts: string[] = [];
  if (frames.length > 0) {
    parts.push(
      frames.length > 3 ? `${frames.slice(0, 3).join(", ")} +${frames.length - 3}` : frames.join(", ")
    );
  }
  parts.push(elements.length > 1 ? `${elements.length} elements` : elements[0]);
  return parts.join(" · ");
}

// ------------------------------------------------------------------
// Verdict passes
// ------------------------------------------------------------------

function addReason(roll: WeaponRoll, reason: string) {
  if (!roll.reasons.includes(reason)) roll.reasons.push(reason);
}

/**
 * Pass 1 — duplicates. Within a set of identical weapons, keep the god rolls,
 * the wishlist-recommended rolls, and whatever is equipped; junk the rest,
 * but never the last copy.
 */
function applyDuplicatePass(rolls: WeaponRoll[]) {
  const sorted = [...rolls].sort(compareRolls);

  for (const roll of sorted) {
    if (roll.location === "equipped") {
      roll.verdict = "keep";
      addReason(roll, "Currently equipped");
    } else if (roll.isGodRoll) {
      roll.verdict = "keep";
      addReason(
        roll,
        roll.usedFallback ? "Great roll on perk quality" : "Wishlist god roll"
      );
    } else if (roll.isRecommended) {
      roll.verdict = "keep";
      addReason(
        roll,
        roll.usedFallback ? "Good roll on perk quality" : "Matches a wishlist roll"
      );
    } else if (sorted.length > 1) {
      roll.verdict = "junk";
      addReason(roll, "Duplicate — a better copy is kept");
    } else {
      roll.verdict = "keep";
      addReason(roll, "Only copy you own");
    }
  }

  // Never junk every copy of a weapon.
  if (sorted.length > 1 && !sorted.some((r) => r.verdict === "keep")) {
    const best = sorted[0];
    best.verdict = "keep";
    best.reasons = best.reasons.filter(
      (r) => r !== "Duplicate — a better copy is kept"
    );
    addReason(best, "Best copy you own");
  }
}

/**
 * Pass 2 — cross-weapon. Different weapons that fill the same role compete
 * with each other. A roll that several similar weapons clearly beat drops to
 * "review" so it surfaces for a manual call; it is never auto-junked, because
 * losing a role comparison is a much softer signal than being a duplicate.
 */
function applyRolePass(rolls: WeaponRoll[], roleLabel: string) {
  // Exotics fill a slot no legendary competes for, so they neither win nor
  // lose a role comparison — they're only in the group to be looked at.
  const sorted = rolls.filter((r) => !r.isExotic).sort(compareRolls);
  if (sorted.length < 2) return;

  const best = sorted[0];
  if (best.verdict === "keep") {
    addReason(best, `Best ${roleLabel} you own`);
  }

  for (const roll of sorted) {
    if (roll.location === "equipped") continue;
    if (roll.isGodRoll) continue;
    if (roll.verdict !== "keep") continue;

    const better = sorted.filter(
      (other) =>
        other.itemInstanceId !== roll.itemInstanceId &&
        other.score - roll.score >= OUTCLASSED_SCORE_GAP
    );

    if (better.length >= OUTCLASSED_THRESHOLD) {
      roll.verdict = "review";
      roll.outclassedBy = {
        itemInstanceId: better[0].itemInstanceId,
        name: better[0].name,
      };
      addReason(
        roll,
        `Outclassed by ${better.length} other ${roleLabel}${
          better.length === 1 ? "" : "s"
        } you own`
      );
    }
  }
}

/**
 * Pass 3 — DIM tags. Maps each verdict onto DIM's tag vocabulary, with the
 * one refinement DIM users actually want: a junked roll that out-powers
 * everything you're keeping in its slot is infusion fuel, not trash.
 */
function applyDimTags(rolls: WeaponRoll[]) {
  const bestKeepPowerBySlot = new Map<WeaponSlot, number>();
  for (const roll of rolls) {
    if (roll.verdict !== "keep") continue;
    const current = bestKeepPowerBySlot.get(roll.slot) ?? 0;
    if (roll.powerLevel > current) bestKeepPowerBySlot.set(roll.slot, roll.powerLevel);
  }

  for (const roll of rolls) {
    if (roll.verdict === "keep") {
      roll.suggestedTag = roll.isGodRoll ? "favorite" : "keep";
      continue;
    }

    if (roll.verdict === "review") {
      roll.suggestedTag = "archive";
      continue;
    }

    const bestKeepPower = bestKeepPowerBySlot.get(roll.slot) ?? 0;
    if (roll.powerLevel >= bestKeepPower + INFUSE_POWER_MARGIN) {
      roll.suggestedTag = "infuse";
      addReason(roll, "Higher power than anything you're keeping in this slot");
    } else {
      roll.suggestedTag = "junk";
    }
  }
}

// ------------------------------------------------------------------
// Group building
// ------------------------------------------------------------------

/** Best value per stat hash across a group, for comparison highlighting. */
function computeStatLeaders(rolls: WeaponRoll[]): Record<number, number> {
  const leaders: Record<number, number> = {};
  for (const roll of rolls) {
    for (const stat of roll.stats) {
      const current = leaders[stat.statHash];
      if (current === undefined || stat.value > current) {
        leaders[stat.statHash] = stat.value;
      }
    }
  }
  return leaders;
}

function buildGroup(
  scope: ComparisonScope,
  groupKey: string,
  label: string,
  sublabel: string,
  rolls: WeaponRoll[],
  weaponHash?: number
): WeaponGroup {
  const sorted = [...rolls].sort((a, b) => {
    const order: Record<WeaponRoll["verdict"], number> = {
      keep: 0,
      review: 1,
      junk: 2,
    };
    if (order[a.verdict] !== order[b.verdict]) {
      return order[a.verdict] - order[b.verdict];
    }
    return compareRolls(a, b);
  });

  const primary = sorted[0];

  return {
    groupKey,
    scope,
    label,
    sublabel,
    icon: primary.icon,
    weaponHash,
    weaponType: primary.typeName,
    damageType: primary.damageType,
    slot: primary.slot,
    rolls: sorted,
    keepRecommendations: sorted
      .filter((r) => r.verdict === "keep")
      .map((r) => r.itemInstanceId),
    junkRecommendations: sorted
      .filter((r) => r.verdict === "junk")
      .map((r) => r.itemInstanceId),
    reviewRecommendations: sorted
      .filter((r) => r.verdict === "review")
      .map((r) => r.itemInstanceId),
    statLeaders: computeStatLeaders(sorted),
  };
}

function groupBy(
  rolls: WeaponRoll[],
  keyOf: (roll: WeaponRoll) => string
): Map<string, WeaponRoll[]> {
  const grouped = new Map<string, WeaponRoll[]>();
  for (const roll of rolls) {
    const key = keyOf(roll);
    const existing = grouped.get(key);
    if (existing) existing.push(roll);
    else grouped.set(key, [roll]);
  }
  return grouped;
}

export interface ComparisonResult {
  duplicateGroups: WeaponGroup[];
  allWeaponGroups: WeaponGroup[];
  archetypeGroups: WeaponGroup[];
  typeGroups: WeaponGroup[];
  godRollCount: number;
  keepCount: number;
  junkCount: number;
  reviewCount: number;
  tagCounts: Record<DimTag, number>;
}

/**
 * Evaluate every roll and build the comparison groups for all scopes.
 *
 * Mutates the rolls in place with score/verdict/reasons/suggestedTag — they
 * are freshly built per analysis run, and the UI needs the verdict on the
 * roll itself so it survives regrouping.
 */
export function compareWeapons(rolls: WeaponRoll[]): ComparisonResult {
  for (const roll of rolls) {
    roll.score = scoreRoll(roll);
    roll.reasons = [];
    roll.verdict = "review";
    roll.suggestedTag = "archive";
    roll.outclassedBy = undefined;
  }

  const byHash = groupBy(rolls, (r) => String(r.itemHash));
  for (const group of byHash.values()) {
    applyDuplicatePass(group);
  }

  const byArchetype = groupBy(rolls, archetypeKey);
  for (const group of byArchetype.values()) {
    applyRolePass(group, archetypeLabel(group[0]).toLowerCase());
  }

  applyDimTags(rolls);

  const allWeaponGroups: WeaponGroup[] = [];
  const duplicateGroups: WeaponGroup[] = [];

  for (const [key, group] of byHash) {
    const built = buildGroup(
      "all",
      key,
      group[0].name,
      // The card shows the element next to this, so don't repeat it.
      group[0].typeName,
      group,
      group[0].itemHash
    );
    allWeaponGroups.push(built);
    if (group.length > 1) {
      duplicateGroups.push({ ...built, scope: "duplicates" });
    }
  }

  const archetypeGroups = [...byArchetype].map(([key, group]) =>
    buildGroup(
      "archetype",
      key,
      archetypeLabel(group[0]),
      archetypeSublabel(group[0]),
      group
    )
  );

  const typeGroups = [...groupBy(rolls, typeKey)].map(([key, group]) =>
    buildGroup("type", key, typeLabel(group[0]), typeSublabel(group), group)
  );

  // Duplicates first by how much there is to clean up; role comparisons by
  // group size, since a crowded role is where the cleanup wins are.
  duplicateGroups.sort(
    (a, b) =>
      b.junkRecommendations.length - a.junkRecommendations.length ||
      a.label.localeCompare(b.label)
  );
  allWeaponGroups.sort((a, b) => a.label.localeCompare(b.label));

  const byCrowd = (a: WeaponGroup, b: WeaponGroup) =>
    b.rolls.length - a.rolls.length || a.label.localeCompare(b.label);
  archetypeGroups.sort(byCrowd);
  typeGroups.sort(byCrowd);

  const tagCounts = Object.fromEntries(DIM_TAGS.map((t) => [t, 0])) as Record<
    DimTag,
    number
  >;
  for (const roll of rolls) {
    tagCounts[roll.suggestedTag] += 1;
  }

  return {
    duplicateGroups,
    allWeaponGroups,
    archetypeGroups,
    typeGroups,
    godRollCount: rolls.filter((r) => r.isGodRoll).length,
    keepCount: rolls.filter((r) => r.verdict === "keep").length,
    junkCount: rolls.filter((r) => r.verdict === "junk").length,
    reviewCount: rolls.filter((r) => r.verdict === "review").length,
    tagCounts,
  };
}

// ------------------------------------------------------------------
// DIM interop
// ------------------------------------------------------------------

/**
 * Build a DIM search query that selects exactly these instances, e.g.
 * `id:6917529 or id:6917530`. Pasting it into DIM's search bar lets you bulk
 * tag the whole set from the item actions menu.
 */
export function buildDimQuery(instanceIds: string[]): string {
  return instanceIds.map((id) => `id:${id}`).join(" or ");
}

/** Instance ids per suggested DIM tag, ready for {@link buildDimQuery}. */
export function instanceIdsByTag(rolls: WeaponRoll[]): Record<DimTag, string[]> {
  const byTag = Object.fromEntries(DIM_TAGS.map((t) => [t, [] as string[]])) as Record<
    DimTag,
    string[]
  >;
  for (const roll of rolls) {
    byTag[roll.suggestedTag].push(roll.itemInstanceId);
  }
  return byTag;
}
