import { ProfileResponse, bungieIconUrl } from "./bungie-api";
import { isArmor, isLegendaryOrExotic, getArmorSlot } from "./manifest";
import { collectItems, getItemLocation } from "./analyzer";
import {
  ArmorAnalysis,
  ArmorArchetype,
  ArmorGroup,
  ArmorPiece,
  ARCHETYPE_STATS,
  ARMOR_SLOT_LABELS,
  ARMOR_STAT_ORDER,
  CLASS_NAMES,
  DimTag,
  DIM_TAGS,
  ItemLocation,
  ManifestItemDefinition,
  PerkInfo,
  TIER_EXOTIC,
  WeaponStat,
} from "./types";

const ARCHETYPE_NAMES = Object.keys(ARCHETYPE_STATS) as Exclude<
  ArmorArchetype,
  "Unknown"
>[];

/**
 * Find the Armor 3.0 archetype from the intrinsic socket plug.
 * Falls back to inferring from the stat distribution (primary > secondary
 * ordering) when the plug isn't recognizable.
 */
function detectArchetype(
  socketPlugHashes: number[],
  stats: WeaponStat[],
  itemDefs: Map<number, ManifestItemDefinition>
): { archetype: ArmorArchetype; fromSocket: boolean } {
  for (const plugHash of socketPlugHashes) {
    const plugDef = itemDefs.get(plugHash);
    const plugName = plugDef?.displayProperties?.name;
    if (!plugName) continue;
    const match = ARCHETYPE_NAMES.find(
      (a) => plugName === a || plugName.startsWith(`${a} `)
    );
    if (match && plugDef?.itemTypeDisplayName?.toLowerCase().includes("archetype")) {
      return { archetype: match, fromSocket: true };
    }
    if (match && plugName === match) {
      return { archetype: match, fromSocket: true };
    }
  }

  // Fallback: match the top-two stats against an archetype's primary/secondary pair
  const sorted = [...stats].sort((a, b) => b.value - a.value);
  if (sorted.length >= 2 && sorted[0].value >= 20 && sorted[0].value > sorted[1].value) {
    for (const name of ARCHETYPE_NAMES) {
      const [primary, secondary] = ARCHETYPE_STATS[name];
      if (sorted[0].statHash === primary && sorted[1].statHash === secondary) {
        return { archetype: name, fromSocket: false };
      }
    }
  }

  return { archetype: "Unknown", fromSocket: false };
}

/** Derive a gear tier from the stat total when the API doesn't provide one. */
function deriveGearTier(statTotal: number): number {
  if (statTotal >= 75) return 5;
  if (statTotal >= 70) return 4;
  if (statTotal >= 64) return 3;
  if (statTotal >= 58) return 2;
  return 1;
}

/**
 * Exotic class item perks: the rolled pair of exotic intrinsic plugs
 * (e.g. Spirit of the Assassin / Spirit of the Star-Eater).
 */
function extractExoticClassItemPerks(
  socketPlugHashes: number[],
  itemDefs: Map<number, ManifestItemDefinition>
): PerkInfo[] {
  const perks: PerkInfo[] = [];
  for (const plugHash of socketPlugHashes) {
    const plugDef = itemDefs.get(plugHash);
    const name = plugDef?.displayProperties?.name;
    if (!name) continue;
    const displayType = plugDef.itemTypeDisplayName?.toLowerCase() ?? "";
    if (name.startsWith("Spirit of") || displayType.includes("exotic intrinsic")) {
      perks.push({
        perkHash: plugHash,
        name,
        icon: plugDef.displayProperties?.icon || "",
        description: plugDef.displayProperties?.description || "",
        isActive: true,
        isWishlistPerk: false,
      });
    }
  }
  return perks;
}

/** A dominates B: at least as good in every stat and gear tier, strictly better overall. */
function strictlyDominates(a: ArmorPiece, b: ArmorPiece): boolean {
  if ((a.gearTier ?? 0) < (b.gearTier ?? 0)) return false;
  if (a.statTotal <= b.statTotal) return false;
  for (let i = 0; i < ARMOR_STAT_ORDER.length; i++) {
    if (a.stats[i].value < b.stats[i].value) return false;
  }
  return true;
}

function rankingScore(piece: ArmorPiece): number {
  return (
    (piece.gearTier ?? 0) * 1000 +
    piece.statTotal * 10 +
    (piece.tertiaryStat?.value ?? 0)
  );
}

function groupLabel(piece: ArmorPiece): string {
  const className = CLASS_NAMES[piece.classType] ?? "";
  const slotLabel = ARMOR_SLOT_LABELS[piece.slot];
  if (piece.isExotic) return piece.name;
  if (piece.isLegacy) return `${className} ${slotLabel} — Legacy`.trim();
  return `${className} ${slotLabel} — ${piece.archetype}`.trim();
}

function assessLegendaryGroup(pieces: ArmorPiece[]): void {
  // 1. Legacy pieces are junk-leaning
  for (const piece of pieces) {
    if (piece.isLegacy) {
      if (piece.location === "equipped") {
        piece.verdict = "review";
        piece.reasons.push("Legacy armor (pre-Armor 3.0), but currently equipped");
      } else {
        piece.verdict = "junk";
        piece.reasons.push("Legacy armor (pre-Armor 3.0)");
      }
    }
  }

  const modern = pieces.filter((p) => !p.isLegacy);

  // 2. Strict domination within the group
  const dominated = new Set<string>();
  for (const b of modern) {
    for (const a of modern) {
      if (a === b) continue;
      if (strictlyDominates(a, b)) {
        dominated.add(b.itemInstanceId);
        b.verdict = "junk";
        b.reasons.push(`Strictly worse than another ${groupLabel(b)}`);
        break;
      }
    }
  }

  // 3. Tier/stat rules for the survivors
  const survivors = modern.filter((p) => !dominated.has(p.itemInstanceId));
  const bestScore = Math.max(...survivors.map((p) => p.score), 0);

  for (const piece of survivors) {
    const tier = piece.gearTier ?? 0;
    const tertiary = piece.tertiaryStat;

    if (tier >= 5) {
      piece.verdict = "keep";
      piece.reasons.push("Tier 5 — max stats with tuning slot");
    } else if (tier === 4) {
      if ((tertiary?.value ?? 0) >= 13) {
        piece.verdict = "keep";
        piece.reasons.push(
          `Tier 4 with strong tertiary (${tertiary!.name} ${tertiary!.value})`
        );
      } else {
        piece.verdict = "review";
        piece.reasons.push(
          tertiary
            ? `Tier 4, weak tertiary (${tertiary.name} ${tertiary.value})`
            : "Tier 4, unclear tertiary stat"
        );
      }
    } else if (tier === 3) {
      if (piece.score === bestScore) {
        piece.verdict = "keep";
        piece.reasons.push("Best of this archetype you own (Tier 3)");
      } else {
        piece.verdict = "review";
        piece.reasons.push("Tier 3 — worth replacing with a higher-tier drop");
      }
    } else {
      if (pieces.length === 1) {
        piece.verdict = "review";
        piece.reasons.push(`Low gear tier (T${tier || "?"}), but the only one you own`);
      } else {
        piece.verdict = "junk";
        piece.reasons.push(`Low gear tier (T${tier || "?"})`);
      }
    }
  }

  // Equipped pieces are never junked outright
  for (const piece of pieces) {
    if (piece.location === "equipped" && piece.verdict === "junk") {
      piece.verdict = "review";
    }
    if (piece.location === "equipped" && !piece.reasons.includes("Currently equipped")) {
      piece.reasons.push("Currently equipped");
    }
  }

  // 4. Every group keeps at least one piece
  if (pieces.length > 0 && !pieces.some((p) => p.verdict === "keep")) {
    const best = [...pieces].sort((a, b) => b.score - a.score)[0];
    if (best.verdict === "junk") {
      best.verdict = "keep";
      best.reasons.push("Best copy owned");
    }
  }
}

function assessExoticGroup(pieces: ArmorPiece[]): void {
  const isClassItemGroup = pieces[0].slot === "classItem";

  if (isClassItemGroup && pieces.some((p) => (p.exoticPerks?.length ?? 0) >= 2)) {
    // Exotic class items: keep the best copy of each unique perk combo
    const byCombo = new Map<string, ArmorPiece[]>();
    for (const piece of pieces) {
      if ((piece.exoticPerks?.length ?? 0) < 2) {
        piece.verdict = "review";
        piece.reasons.push("Could not read exotic perk roll — compare manually");
        continue;
      }
      const key = piece
        .exoticPerks!.map((p) => p.perkHash)
        .sort((a, b) => a - b)
        .join("|");
      const list = byCombo.get(key) ?? [];
      list.push(piece);
      byCombo.set(key, list);
    }

    for (const combo of byCombo.values()) {
      combo.sort((a, b) => b.score - a.score);
      combo[0].verdict = "keep";
      combo[0].reasons.push(
        `Unique perk combo: ${combo[0].exoticPerks!.map((p) => p.name).join(" + ")}`
      );
      for (const dupe of combo.slice(1)) {
        dupe.verdict = "junk";
        dupe.reasons.push("Duplicate perk combo — better copy kept");
      }
    }
  } else {
    // Regular exotics: keep the best roll of each distinct exotic
    const sorted = [...pieces].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    best.verdict = "keep";
    best.reasons.push("Best roll of this exotic");

    for (const piece of sorted.slice(1)) {
      const clearlyWorse =
        piece.statTotal <= best.statTotal - 5 &&
        (piece.gearTier ?? 0) <= (best.gearTier ?? 0);
      if (clearlyWorse) {
        piece.verdict = "junk";
        piece.reasons.push(
          `Lower-stat duplicate (${piece.statTotal} vs ${best.statTotal} total)`
        );
      } else {
        piece.verdict = "review";
        piece.reasons.push("Similar roll to your best copy — compare manually");
      }
    }
  }

  // Exotics: equipped copies are always keeps, and legacy is informational only
  for (const piece of pieces) {
    if (piece.location === "equipped") {
      if (piece.verdict !== "keep") {
        piece.verdict = "keep";
      }
      if (!piece.reasons.includes("Currently equipped")) {
        piece.reasons.push("Currently equipped");
      }
    }
    if (piece.isLegacy && !piece.reasons.some((r) => r.startsWith("Legacy"))) {
      piece.reasons.push("Legacy exotic — stats predate Armor 3.0");
    }
  }
}

export function analyzeArmor(
  profileData: ProfileResponse,
  itemDefs: Map<number, ManifestItemDefinition>
): ArmorAnalysis {
  const allItems = collectItems(profileData);
  const pieces: ArmorPiece[] = [];

  for (const { item, characterId, isEquipped } of allItems) {
    if (!item.itemInstanceId) continue;

    const itemDef = itemDefs.get(item.itemHash);
    if (!itemDef) continue;
    if (!isArmor(itemDef)) continue;
    if (!isLegendaryOrExotic(itemDef)) continue;

    const slot = getArmorSlot(itemDef);
    if (!slot) continue;

    const isExotic = itemDef.inventory?.tierType === TIER_EXOTIC;

    const instanceData = profileData.itemComponents?.instances?.data?.[item.itemInstanceId];
    const powerLevel = instanceData?.primaryStat?.value || 0;

    // All 6 Armor 3.0 stats, zero-filled so pieces stay comparable
    const statData = profileData.itemComponents?.stats?.data?.[item.itemInstanceId];
    const stats: WeaponStat[] = ARMOR_STAT_ORDER.map((statInfo) => ({
      statHash: statInfo.hash,
      name: statInfo.name,
      value: statData?.stats?.[String(statInfo.hash)]?.value ?? 0,
    }));
    const statTotal = stats.reduce((sum, s) => sum + s.value, 0);

    const socketData = profileData.itemComponents?.sockets?.data?.[item.itemInstanceId];
    const socketPlugHashes = (socketData?.sockets ?? [])
      .map((s) => s.plugHash)
      .filter((h): h is number => Boolean(h));

    const { archetype, fromSocket } = detectArchetype(socketPlugHashes, stats, itemDefs);

    // Gear tier: API value when present, else derived from the stat total
    const apiTier = instanceData?.gearTier;
    let gearTier: number | null = null;
    let gearTierSource: ArmorPiece["gearTierSource"] = null;
    if (typeof apiTier === "number" && apiTier >= 1 && apiTier <= 5) {
      gearTier = apiTier;
      gearTierSource = "api";
    } else if (archetype !== "Unknown") {
      gearTier = deriveGearTier(statTotal);
      gearTierSource = "derived";
    }

    // Legacy: no gear tier from the API and no Armor 3.0 archetype intrinsic
    const isLegacy = gearTierSource !== "api" && !(archetype !== "Unknown" && fromSocket);

    // Tertiary: highest stat outside the archetype's primary/secondary pair
    let tertiaryStat: WeaponStat | undefined;
    if (archetype !== "Unknown") {
      const [primary, secondary] = ARCHETYPE_STATS[archetype];
      tertiaryStat = [...stats]
        .filter((s) => s.statHash !== primary && s.statHash !== secondary)
        .sort((a, b) => b.value - a.value)[0];
    }

    const exoticPerks =
      isExotic && slot === "classItem"
        ? extractExoticClassItemPerks(socketPlugHashes, itemDefs).map((p) => ({
            ...p,
            icon: p.icon ? bungieIconUrl(p.icon) : "",
          }))
        : undefined;

    const location: ItemLocation = isEquipped
      ? "equipped"
      : getItemLocation(item, characterId);

    const piece: ArmorPiece = {
      itemInstanceId: item.itemInstanceId,
      itemHash: item.itemHash,
      name: itemDef.displayProperties?.name || "Unknown Armor",
      icon: bungieIconUrl(itemDef.displayProperties?.icon || ""),
      watermark: itemDef.iconWatermark ? bungieIconUrl(itemDef.iconWatermark) : undefined,
      tierName: itemDef.inventory?.tierTypeName || "Unknown",
      isExotic,
      classType: itemDef.classType,
      slot,
      powerLevel,
      stats,
      statTotal,
      gearTier: isLegacy && !isExotic ? null : gearTier,
      gearTierSource,
      archetype,
      tertiaryStat,
      isLegacy,
      exoticPerks: exoticPerks && exoticPerks.length > 0 ? exoticPerks : undefined,
      verdict: "review",
      reasons: [],
      suggestedTag: "archive",
      score: 0,
      location,
      characterId,
    };
    piece.score = rankingScore(piece);
    pieces.push(piece);
  }

  // Group: exotics per itemHash; legendaries per class|slot|archetype (legacy separately)
  const grouped = new Map<string, ArmorPiece[]>();
  for (const piece of pieces) {
    const key = piece.isExotic
      ? `exotic|${piece.itemHash}`
      : piece.isLegacy
        ? `${piece.classType}|${piece.slot}|legacy`
        : `${piece.classType}|${piece.slot}|${piece.archetype}`;
    const list = grouped.get(key) ?? [];
    list.push(piece);
    grouped.set(key, list);
  }

  const allArmorGroups: ArmorGroup[] = [];
  const duplicateGroups: ArmorGroup[] = [];

  for (const [groupKey, groupPieces] of grouped) {
    if (groupPieces[0].isExotic) {
      assessExoticGroup(groupPieces);
    } else {
      assessLegendaryGroup(groupPieces);
    }

    const verdictOrder: Record<ArmorPiece["verdict"], number> = {
      keep: 0,
      review: 1,
      junk: 2,
    };
    groupPieces.sort((a, b) => {
      if (verdictOrder[a.verdict] !== verdictOrder[b.verdict]) {
        return verdictOrder[a.verdict] - verdictOrder[b.verdict];
      }
      return b.score - a.score;
    });

    const best = groupPieces[0];
    const group: ArmorGroup = {
      groupKey,
      label: groupLabel(best),
      icon: best.icon,
      classType: best.classType,
      slot: best.slot,
      archetype: best.archetype,
      isExoticGroup: best.isExotic,
      pieces: groupPieces,
      keepRecommendations: groupPieces
        .filter((p) => p.verdict === "keep")
        .map((p) => p.itemInstanceId),
      junkRecommendations: groupPieces
        .filter((p) => p.verdict === "junk")
        .map((p) => p.itemInstanceId),
    };

    allArmorGroups.push(group);
    if (groupPieces.length >= 2) {
      duplicateGroups.push(group);
    }
  }

  // Most junkable groups first; all-groups list alphabetical
  duplicateGroups.sort(
    (a, b) => b.junkRecommendations.length - a.junkRecommendations.length
  );
  allArmorGroups.sort((a, b) => a.label.localeCompare(b.label));

  // Map verdicts onto DIM's tag vocabulary, mirroring the weapon pass:
  // review -> "archive" (worth a manual look). Kept Tier 5s and exotics are
  // the armor equivalent of god rolls, so they get "favorite".
  const tagCounts = Object.fromEntries(DIM_TAGS.map((t) => [t, 0])) as Record<
    DimTag,
    number
  >;
  for (const piece of pieces) {
    if (piece.verdict === "keep") {
      piece.suggestedTag =
        piece.gearTier === 5 || piece.isExotic ? "favorite" : "keep";
    } else if (piece.verdict === "junk") {
      piece.suggestedTag = "junk";
    } else {
      piece.suggestedTag = "archive";
    }
    tagCounts[piece.suggestedTag] += 1;
  }

  return {
    totalArmor: pieces.length,
    duplicateGroups,
    allArmorGroups,
    keepCount: pieces.filter((p) => p.verdict === "keep").length,
    junkCount: pieces.filter((p) => p.verdict === "junk").length,
    reviewCount: pieces.filter((p) => p.verdict === "review").length,
    tier5Count: pieces.filter((p) => p.gearTier === 5).length,
    exoticCount: pieces.filter((p) => p.isExotic).length,
    legacyCount: pieces.filter((p) => p.isLegacy).length,
    tagCounts,
  };
}
