import { ProfileResponse, bungieIconUrl } from "./bungie-api";
import { getItemDefinitions, isWeapon, isLegendaryOrExotic } from "./manifest";
import { fetchWishlist, checkWishlistMatch } from "./wishlist";
import {
  WeaponRoll,
  DuplicateGroup,
  VaultAnalysis,
  ItemLocation,
  ManifestItemDefinition,
  PerkColumn,
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

    columns.push({
      columnIndex: i,
      activePerks: [
        {
          perkHash: socket.plugHash,
          name: plugDef.displayProperties.name,
          icon: plugDef.displayProperties.icon || "",
          description: plugDef.displayProperties.description || "",
          isActive: socket.isEnabled,
          isWishlistPerk: matchingPerkHashes.has(socket.plugHash),
        },
      ],
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

    const perks = buildPerkColumns(sockets, itemDefs, wishlistResult.matchingPerkHashes);

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
      perks,
      isGodRoll: wishlistResult.isGodRoll,
      isRecommended: wishlistResult.isRecommended,
      wishlistNotes: wishlistResult.matchingNotes,
      matchedPerkCount: wishlistResult.matchedPerkCount,
      location,
      characterId,
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

    // Sort rolls: god rolls first, then by matched perk count, then by power level
    rolls.sort((a, b) => {
      if (a.isGodRoll !== b.isGodRoll) return a.isGodRoll ? -1 : 1;
      if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
      if (a.matchedPerkCount !== b.matchedPerkCount)
        return b.matchedPerkCount - a.matchedPerkCount;
      return b.powerLevel - a.powerLevel;
    });

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
      keepIds.push(rolls[0].itemInstanceId);
      const junkIndex = junkIds.indexOf(rolls[0].itemInstanceId);
      if (junkIndex > -1) junkIds.splice(junkIndex, 1);
    }

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
