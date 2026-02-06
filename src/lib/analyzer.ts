import { ProfileResponse, bungieIconUrl } from "./bungie-api";
import { getItemDefinitions, isWeapon, isLegendaryOrExotic } from "./manifest";
import { fetchWishlist, checkWishlistMatch } from "./wishlist";
import { scoreFallbackRoll } from "./perk-ratings";
import {
  WeaponRoll,
  WeaponStat,
  DuplicateGroup,
  VaultAnalysis,
  ItemLocation,
  ManifestItemDefinition,
  PerkColumn,
  PerkInfo,
  WEAPON_STAT_ORDER,
} from "./types";

function getItemLocation(
  item: { location: number; bucketHash: number },
  characterId?: string
): ItemLocation {
  // location: 1=inventory, 2=vault, 3=postmaster
  if (item.location === 2) return "vault";
  if (item.location === 3) return "postmaster";
  if (characterId) return "inventory";
  return "vault";
}

function buildPerkColumns(
  socketData: { plugHash: number; isEnabled: boolean; isVisible: boolean }[] | undefined,
  reusablePlugsData: Record<string, Array<{ plugItemHash: number; canInsert: boolean; enabled: boolean }>> | undefined,
  itemDefs: Map<number, ManifestItemDefinition>,
  matchingPerkHashes: Set<number>
): PerkColumn[] {
  if (!socketData) return [];

  const columns: PerkColumn[] = [];

  // Columns 0-4 are the main weapon perks
  // 0 = intrinsic frame, 1 = barrel, 2 = magazine, 3 = perk1, 4 = perk2
  for (let i = 0; i < Math.min(socketData.length, 5); i++) {
    const socket = socketData[i];
    if (!socket || !socket.plugHash) continue;

    const plugDef = itemDefs.get(socket.plugHash);
    if (!plugDef || !plugDef.displayProperties?.name) continue;

    // Skip empty/default plugs
    if (plugDef.displayProperties.name === "" || plugDef.itemType === 0) continue;

    // Build the list of all available perks for this column
    const allPerks: PerkInfo[] = [];
    const seenHashes = new Set<number>();
    const reusablePlugs = reusablePlugsData?.[String(i)];

    if (reusablePlugs && reusablePlugs.length > 0) {
      for (const plug of reusablePlugs) {
        if (seenHashes.has(plug.plugItemHash)) continue;
        seenHashes.add(plug.plugItemHash);

        const def = itemDefs.get(plug.plugItemHash);
        if (!def || !def.displayProperties?.name || def.displayProperties.name === "") continue;

        allPerks.push({
          perkHash: plug.plugItemHash,
          name: def.displayProperties.name,
          icon: def.displayProperties.icon || "",
          description: def.displayProperties.description || "",
          isActive: plug.plugItemHash === socket.plugHash,
          isWishlistPerk: matchingPerkHashes.has(plug.plugItemHash),
        });
      }
    }

    // If no reusable plugs data, fall back to just the equipped perk
    if (allPerks.length === 0) {
      allPerks.push({
        perkHash: socket.plugHash,
        name: plugDef.displayProperties.name,
        icon: plugDef.displayProperties.icon || "",
        description: plugDef.displayProperties.description || "",
        isActive: true,
        isWishlistPerk: matchingPerkHashes.has(socket.plugHash),
      });
    }

    columns.push({
      columnIndex: i,
      activePerks: allPerks,
      selectedPerk: {
        perkHash: socket.plugHash,
        name: plugDef.displayProperties.name,
        icon: plugDef.displayProperties.icon || "",
        description: plugDef.displayProperties.description || "",
        isActive: socket.isEnabled,
        isWishlistPerk: matchingPerkHashes.has(socket.plugHash),
      },
    });
  }

  return columns;
}

export async function analyzeProfile(
  profileData: ProfileResponse
): Promise<VaultAnalysis> {
  const [itemDefs, wishlist] = await Promise.all([
    getItemDefinitions(),
    fetchWishlist(),
  ]);

  // Collect all weapon items from vault and characters
  const allItems: {
    item: { itemHash: number; itemInstanceId?: string; bucketHash: number; location: number };
    characterId?: string;
    isEquipped: boolean;
  }[] = [];

  // Vault items
  if (profileData.profileInventory?.data?.items) {
    for (const item of profileData.profileInventory.data.items) {
      allItems.push({ item, isEquipped: false });
    }
  }

  // Character inventories
  if (profileData.characterInventories?.data) {
    for (const [charId, inv] of Object.entries(profileData.characterInventories.data)) {
      for (const item of inv.items) {
        allItems.push({ item, characterId: charId, isEquipped: false });
      }
    }
  }

  // Character equipment
  if (profileData.characterEquipment?.data) {
    for (const [charId, equip] of Object.entries(profileData.characterEquipment.data)) {
      for (const item of equip.items) {
        allItems.push({ item, characterId: charId, isEquipped: true });
      }
    }
  }

  // Filter to weapons only and build weapon rolls
  const weaponRolls: WeaponRoll[] = [];

  for (const { item, characterId, isEquipped } of allItems) {
    if (!item.itemInstanceId) continue;

    const itemDef = itemDefs.get(item.itemHash);
    if (!itemDef) continue;
    if (!isWeapon(itemDef)) continue;
    if (!isLegendaryOrExotic(itemDef)) continue;

    // Get instance data (power level, etc.)
    const instanceData = profileData.itemComponents?.instances?.data?.[item.itemInstanceId];
    const powerLevel = instanceData?.primaryStat?.value || 0;

    // Get stat data (Range, Stability, etc.)
    const statData = profileData.itemComponents?.stats?.data?.[item.itemInstanceId];
    const stats: WeaponStat[] = [];
    if (statData?.stats) {
      for (const statInfo of WEAPON_STAT_ORDER) {
        const stat = statData.stats[String(statInfo.hash)];
        if (stat && stat.value > 0) {
          stats.push({ statHash: statInfo.hash, name: statInfo.name, value: stat.value });
        }
      }
    }

    // Get socket data (equipped perks)
    const socketData = profileData.itemComponents?.sockets?.data?.[item.itemInstanceId];
    const sockets = socketData?.sockets || [];

    // Extract equipped perk hashes (columns 1-4 for barrel, mag, perk1, perk2)
    const equippedPerkHashes: number[] = [];
    for (let i = 0; i < sockets.length; i++) {
      if (sockets[i]?.plugHash) {
        equippedPerkHashes.push(sockets[i].plugHash);
      }
    }

    // Check wishlist
    const wishlistResult = checkWishlistMatch(
      item.itemHash,
      equippedPerkHashes,
      wishlist
    );

    const location: ItemLocation = isEquipped
      ? "equipped"
      : getItemLocation(item, characterId);

    const reusablePlugs = profileData.itemComponents?.reusablePlugs?.data?.[item.itemInstanceId]?.plugs;
    const perks = buildPerkColumns(sockets, reusablePlugs, itemDefs, wishlistResult.matchingPerkHashes);

    // Use fallback perk scoring when the weapon has no wishlist coverage
    const hasWishlistCoverage = wishlist.entries.has(item.itemHash);
    let fallbackRating: "great" | "good" | "ok" | "none" | undefined;
    let fallbackScore: number | undefined;
    let fallbackMaxScore: number | undefined;
    let usedFallback = false;

    if (!hasWishlistCoverage && perks.length > 0) {
      const fb = scoreFallbackRoll(perks);
      fallbackRating = fb.rating;
      fallbackScore = fb.score;
      fallbackMaxScore = fb.maxScore;
      usedFallback = true;
    }

    // If fallback scored this roll well, treat it as recommended
    const isRecommended = wishlistResult.isRecommended ||
      (usedFallback && (fallbackRating === "great" || fallbackRating === "good"));
    const isGodRoll = wishlistResult.isGodRoll ||
      (usedFallback && fallbackRating === "great");

    weaponRolls.push({
      itemInstanceId: item.itemInstanceId,
      itemHash: item.itemHash,
      name: itemDef.displayProperties?.name || "Unknown Weapon",
      icon: bungieIconUrl(itemDef.displayProperties?.icon || ""),
      screenshot: itemDef.screenshot ? bungieIconUrl(itemDef.screenshot) : undefined,
      watermark: itemDef.iconWatermark ? bungieIconUrl(itemDef.iconWatermark) : undefined,
      tierName: itemDef.inventory?.tierTypeName || "Unknown",
      typeName: itemDef.itemTypeDisplayName || "Unknown",
      damageType: itemDef.defaultDamageType || 0,
      powerLevel,
      stats,
      perks,
      isGodRoll,
      isRecommended,
      wishlistNotes: wishlistResult.matchingNotes,
      matchedPerkCount: wishlistResult.matchedPerkCount,
      location,
      characterId,
      fallbackRating,
      fallbackScore,
      fallbackMaxScore,
      usedFallback,
    });
  }

  // Group by weapon hash to find duplicates
  const grouped = new Map<number, WeaponRoll[]>();
  for (const roll of weaponRolls) {
    const existing = grouped.get(roll.itemHash) || [];
    existing.push(roll);
    grouped.set(roll.itemHash, existing);
  }

  // Build duplicate groups (weapons you have 2+ of)
  const duplicateGroups: DuplicateGroup[] = [];

  for (const [weaponHash, rolls] of grouped) {
    if (rolls.length < 2) continue;

    const keepIds: string[] = [];
    const junkIds: string[] = [];

    for (const roll of rolls) {
      if (roll.isGodRoll || roll.isRecommended || roll.location === "equipped") {
        keepIds.push(roll.itemInstanceId);
      } else {
        junkIds.push(roll.itemInstanceId);
      }
    }

    // Always keep at least one copy
    if (keepIds.length === 0 && rolls.length > 0) {
      // Pick the best roll to keep: highest matched perks, then fallback score, then power
      rolls.sort((a, b) => {
        if (a.matchedPerkCount !== b.matchedPerkCount)
          return b.matchedPerkCount - a.matchedPerkCount;
        if ((a.fallbackScore ?? 0) !== (b.fallbackScore ?? 0))
          return (b.fallbackScore ?? 0) - (a.fallbackScore ?? 0);
        return b.powerLevel - a.powerLevel;
      });
      keepIds.push(rolls[0].itemInstanceId);
      const junkIndex = junkIds.indexOf(rolls[0].itemInstanceId);
      if (junkIndex > -1) junkIds.splice(junkIndex, 1);
    }

    const keepSet = new Set(keepIds);

    // Sort rolls: keeps first (god rolls > recommended > best fallback), then junk
    rolls.sort((a, b) => {
      const aKeep = keepSet.has(a.itemInstanceId);
      const bKeep = keepSet.has(b.itemInstanceId);
      if (aKeep !== bKeep) return aKeep ? -1 : 1;
      if (a.isGodRoll !== b.isGodRoll) return a.isGodRoll ? -1 : 1;
      if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
      if (a.matchedPerkCount !== b.matchedPerkCount)
        return b.matchedPerkCount - a.matchedPerkCount;
      if ((a.fallbackScore ?? 0) !== (b.fallbackScore ?? 0))
        return (b.fallbackScore ?? 0) - (a.fallbackScore ?? 0);
      return b.powerLevel - a.powerLevel;
    });

    duplicateGroups.push({
      weaponHash,
      weaponName: rolls[0].name,
      weaponIcon: rolls[0].icon,
      weaponType: rolls[0].typeName,
      damageType: rolls[0].damageType,
      rolls,
      keepRecommendations: keepIds,
      junkRecommendations: junkIds,
    });
  }

  // Sort groups by number of junkable items (most junkable first)
  duplicateGroups.sort(
    (a, b) => b.junkRecommendations.length - a.junkRecommendations.length
  );

  return {
    totalWeapons: weaponRolls.length,
    duplicateGroups,
    godRollCount: weaponRolls.filter((w) => w.isGodRoll).length,
    junkCount: duplicateGroups.reduce(
      (sum, g) => sum + g.junkRecommendations.length,
      0
    ),
    keepCount: duplicateGroups.reduce(
      (sum, g) => sum + g.keepRecommendations.length,
      0
    ),
  };
}
