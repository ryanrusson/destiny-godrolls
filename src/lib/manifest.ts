import { getManifestUrls, getManifestTable } from "./bungie-api";
import {
  ManifestItemDefinition,
  ITEM_TYPE_WEAPON,
  ITEM_TYPE_ARMOR,
  ARMOR_SLOT_HASHES,
  ArmorSlot,
  TIER_EXOTIC,
  WeaponSlot,
  WEAPON_SLOT_HASHES,
} from "./types";

// In-memory cache for manifest data
let cachedItemDefs: Map<number, ManifestItemDefinition> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getItemDefinitions(): Promise<
  Map<number, ManifestItemDefinition>
> {
  // Return cached data if fresh
  if (cachedItemDefs && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedItemDefs;
  }

  const manifest = await getManifestUrls();
  const enPaths = manifest.jsonWorldComponentContentPaths["en"];

  if (!enPaths || !enPaths["DestinyInventoryItemDefinition"]) {
    throw new Error("Could not find item definitions in manifest");
  }

  const rawItems = (await getManifestTable(
    enPaths["DestinyInventoryItemDefinition"]
  )) as Record<string, ManifestItemDefinition>;

  const itemMap = new Map<number, ManifestItemDefinition>();
  for (const [hash, item] of Object.entries(rawItems)) {
    itemMap.set(Number(hash), item);
  }

  cachedItemDefs = itemMap;
  cacheTimestamp = Date.now();

  return itemMap;
}

export function isWeapon(item: ManifestItemDefinition): boolean {
  return item.itemType === ITEM_TYPE_WEAPON;
}

export function isLegendaryOrExotic(item: ManifestItemDefinition): boolean {
  const tier = item.inventory?.tierType;
  return tier === 5 || tier === 6; // Legendary or Exotic
}

export function isExotic(item: ManifestItemDefinition): boolean {
  return item.inventory?.tierType === TIER_EXOTIC;
}

export function isArmor(item: ManifestItemDefinition): boolean {
  return item.itemType === ITEM_TYPE_ARMOR;
}

/**
 * Weapon slot from the item definition. Like armor, vault items report a
 * generic bucket, so the definition's equipment slot is authoritative.
 * Defaults to kinetic when the definition is missing the slot.
 */
export function getWeaponSlot(item: ManifestItemDefinition): WeaponSlot {
  const slotHash = item.equippingBlock?.equipmentSlotTypeHash;
  if (!slotHash) return "kinetic";
  return WEAPON_SLOT_HASHES[slotHash] ?? "kinetic";
}

/**
 * Armor slot from the item definition. Live items in the vault report the
 * general armor bucket, so the definition's equipment slot is authoritative.
 */
export function getArmorSlot(item: ManifestItemDefinition): ArmorSlot | null {
  const slotHash = item.equippingBlock?.equipmentSlotTypeHash;
  if (!slotHash) return null;
  return ARMOR_SLOT_HASHES[slotHash] ?? null;
}

export function getWeaponPerks(
  sockets: { plugHash: number; isEnabled: boolean; isVisible: boolean }[],
  itemDefs: Map<number, ManifestItemDefinition>
): {
  perkHash: number;
  name: string;
  icon: string;
  description: string;
  columnIndex: number;
}[] {
  // Weapon perk columns are typically at indices 1-4 (after the intrinsic frame)
  // Index 0 = intrinsic/frame
  // Index 1 = barrel/blade/sight
  // Index 2 = magazine/battery
  // Index 3 = perk 1
  // Index 4 = perk 2
  // The rest are mod, masterwork, etc.

  const perks: {
    perkHash: number;
    name: string;
    icon: string;
    description: string;
    columnIndex: number;
  }[] = [];

  for (let i = 0; i < Math.min(sockets.length, 5); i++) {
    const socket = sockets[i];
    if (!socket || !socket.plugHash) continue;

    const plugDef = itemDefs.get(socket.plugHash);
    if (!plugDef) continue;

    perks.push({
      perkHash: socket.plugHash,
      name: plugDef.displayProperties?.name || "Unknown",
      icon: plugDef.displayProperties?.icon || "",
      description: plugDef.displayProperties?.description || "",
      columnIndex: i,
    });
  }

  return perks;
}
