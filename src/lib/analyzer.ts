import { ProfileResponse, bungieIconUrl } from "./bungie-api";
import {
  getItemDefinitions,
  getWeaponSlot,
  isExotic,
  isWeapon,
  isLegendaryOrExotic,
} from "./manifest";
import { fetchWishlist, checkWishlistMatch } from "./wishlist";
import { scoreFallbackRoll } from "./perk-ratings";
import { analyzeArmor } from "./armor-analyzer";
import { compareWeapons } from "./weapon-comparison";
import {
  WeaponRoll,
  WeaponStat,
  VaultAnalysis,
  ItemLocation,
  ManifestItemDefinition,
  PerkColumn,
  PerkInfo,
  WEAPON_STAT_ORDER,
} from "./types";

export function getItemLocation(
  item: { location: number; bucketHash: number },
  characterId?: string
): ItemLocation {
  // location: 1=inventory, 2=vault, 3=postmaster
  if (item.location === 2) return "vault";
  if (item.location === 3) return "postmaster";
  if (characterId) return "inventory";
  return "vault";
}

export interface CollectedItem {
  item: {
    itemHash: number;
    itemInstanceId?: string;
    bucketHash: number;
    location: number;
  };
  characterId?: string;
  isEquipped: boolean;
}

/** Gather every item instance from the vault, character inventories, and equipment. */
export function collectItems(profileData: ProfileResponse): CollectedItem[] {
  const allItems: CollectedItem[] = [];

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

  return allItems;
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

  // Collect all items from vault and characters
  const allItems = collectItems(profileData);

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
    const usedFallback = !hasWishlistCoverage;
    let fallbackRating: "great" | "good" | "ok" | "none" | undefined;
    let fallbackScore: number | undefined;
    let fallbackMaxScore: number | undefined;

    if (usedFallback && perks.length > 0) {
      const fb = scoreFallbackRoll(perks);
      fallbackRating = fb.rating;
      fallbackScore = fb.score;
      fallbackMaxScore = fb.maxScore;
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
      wishlistTags: wishlistResult.matchingTags,
      matchedPerkCount: wishlistResult.matchedPerkCount,
      location,
      characterId,
      fallbackRating,
      fallbackScore,
      fallbackMaxScore,
      usedFallback,
      isExotic: isExotic(itemDef),
      slot: getWeaponSlot(itemDef),
      frame: perks.find((c) => c.columnIndex === 0)?.selectedPerk?.name,
      // Filled in by compareWeapons() once every roll has been collected.
      score: 0,
      verdict: "review",
      reasons: [],
      suggestedTag: "archive",
    });
  }

  // Compare rolls against duplicates *and* similar weapons filling the same
  // role, then build the groups for every comparison scope.
  const comparison = compareWeapons(weaponRolls);

  const armor = analyzeArmor(profileData, itemDefs);

  return {
    totalWeapons: weaponRolls.length,
    ...comparison,
    armor,
  };
}
