// ============================================================
// Destiny 2 God Roll Checker - Core Types
// ============================================================

// --- Bungie API Types ---

export interface BungieTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  membership_id: string;
}

export interface BungieMembership {
  membershipType: number;
  membershipId: string;
  displayName: string;
  bungieGlobalDisplayName: string;
  bungieGlobalDisplayNameCode: number;
}

export interface BungieProfile {
  membershipType: number;
  membershipId: string;
  characters: Record<string, BungieCharacter>;
}

export interface BungieCharacter {
  characterId: string;
  classType: number; // 0=Titan, 1=Hunter, 2=Warlock
  light: number;
  emblemPath: string;
}

// --- Inventory & Item Types ---

export interface DestinyItemComponent {
  itemHash: number;
  itemInstanceId?: string;
  quantity: number;
  bucketHash: number;
  location: number; // 1=inventory, 2=vault, 3=postmaster
}

export interface DestinyItemInstance {
  primaryStat?: {
    value: number;
    statHash: number;
  };
  damageType?: number;
  isEquipped: boolean;
}

export interface DestinyItemSocket {
  plugHash: number;
  isEnabled: boolean;
  isVisible: boolean;
}

export interface DestinyItemSocketsComponent {
  sockets: DestinyItemSocket[];
}

// --- Manifest Types ---

export interface ManifestItemDefinition {
  hash: number;
  displayProperties: {
    name: string;
    description: string;
    icon: string;
    hasIcon: boolean;
  };
  itemTypeDisplayName: string;
  itemType: number;
  itemSubType: number;
  classType: number;
  equippingBlock?: {
    equipmentSlotTypeHash: number;
  };
  inventory?: {
    tierTypeName: string;
    tierType: number;
  };
  quality?: {
    versions: Array<{ powerCapHash: number }>;
  };
  screenshot?: string;
  iconWatermark?: string;
  collectibleHash?: number;
  damageTypes?: number[];
  defaultDamageType?: number;
}

// --- Weapon Analysis Types ---

export interface WeaponRoll {
  itemInstanceId: string;
  itemHash: number;
  name: string;
  icon: string;
  screenshot?: string;
  watermark?: string;
  tierName: string;
  typeName: string;
  damageType: number;
  powerLevel: number;
  perks: PerkColumn[];
  isGodRoll: boolean;
  isRecommended: boolean;
  wishlistNotes: string[];
  matchedPerkCount: number;
  location: ItemLocation;
  characterId?: string;
}

export interface PerkColumn {
  columnIndex: number;
  activePerks: PerkInfo[];
  selectedPerk?: PerkInfo;
}

export interface PerkInfo {
  perkHash: number;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
  isWishlistPerk: boolean;
}

export type ItemLocation = "vault" | "inventory" | "equipped" | "postmaster";

export interface DuplicateGroup {
  weaponHash: number;
  weaponName: string;
  weaponIcon: string;
  weaponType: string;
  damageType: number;
  rolls: WeaponRoll[];
  keepRecommendations: string[]; // instanceIds to keep
  junkRecommendations: string[]; // instanceIds to junk
}

export interface VaultAnalysis {
  totalWeapons: number;
  duplicateGroups: DuplicateGroup[];
  godRollCount: number;
  junkCount: number;
  keepCount: number;
}

// --- Wishlist Types ---

export interface WishlistEntry {
  itemHash: number;
  recommendedPerks: number[][]; // Array of perk sets (each set is an array of perk hashes)
  notes: string;
  isExpert: boolean;
}

export interface WishlistDatabase {
  entries: Map<number, WishlistEntry[]>;
  title: string;
  description: string;
  lastUpdated: Date;
}

// --- Session Types ---

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  bungieMembershipId: string;
  destinyMembershipId: string;
  destinyMembershipType: number;
  displayName: string;
}

// --- Damage Type Constants ---

export const DAMAGE_TYPES: Record<number, { name: string; color: string }> = {
  0: { name: "Kinetic", color: "#d9d9d9" },
  1: { name: "Kinetic", color: "#d9d9d9" },
  2: { name: "Arc", color: "#7AECF3" },
  3: { name: "Solar", color: "#F2721B" },
  4: { name: "Void", color: "#B185DF" },
  6: { name: "Stasis", color: "#4D88FF" },
  7: { name: "Strand", color: "#3FD388" },
};

// --- Weapon Slot Constants ---

export const WEAPON_BUCKET_HASHES = {
  kinetic: 1498876634,
  energy: 2465295065,
  power: 953998645,
};

// Item type enum values from Bungie API
export const ITEM_TYPE_WEAPON = 3;
export const ITEM_SUB_TYPES = {
  autoRifle: 6,
  shotgun: 7,
  machineGun: 8,
  handCannon: 9,
  rocketLauncher: 10,
  fusionRifle: 11,
  sniperRifle: 12,
  pulseRifle: 13,
  scoutRifle: 14,
  sidearm: 17,
  sword: 18,
  linearFusionRifle: 22,
  grenadeLauncher: 23,
  submachineGun: 24,
  traceRifle: 25,
  bow: 31,
  glaive: 33,
};

// Tier type values
export const TIER_LEGENDARY = 5;
export const TIER_EXOTIC = 6;
