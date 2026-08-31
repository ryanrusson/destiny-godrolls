import { ArmorAnalysis, ArmorGroup, ArmorPiece, ARMOR_STAT_ORDER } from "./types";

// Demo armor data showcasing the Armor 3.0 assessment without a Bungie sign-in

// Empty icons render the components' built-in placeholder, which avoids
// shipping stale Bungie CDN hashes that 404 in demo mode.
const DEMO_ARMOR_ICONS = {
  hunterHelmet: "",
  warlockChest: "",
  titanLegs: "",
  wormhusk: "",
  relativism: "",
};

/** Build the 6-stat array from values keyed by stat name. */
function armorStats(values: Record<string, number>): ArmorPiece["stats"] {
  return ARMOR_STAT_ORDER.map((s) => ({
    statHash: s.hash,
    name: s.name,
    value: values[s.name] ?? 0,
  }));
}

function makeArmorPiece(
  overrides: Partial<ArmorPiece> & {
    itemInstanceId: string;
    itemHash: number;
    name: string;
  }
): ArmorPiece {
  const piece: ArmorPiece = {
    icon: "",
    tierName: "Legendary",
    isExotic: false,
    classType: 1,
    slot: "helmet",
    powerLevel: 450,
    stats: armorStats({}),
    statTotal: 0,
    gearTier: null,
    gearTierSource: null,
    archetype: "Unknown",
    isLegacy: false,
    verdict: "review",
    reasons: [],
    score: 0,
    location: "vault",
    ...overrides,
  };
  piece.statTotal = piece.stats.reduce((sum, s) => sum + s.value, 0);
  piece.score =
    (piece.gearTier ?? 0) * 1000 +
    piece.statTotal * 10 +
    (piece.tertiaryStat?.value ?? 0);
  return piece;
}

// --- Hunter Helmet, Bulwark: T5 keep / T3 review / T2 dominated junk ---

const bulwarkT5 = makeArmorPiece({
  itemInstanceId: "demo-armor-001",
  itemHash: 9001001,
  name: "Lustrous Helm",
  icon: DEMO_ARMOR_ICONS.hunterHelmet,
  classType: 1,
  slot: "helmet",
  archetype: "Bulwark",
  gearTier: 5,
  gearTierSource: "api",
  stats: armorStats({ Health: 30, Class: 25, Grenade: 20 }),
  tertiaryStat: { statHash: 1735777505, name: "Grenade", value: 20 },
  verdict: "keep",
  reasons: ["Tier 5 — max stats with tuning slot"],
  location: "equipped",
  characterId: "char-1",
});

const bulwarkT3 = makeArmorPiece({
  itemInstanceId: "demo-armor-002",
  itemHash: 9001001,
  name: "Lustrous Helm",
  icon: DEMO_ARMOR_ICONS.hunterHelmet,
  classType: 1,
  slot: "helmet",
  archetype: "Bulwark",
  gearTier: 3,
  gearTierSource: "api",
  stats: armorStats({ Health: 26, Class: 21, Super: 17, Weapons: 3 }),
  tertiaryStat: { statHash: 144602215, name: "Super", value: 17 },
  verdict: "review",
  reasons: ["Tier 3 — worth replacing with a higher-tier drop"],
});

const bulwarkT2 = makeArmorPiece({
  itemInstanceId: "demo-armor-003",
  itemHash: 9001001,
  name: "Lustrous Helm",
  icon: DEMO_ARMOR_ICONS.hunterHelmet,
  classType: 1,
  slot: "helmet",
  archetype: "Bulwark",
  gearTier: 2,
  gearTierSource: "api",
  stats: armorStats({ Health: 24, Class: 19, Grenade: 15 }),
  tertiaryStat: { statHash: 1735777505, name: "Grenade", value: 15 },
  verdict: "junk",
  reasons: ["Strictly worse than another Hunter Helmet — Bulwark"],
});

const hunterBulwarkGroup: ArmorGroup = {
  groupKey: "1|helmet|Bulwark",
  label: "Hunter Helmet — Bulwark",
  icon: DEMO_ARMOR_ICONS.hunterHelmet,
  classType: 1,
  slot: "helmet",
  archetype: "Bulwark",
  isExoticGroup: false,
  pieces: [bulwarkT5, bulwarkT3, bulwarkT2],
  keepRecommendations: [bulwarkT5.itemInstanceId],
  junkRecommendations: [bulwarkT2.itemInstanceId],
};

// --- Warlock Chest, Grenadier: T4 singleton keep ---

const grenadierT4 = makeArmorPiece({
  itemInstanceId: "demo-armor-004",
  itemHash: 9001002,
  name: "Duelist's Robes",
  icon: DEMO_ARMOR_ICONS.warlockChest,
  classType: 2,
  slot: "chest",
  archetype: "Grenadier",
  gearTier: 4,
  gearTierSource: "api",
  stats: armorStats({ Grenade: 29, Super: 24, Melee: 18, Health: 2 }),
  tertiaryStat: { statHash: 4244567218, name: "Melee", value: 18 },
  verdict: "keep",
  reasons: ["Tier 4 with strong tertiary (Melee 18)"],
});

const warlockGrenadierGroup: ArmorGroup = {
  groupKey: "2|chest|Grenadier",
  label: "Warlock Chest — Grenadier",
  icon: DEMO_ARMOR_ICONS.warlockChest,
  classType: 2,
  slot: "chest",
  archetype: "Grenadier",
  isExoticGroup: false,
  pieces: [grenadierT4],
  keepRecommendations: [grenadierT4.itemInstanceId],
  junkRecommendations: [],
};

// --- Titan Legs, legacy Armor 2.0 piece: junk ---

const legacyLegs = makeArmorPiece({
  itemInstanceId: "demo-armor-005",
  itemHash: 9001003,
  name: "Lightkin Greaves",
  icon: DEMO_ARMOR_ICONS.titanLegs,
  classType: 0,
  slot: "legs",
  archetype: "Unknown",
  gearTier: null,
  gearTierSource: null,
  isLegacy: true,
  stats: armorStats({ Health: 16, Class: 12, Grenade: 10, Super: 9, Melee: 8, Weapons: 10 }),
  verdict: "junk",
  reasons: ["Legacy armor (pre-Armor 3.0)"],
});

const titanLegacyGroup: ArmorGroup = {
  groupKey: "0|legs|legacy",
  label: "Titan Legs — Legacy",
  icon: DEMO_ARMOR_ICONS.titanLegs,
  classType: 0,
  slot: "legs",
  archetype: "Unknown",
  isExoticGroup: false,
  pieces: [legacyLegs],
  keepRecommendations: [],
  junkRecommendations: [legacyLegs.itemInstanceId],
};

// --- Exotic helmet with two rolls: keep best, junk lower ---

const wormhuskBest = makeArmorPiece({
  itemInstanceId: "demo-armor-006",
  itemHash: 9002001,
  name: "Wormhusk Crown",
  icon: DEMO_ARMOR_ICONS.wormhusk,
  tierName: "Exotic",
  isExotic: true,
  classType: 1,
  slot: "helmet",
  archetype: "Brawler",
  gearTier: 3,
  gearTierSource: "api",
  stats: armorStats({ Melee: 26, Health: 22, Class: 16, Weapons: 3 }),
  tertiaryStat: { statHash: 1943323491, name: "Class", value: 16 },
  verdict: "keep",
  reasons: ["Best roll of this exotic"],
});

const wormhuskWorse = makeArmorPiece({
  itemInstanceId: "demo-armor-007",
  itemHash: 9002001,
  name: "Wormhusk Crown",
  icon: DEMO_ARMOR_ICONS.wormhusk,
  tierName: "Exotic",
  isExotic: true,
  classType: 1,
  slot: "helmet",
  archetype: "Unknown",
  gearTier: null,
  gearTierSource: null,
  isLegacy: true,
  stats: armorStats({ Melee: 14, Health: 12, Class: 10, Super: 8, Grenade: 9, Weapons: 7 }),
  verdict: "junk",
  reasons: [
    "Lower-stat duplicate (60 vs 67 total)",
    "Legacy exotic — stats predate Armor 3.0",
  ],
});

const wormhuskGroup: ArmorGroup = {
  groupKey: "exotic|9002001",
  label: "Wormhusk Crown",
  icon: DEMO_ARMOR_ICONS.wormhusk,
  classType: 1,
  slot: "helmet",
  archetype: "Brawler",
  isExoticGroup: true,
  pieces: [wormhuskBest, wormhuskWorse],
  keepRecommendations: [wormhuskBest.itemInstanceId],
  junkRecommendations: [wormhuskWorse.itemInstanceId],
};

// --- Exotic class item: two unique perk combos kept, one duplicate junked ---

function spiritPerk(hash: number, name: string, description: string) {
  return { perkHash: hash, name, icon: "", description, isActive: true, isWishlistPerk: false };
}

const relicAssassinStarEater = makeArmorPiece({
  itemInstanceId: "demo-armor-008",
  itemHash: 9002002,
  name: "Relativism",
  icon: DEMO_ARMOR_ICONS.relativism,
  tierName: "Exotic",
  isExotic: true,
  classType: 1,
  slot: "classItem",
  archetype: "Specialist",
  gearTier: 3,
  gearTierSource: "api",
  stats: armorStats({ Class: 25, Weapons: 21, Super: 18 }),
  tertiaryStat: { statHash: 144602215, name: "Super", value: 18 },
  exoticPerks: [
    spiritPerk(101, "Spirit of the Assassin", "Powered melee final blows grant invisibility."),
    spiritPerk(102, "Spirit of the Star-Eater", "Your Super deals bonus damage when cast at full grenade energy."),
  ],
  verdict: "keep",
  reasons: ["Unique perk combo: Spirit of the Assassin + Spirit of the Star-Eater"],
});

const relicInmostSynthos = makeArmorPiece({
  itemInstanceId: "demo-armor-009",
  itemHash: 9002002,
  name: "Relativism",
  icon: DEMO_ARMOR_ICONS.relativism,
  tierName: "Exotic",
  isExotic: true,
  classType: 1,
  slot: "classItem",
  archetype: "Brawler",
  gearTier: 2,
  gearTierSource: "api",
  stats: armorStats({ Melee: 23, Health: 20, Grenade: 16 }),
  tertiaryStat: { statHash: 1735777505, name: "Grenade", value: 16 },
  exoticPerks: [
    spiritPerk(103, "Spirit of Inmost Light", "Using an ability empowers your other abilities."),
    spiritPerk(104, "Spirit of Synthoceps", "Improved melee damage when surrounded."),
  ],
  verdict: "keep",
  reasons: ["Unique perk combo: Spirit of Inmost Light + Spirit of Synthoceps"],
});

const relicDuplicate = makeArmorPiece({
  itemInstanceId: "demo-armor-010",
  itemHash: 9002002,
  name: "Relativism",
  icon: DEMO_ARMOR_ICONS.relativism,
  tierName: "Exotic",
  isExotic: true,
  classType: 1,
  slot: "classItem",
  archetype: "Specialist",
  gearTier: 1,
  gearTierSource: "api",
  stats: armorStats({ Class: 21, Weapons: 18, Melee: 14 }),
  tertiaryStat: { statHash: 4244567218, name: "Melee", value: 14 },
  exoticPerks: [
    spiritPerk(101, "Spirit of the Assassin", "Powered melee final blows grant invisibility."),
    spiritPerk(102, "Spirit of the Star-Eater", "Your Super deals bonus damage when cast at full grenade energy."),
  ],
  verdict: "junk",
  reasons: ["Duplicate perk combo — better copy kept"],
});

const relativismGroup: ArmorGroup = {
  groupKey: "exotic|9002002",
  label: "Relativism",
  icon: DEMO_ARMOR_ICONS.relativism,
  classType: 1,
  slot: "classItem",
  archetype: "Specialist",
  isExoticGroup: true,
  pieces: [relicAssassinStarEater, relicInmostSynthos, relicDuplicate],
  keepRecommendations: [
    relicAssassinStarEater.itemInstanceId,
    relicInmostSynthos.itemInstanceId,
  ],
  junkRecommendations: [relicDuplicate.itemInstanceId],
};

const allGroups = [
  hunterBulwarkGroup,
  warlockGrenadierGroup,
  titanLegacyGroup,
  wormhuskGroup,
  relativismGroup,
];

const allPieces = allGroups.flatMap((g) => g.pieces);

export const DEMO_ARMOR_ANALYSIS: ArmorAnalysis = {
  totalArmor: allPieces.length,
  duplicateGroups: [hunterBulwarkGroup, relativismGroup, wormhuskGroup],
  allArmorGroups: [...allGroups].sort((a, b) => a.label.localeCompare(b.label)),
  keepCount: allPieces.filter((p) => p.verdict === "keep").length,
  junkCount: allPieces.filter((p) => p.verdict === "junk").length,
  reviewCount: allPieces.filter((p) => p.verdict === "review").length,
  tier5Count: allPieces.filter((p) => p.gearTier === 5).length,
  exoticCount: allPieces.filter((p) => p.isExotic).length,
  legacyCount: allPieces.filter((p) => p.isLegacy).length,
};
