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
  /** Armor 3.0 gear tier (1-5); null/absent on pre-Edge of Fate gear */
  gearTier?: number | null;
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

export interface WeaponStat {
  statHash: number;
  name: string;
  value: number;
}

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
  stats: WeaponStat[];
  perks: PerkColumn[];
  isGodRoll: boolean;
  isRecommended: boolean;
  wishlistNotes: string[];
  /** Tags from matching wishlist entries (e.g. "pve", "god-pvp", "controller") */
  wishlistTags?: string[];
  matchedPerkCount: number;
  location: ItemLocation;
  characterId?: string;
  /** Fallback perk-based rating when no wishlist coverage exists */
  fallbackRating?: "great" | "good" | "ok" | "none";
  fallbackScore?: number;
  fallbackMaxScore?: number;
  /** True when this weapon had no wishlist entries and was scored via fallback */
  usedFallback?: boolean;
  /** True for Exotic-tier weapons (never junked by cross-weapon comparison) */
  isExotic: boolean;
  /** Equipment slot the weapon occupies */
  slot: WeaponSlot;
  /** Intrinsic frame name, e.g. "Adaptive Frame" (perk column 0) */
  frame?: string;

  // --- Comparison results (filled in by weapon-comparison.ts) ---
  /** Ranking score used to compare this roll against others */
  score: number;
  /** Overall verdict, considering duplicates *and* similar weapons you own */
  verdict: WeaponVerdict;
  /** Human-readable reasons behind the verdict */
  reasons: string[];
  /** DIM tag to apply to this instance */
  suggestedTag: DimTag;
  /** Set when a similar weapon you own beats this roll at the same role */
  outclassedBy?: { itemInstanceId: string; name: string };
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

export type WeaponSlot = "kinetic" | "energy" | "power";

export type WeaponVerdict = "keep" | "junk" | "review";

/**
 * DIM's item tag vocabulary. Every roll gets one so the analysis can be
 * applied to a vault through DIM's bulk tagging.
 */
export type DimTag = "favorite" | "keep" | "infuse" | "junk" | "archive";

export const DIM_TAGS: DimTag[] = [
  "favorite",
  "keep",
  "infuse",
  "junk",
  "archive",
];

export const DIM_TAG_LABELS: Record<DimTag, string> = {
  favorite: "Favorite",
  keep: "Keep",
  infuse: "Infuse",
  junk: "Junk",
  archive: "Archive",
};

export const DIM_TAG_HINTS: Record<DimTag, string> = {
  favorite: "God rolls — the ones you actually chase",
  keep: "Worth vault space",
  infuse: "Junk, but higher power than anything you're keeping in the slot",
  junk: "Safe to dismantle",
  archive: "Outclassed by similar weapons — worth a manual look",
};

export const DIM_TAG_STYLES: Record<DimTag, string> = {
  favorite: "bg-yellow-900/60 text-yellow-300 border-yellow-700/50",
  keep: "bg-green-900/60 text-green-300 border-green-800/50",
  infuse: "bg-sky-900/60 text-sky-300 border-sky-700/50",
  junk: "bg-red-900/60 text-red-300 border-red-800/50",
  archive: "bg-amber-900/50 text-amber-300 border-amber-800/50",
};

/**
 * How weapons are grouped for comparison. "duplicates" and "all" group by
 * weapon hash; the others compare *different* weapons that fill the same role.
 */
export type ComparisonScope = "duplicates" | "all" | "archetype" | "type";

export const COMPARISON_SCOPE_LABELS: Record<ComparisonScope, string> = {
  duplicates: "Duplicates",
  all: "All Weapons",
  archetype: "Same Archetype",
  type: "Same Weapon Type",
};

export const COMPARISON_SCOPE_HINTS: Record<ComparisonScope, string> = {
  duplicates: "Multiple copies of the same weapon",
  all: "Every weapon, grouped by name",
  archetype: "Weapons sharing type, frame, and element",
  type: "Weapons sharing type and slot, any element",
};

export const WEAPON_SLOT_LABELS: Record<WeaponSlot, string> = {
  kinetic: "Kinetic",
  energy: "Energy",
  power: "Power",
};

export interface WeaponGroup {
  /** Stable identity for the group within its scope */
  groupKey: string;
  scope: ComparisonScope;
  /** Weapon name for hash groups, role description for cross-weapon groups */
  label: string;
  /** Secondary line, e.g. "Adaptive Frame · Energy" */
  sublabel: string;
  icon: string;
  /** Only set for groups keyed on a single weapon hash */
  weaponHash?: number;
  weaponType: string;
  damageType: number;
  slot: WeaponSlot;
  rolls: WeaponRoll[];
  keepRecommendations: string[]; // instanceIds to keep
  junkRecommendations: string[]; // instanceIds to junk
  reviewRecommendations: string[]; // instanceIds worth a manual look
  /** Best value in the group per stat hash, for comparison highlighting */
  statLeaders: Record<number, number>;
}

export interface VaultAnalysis {
  totalWeapons: number;
  duplicateGroups: WeaponGroup[]; // 2+ copies of the same weapon
  allWeaponGroups: WeaponGroup[]; // All weapons including singles
  archetypeGroups: WeaponGroup[]; // Same type + frame + element
  typeGroups: WeaponGroup[]; // Same type + slot, any element
  godRollCount: number;
  junkCount: number;
  keepCount: number;
  reviewCount: number;
  /** Instance counts per suggested DIM tag */
  tagCounts: Record<DimTag, number>;
  armor?: ArmorAnalysis;
}

// --- Armor Analysis Types ---

export type ArmorSlot = "helmet" | "gauntlets" | "chest" | "legs" | "classItem";

export type ArmorVerdict = "keep" | "junk" | "review";

export type ArmorArchetype =
  | "Paragon"
  | "Grenadier"
  | "Specialist"
  | "Brawler"
  | "Bulwark"
  | "Gunner"
  | "Unknown";

export interface ArmorPiece {
  itemInstanceId: string;
  itemHash: number;
  name: string;
  icon: string;
  watermark?: string;
  tierName: string; // "Legendary" | "Exotic"
  isExotic: boolean;
  classType: number; // 0=Titan, 1=Hunter, 2=Warlock, 3=any (some class-agnostic exotics)
  slot: ArmorSlot;
  powerLevel: number;
  /** All 6 armor stats in ARMOR_STAT_ORDER order (value 0 when missing) */
  stats: WeaponStat[];
  statTotal: number;
  /** Armor 3.0 gear tier 1-5; null for legacy/unknown */
  gearTier: number | null;
  gearTierSource: "api" | "derived" | null;
  archetype: ArmorArchetype;
  /** Highest stat outside the archetype's primary/secondary pair */
  tertiaryStat?: WeaponStat;
  /** Pre-Edge of Fate armor without an Armor 3.0 archetype */
  isLegacy: boolean;
  /** Exotic class items: the rolled exotic perk pair */
  exoticPerks?: PerkInfo[];
  verdict: ArmorVerdict;
  /** Human-readable reason tags explaining the verdict */
  reasons: string[];
  /** Internal ranking score (higher = better) */
  score: number;
  location: ItemLocation;
  characterId?: string;
}

export interface ArmorGroup {
  groupKey: string; // "classType|slot|archetype", "classType|slot|legacy", or "exotic|itemHash"
  label: string;
  icon: string;
  classType: number;
  slot: ArmorSlot;
  archetype: ArmorArchetype;
  isExoticGroup: boolean;
  pieces: ArmorPiece[]; // sorted keep > review > junk, then score desc
  keepRecommendations: string[]; // instanceIds
  junkRecommendations: string[]; // instanceIds
}

export interface ArmorAnalysis {
  totalArmor: number;
  duplicateGroups: ArmorGroup[]; // groups with >= 2 pieces
  allArmorGroups: ArmorGroup[];
  keepCount: number;
  junkCount: number;
  reviewCount: number;
  tier5Count: number;
  exoticCount: number;
  legacyCount: number;
}

// --- Wishlist Types ---

export interface WishlistEntry {
  itemHash: number;
  recommendedPerks: number[][]; // Array of perk sets (each set is an array of perk hashes)
  notes: string;
  tags: string[]; // e.g. ["pve", "god-pvp", "controller"] from the |tags: block
}

export interface WishlistDatabase {
  entries: Map<number, WishlistEntry[]>;
  title: string;
  description: string;
  lastUpdated: Date;
  /** Enhanced trait hash -> base trait hash, for normalizing crafted/adept perks */
  enhancedToBase?: Map<number, number>;
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

/** Equipment slot hash -> weapon slot. Vault items report a generic bucket,
 *  so the definition's equippingBlock is the authoritative source. */
export const WEAPON_SLOT_HASHES: Record<number, WeaponSlot> = {
  1498876634: "kinetic",
  2465295065: "energy",
  953998645: "power",
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

// --- Armor Constants ---

export const ITEM_TYPE_ARMOR = 2;

// Equipment slot hashes (from equippingBlock.equipmentSlotTypeHash) -> armor slot
export const ARMOR_SLOT_HASHES: Record<number, ArmorSlot> = {
  3448274439: "helmet",
  3551918588: "gauntlets",
  14239492: "chest",
  20886954: "legs",
  1585787867: "classItem",
};

export const ARMOR_SLOT_LABELS: Record<ArmorSlot, string> = {
  helmet: "Helmet",
  gauntlets: "Arms",
  chest: "Chest",
  legs: "Legs",
  classItem: "Class Item",
};

export const CLASS_NAMES: Record<number, string> = {
  0: "Titan",
  1: "Hunter",
  2: "Warlock",
};

// Armor 3.0 stats (same hashes as the pre-Edge of Fate stats, renamed)
export const ARMOR_STAT_ORDER: { hash: number; name: string }[] = [
  { hash: 392767087, name: "Health" }, // was Resilience
  { hash: 4244567218, name: "Melee" }, // was Strength
  { hash: 1735777505, name: "Grenade" }, // was Discipline
  { hash: 144602215, name: "Super" }, // was Intellect
  { hash: 1943323491, name: "Class" }, // was Recovery
  { hash: 2996146975, name: "Weapons" }, // was Mobility
];

// Archetype -> [primary stat hash, secondary stat hash]
export const ARCHETYPE_STATS: Record<
  Exclude<ArmorArchetype, "Unknown">,
  [number, number]
> = {
  Paragon: [144602215, 4244567218], // Super / Melee
  Grenadier: [1735777505, 144602215], // Grenade / Super
  Specialist: [1943323491, 2996146975], // Class / Weapons
  Brawler: [4244567218, 392767087], // Melee / Health
  Bulwark: [392767087, 1943323491], // Health / Class
  Gunner: [2996146975, 1735777505], // Weapons / Grenade
};

// Gear tier stat-total bands (T5 also guarantees a 30/25/20 spread + tuning slot)
export const GEAR_TIER_STAT_RANGES: Record<number, [number, number]> = {
  1: [52, 57],
  2: [58, 63],
  3: [64, 69],
  4: [70, 74],
  5: [75, 75],
};

// Weapon stat hashes (display order)
export const WEAPON_STAT_ORDER: { hash: number; name: string }[] = [
  { hash: 4284893193, name: "RPM" },
  { hash: 4043523819, name: "Impact" },
  { hash: 1240592695, name: "Range" },
  { hash: 155624089, name: "Stability" },
  { hash: 943549884, name: "Handling" },
  { hash: 4188031367, name: "Reload Speed" },
  { hash: 1345609583, name: "Aim Assistance" },
  { hash: 3555269338, name: "Zoom" },
  { hash: 2714457168, name: "Airborne Effectiveness" },
  { hash: 3614673599, name: "Blast Radius" },
  { hash: 2523465841, name: "Velocity" },
  { hash: 447667954, name: "Draw Time" },
  { hash: 2961396640, name: "Charge Time" },
  { hash: 3871231066, name: "Magazine" },
  { hash: 2837207746, name: "Swing Speed" },
];
