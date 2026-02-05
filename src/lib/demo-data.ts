import { VaultAnalysis, DuplicateGroup, WeaponRoll } from "./types";

// Demo data to showcase the app without needing a Bungie API key
// These represent realistic weapon rolls from Destiny 2

function makeRoll(overrides: Partial<WeaponRoll> & { itemInstanceId: string; itemHash: number; name: string }): WeaponRoll {
  return {
    icon: "",
    tierName: "Legendary",
    typeName: "Auto Rifle",
    damageType: 1,
    powerLevel: 1810,
    perks: [],
    isGodRoll: false,
    isRecommended: false,
    wishlistNotes: [],
    matchedPerkCount: 0,
    location: "vault",
    ...overrides,
  };
}

const cantataGodRoll: WeaponRoll = makeRoll({
  itemInstanceId: "demo-001",
  itemHash: 372697604,
  name: "Austringer",
  typeName: "Hand Cannon",
  damageType: 1,
  powerLevel: 1810,
  isGodRoll: true,
  isRecommended: true,
  matchedPerkCount: 4,
  wishlistNotes: ["PvP God Roll - light.gg community pick", "S-Tier Hand Cannon roll"],
  location: "equipped",
  characterId: "char-1",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 1, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 1, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 2, name: "Hammer-Forged Rifling", icon: "", description: "+10 Range", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 2, name: "Hammer-Forged Rifling", icon: "", description: "+10 Range", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 3, name: "Ricochet Rounds", icon: "", description: "+5 Range, +10 Stability", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 3, name: "Ricochet Rounds", icon: "", description: "+5 Range, +10 Stability", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 4, name: "Eye of the Storm", icon: "", description: "Improved accuracy as health gets lower", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 4, name: "Eye of the Storm", icon: "", description: "Improved accuracy as health gets lower", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 5, name: "Rangefinder", icon: "", description: "Aiming increases range", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 5, name: "Rangefinder", icon: "", description: "Aiming increases range", isActive: true, isWishlistPerk: true },
    },
  ],
});

const cantataJunk1: WeaponRoll = makeRoll({
  itemInstanceId: "demo-002",
  itemHash: 372697604,
  name: "Austringer",
  typeName: "Hand Cannon",
  damageType: 1,
  powerLevel: 1805,
  isGodRoll: false,
  isRecommended: false,
  matchedPerkCount: 1,
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 1, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 1, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 10, name: "Full Bore", icon: "", description: "+15 Range, -10 Stability, -5 Handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 10, name: "Full Bore", icon: "", description: "+15 Range, -10 Stability, -5 Handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 11, name: "Extended Mag", icon: "", description: "+6 Magazine, -45 Reload Speed", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 11, name: "Extended Mag", icon: "", description: "+6 Magazine, -45 Reload Speed", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 12, name: "Hip-Fire Grip", icon: "", description: "Increases accuracy when firing from the hip", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 12, name: "Hip-Fire Grip", icon: "", description: "Increases accuracy when firing from the hip", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 13, name: "Thresh", icon: "", description: "Kills grant a small amount of Super energy", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 13, name: "Thresh", icon: "", description: "Kills grant a small amount of Super energy", isActive: true, isWishlistPerk: false },
    },
  ],
});

const cantataJunk2: WeaponRoll = makeRoll({
  itemInstanceId: "demo-003",
  itemHash: 372697604,
  name: "Austringer",
  typeName: "Hand Cannon",
  damageType: 1,
  powerLevel: 1790,
  isGodRoll: false,
  isRecommended: false,
  matchedPerkCount: 0,
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 1, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 1, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 20, name: "Arrowhead Brake", icon: "", description: "+30 Recoil Direction, +10 Handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 20, name: "Arrowhead Brake", icon: "", description: "+30 Recoil Direction, +10 Handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 21, name: "Alloy Magazine", icon: "", description: "Faster reloads when the magazine is empty", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 21, name: "Alloy Magazine", icon: "", description: "Faster reloads when the magazine is empty", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 22, name: "Underdog", icon: "", description: "Improved reload when health is low", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 22, name: "Underdog", icon: "", description: "Improved reload when health is low", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 23, name: "Unrelenting", icon: "", description: "Rapidly defeating targets triggers health regen", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 23, name: "Unrelenting", icon: "", description: "Rapidly defeating targets triggers health regen", isActive: true, isWishlistPerk: false },
    },
  ],
});

const callusGodRoll: WeaponRoll = makeRoll({
  itemInstanceId: "demo-004",
  itemHash: 2714220251,
  name: "Calus Mini-Tool",
  typeName: "Submachine Gun",
  damageType: 3, // Solar
  powerLevel: 1810,
  isGodRoll: true,
  isRecommended: true,
  matchedPerkCount: 4,
  wishlistNotes: ["PvE God Roll - Incandescent is S-tier"],
  location: "inventory",
  characterId: "char-1",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 30, name: "Lightweight Frame", icon: "", description: "Superb handling. Move faster with this weapon equipped.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 30, name: "Lightweight Frame", icon: "", description: "Superb handling. Move faster with this weapon equipped.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 31, name: "Fluted Barrel", icon: "", description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 31, name: "Fluted Barrel", icon: "", description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 32, name: "Tactical Mag", icon: "", description: "+5 Stability, +10 Reload, +3 Magazine", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 32, name: "Tactical Mag", icon: "", description: "+5 Stability, +10 Reload, +3 Magazine", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 33, name: "Grave Robber", icon: "", description: "Melee kills reload this weapon", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 33, name: "Grave Robber", icon: "", description: "Melee kills reload this weapon", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 34, name: "Incandescent", icon: "", description: "Defeating targets spreads scorch to nearby enemies", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 34, name: "Incandescent", icon: "", description: "Defeating targets spreads scorch to nearby enemies", isActive: true, isWishlistPerk: true },
    },
  ],
});

const callusJunk: WeaponRoll = makeRoll({
  itemInstanceId: "demo-005",
  itemHash: 2714220251,
  name: "Calus Mini-Tool",
  typeName: "Submachine Gun",
  damageType: 3,
  powerLevel: 1800,
  isGodRoll: false,
  isRecommended: false,
  matchedPerkCount: 1,
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 30, name: "Lightweight Frame", icon: "", description: "Superb handling.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 30, name: "Lightweight Frame", icon: "", description: "Superb handling.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 40, name: "Corkscrew Rifling", icon: "", description: "+5 Range, +5 Stability, +5 Handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 40, name: "Corkscrew Rifling", icon: "", description: "+5 Range, +5 Stability, +5 Handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 41, name: "Appended Mag", icon: "", description: "+6 Magazine", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 41, name: "Appended Mag", icon: "", description: "+6 Magazine", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 42, name: "Threat Detector", icon: "", description: "Improved reload, stability, and handling when near enemies", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 42, name: "Threat Detector", icon: "", description: "Improved reload, stability, and handling when near enemies", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 43, name: "Surrounded", icon: "", description: "Increased damage when near many enemies", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 43, name: "Surrounded", icon: "", description: "Increased damage when near many enemies", isActive: true, isWishlistPerk: false },
    },
  ],
});

const cataclysmic1: WeaponRoll = makeRoll({
  itemInstanceId: "demo-006",
  itemHash: 999767358,
  name: "Cataclysmic",
  typeName: "Linear Fusion Rifle",
  damageType: 3,
  powerLevel: 1815,
  isGodRoll: false,
  isRecommended: true,
  matchedPerkCount: 3,
  wishlistNotes: ["Near-God Roll for DPS"],
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 50, name: "Precision Frame", icon: "", description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 50, name: "Precision Frame", icon: "", description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 51, name: "Fluted Barrel", icon: "", description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 51, name: "Fluted Barrel", icon: "", description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 52, name: "Enhanced Battery", icon: "", description: "+1 Magazine", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 52, name: "Enhanced Battery", icon: "", description: "+1 Magazine", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 53, name: "Fourth Time's the Charm", icon: "", description: "Rapidly hitting 4 precision shots returns 2 rounds", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 53, name: "Fourth Time's the Charm", icon: "", description: "Rapidly hitting 4 precision shots returns 2 rounds", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 54, name: "Bait and Switch", icon: "", description: "Dealing damage with all weapons briefly increases this weapon's damage", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 54, name: "Bait and Switch", icon: "", description: "Dealing damage with all weapons briefly increases this weapon's damage", isActive: true, isWishlistPerk: true },
    },
  ],
});

const cataclysmic2: WeaponRoll = makeRoll({
  itemInstanceId: "demo-007",
  itemHash: 999767358,
  name: "Cataclysmic",
  typeName: "Linear Fusion Rifle",
  damageType: 3,
  powerLevel: 1800,
  isGodRoll: false,
  isRecommended: false,
  matchedPerkCount: 1,
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 50, name: "Precision Frame", icon: "", description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 50, name: "Precision Frame", icon: "", description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 60, name: "Hammer-Forged Rifling", icon: "", description: "+10 Range", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 60, name: "Hammer-Forged Rifling", icon: "", description: "+10 Range", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 61, name: "Projection Fuse", icon: "", description: "+10 Range", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 61, name: "Projection Fuse", icon: "", description: "+10 Range", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 62, name: "Shoot to Loot", icon: "", description: "Shooting an ammo brick picks it up", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 62, name: "Shoot to Loot", icon: "", description: "Shooting an ammo brick picks it up", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 63, name: "Vorpal Weapon", icon: "", description: "Increased damage against bosses and vehicles", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 63, name: "Vorpal Weapon", icon: "", description: "Increased damage against bosses and vehicles", isActive: true, isWishlistPerk: true },
    },
  ],
});

const cataclysmic3: WeaponRoll = makeRoll({
  itemInstanceId: "demo-008",
  itemHash: 999767358,
  name: "Cataclysmic",
  typeName: "Linear Fusion Rifle",
  damageType: 3,
  powerLevel: 1785,
  isGodRoll: false,
  isRecommended: false,
  matchedPerkCount: 0,
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 50, name: "Precision Frame", icon: "", description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 50, name: "Precision Frame", icon: "", description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 70, name: "Polygonal Rifling", icon: "", description: "+10 Stability", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 70, name: "Polygonal Rifling", icon: "", description: "+10 Stability", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 71, name: "Particle Repeater", icon: "", description: "+10 Stability", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 71, name: "Particle Repeater", icon: "", description: "+10 Stability", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 72, name: "Compulsive Reloader", icon: "", description: "Faster reloads when the magazine is more than half full", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 72, name: "Compulsive Reloader", icon: "", description: "Faster reloads when the magazine is more than half full", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 73, name: "Adrenaline Junkie", icon: "", description: "Grenade kills give this weapon increased damage", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 73, name: "Adrenaline Junkie", icon: "", description: "Grenade kills give this weapon increased damage", isActive: true, isWishlistPerk: false },
    },
  ],
});

const funnelWeb1: WeaponRoll = makeRoll({
  itemInstanceId: "demo-009",
  itemHash: 3341893443,
  name: "Funnelweb",
  typeName: "Submachine Gun",
  damageType: 4, // Void
  powerLevel: 1810,
  isGodRoll: true,
  isRecommended: true,
  matchedPerkCount: 4,
  wishlistNotes: ["PvE Monster - Subsistence + Frenzy is best in slot", "light.gg community S-Tier"],
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 80, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 80, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 81, name: "Fluted Barrel", icon: "", description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 81, name: "Fluted Barrel", icon: "", description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 82, name: "Accurized Rounds", icon: "", description: "+10 Range", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 82, name: "Accurized Rounds", icon: "", description: "+10 Range", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 83, name: "Subsistence", icon: "", description: "Kills partially reload from reserves", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 83, name: "Subsistence", icon: "", description: "Kills partially reload from reserves", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 84, name: "Frenzy", icon: "", description: "Sustained combat boosts damage, handling, and reload", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 84, name: "Frenzy", icon: "", description: "Sustained combat boosts damage, handling, and reload", isActive: true, isWishlistPerk: true },
    },
  ],
});

const funnelWeb2: WeaponRoll = makeRoll({
  itemInstanceId: "demo-010",
  itemHash: 3341893443,
  name: "Funnelweb",
  typeName: "Submachine Gun",
  damageType: 4,
  powerLevel: 1795,
  isGodRoll: false,
  isRecommended: false,
  matchedPerkCount: 1,
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 80, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 80, name: "Aggressive Frame", icon: "", description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 90, name: "Extended Barrel", icon: "", description: "+10 Range, -10 Handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 90, name: "Extended Barrel", icon: "", description: "+10 Range, -10 Handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 91, name: "Steady Rounds", icon: "", description: "+15 Stability, -5 Range", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 91, name: "Steady Rounds", icon: "", description: "+15 Stability, -5 Range", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 92, name: "Killing Wind", icon: "", description: "Final blows grant mobility, range, and handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 92, name: "Killing Wind", icon: "", description: "Final blows grant mobility, range, and handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 93, name: "Adrenaline Junkie", icon: "", description: "Grenade kills give increased damage", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 93, name: "Adrenaline Junkie", icon: "", description: "Grenade kills give increased damage", isActive: true, isWishlistPerk: false },
    },
  ],
});

const forbearance1: WeaponRoll = makeRoll({
  itemInstanceId: "demo-011",
  itemHash: 613334176,
  name: "Forbearance",
  typeName: "Grenade Launcher",
  damageType: 2, // Arc
  powerLevel: 1810,
  isGodRoll: true,
  isRecommended: true,
  matchedPerkCount: 4,
  wishlistNotes: ["The best wave frame GL - Ambush + Chain Reaction"],
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 100, name: "Wave Frame", icon: "", description: "Fires a wave of energy on impact", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 100, name: "Wave Frame", icon: "", description: "Fires a wave of energy on impact", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 101, name: "Quick Launch", icon: "", description: "+10 Velocity, +15 Handling", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 101, name: "Quick Launch", icon: "", description: "+10 Velocity, +15 Handling", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 102, name: "High-Velocity Rounds", icon: "", description: "+15 Velocity, +10 Reload Speed", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 102, name: "High-Velocity Rounds", icon: "", description: "+15 Velocity, +10 Reload Speed", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 103, name: "Ambitious Assassin", icon: "", description: "Overflows the magazine based on number of rapid kills", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 103, name: "Ambitious Assassin", icon: "", description: "Overflows the magazine based on number of rapid kills", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 104, name: "Chain Reaction", icon: "", description: "Each final blow creates an elemental explosion", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 104, name: "Chain Reaction", icon: "", description: "Each final blow creates an elemental explosion", isActive: true, isWishlistPerk: true },
    },
  ],
});

const forbearance2: WeaponRoll = makeRoll({
  itemInstanceId: "demo-012",
  itemHash: 613334176,
  name: "Forbearance",
  typeName: "Grenade Launcher",
  damageType: 2,
  powerLevel: 1790,
  isGodRoll: false,
  isRecommended: false,
  matchedPerkCount: 1,
  location: "vault",
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 100, name: "Wave Frame", icon: "", description: "Fires a wave of energy on impact", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 100, name: "Wave Frame", icon: "", description: "Fires a wave of energy on impact", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 110, name: "Volatile Launch", icon: "", description: "+15 Blast Radius, -5 Handling, -10 Velocity", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 110, name: "Volatile Launch", icon: "", description: "+15 Blast Radius, -5 Handling, -10 Velocity", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 111, name: "Mini Frags", icon: "", description: "+5 Blast Radius, +5 Velocity", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 111, name: "Mini Frags", icon: "", description: "+5 Blast Radius, +5 Velocity", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 112, name: "Unrelenting", icon: "", description: "Rapidly defeating targets triggers health regen", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 112, name: "Unrelenting", icon: "", description: "Rapidly defeating targets triggers health regen", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 113, name: "Disruption Break", icon: "", description: "Breaking shields grants bonus kinetic damage", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 113, name: "Disruption Break", icon: "", description: "Breaking shields grants bonus kinetic damage", isActive: true, isWishlistPerk: false },
    },
  ],
});

// Build duplicate groups
const austringerGroup: DuplicateGroup = {
  weaponHash: 372697604,
  weaponName: "Austringer",
  weaponIcon: "",
  weaponType: "Hand Cannon",
  damageType: 1,
  rolls: [cantataGodRoll, cantataJunk1, cantataJunk2],
  keepRecommendations: ["demo-001"],
  junkRecommendations: ["demo-002", "demo-003"],
};

const calusGroup: DuplicateGroup = {
  weaponHash: 2714220251,
  weaponName: "Calus Mini-Tool",
  weaponIcon: "",
  weaponType: "Submachine Gun",
  damageType: 3,
  rolls: [callusGodRoll, callusJunk],
  keepRecommendations: ["demo-004"],
  junkRecommendations: ["demo-005"],
};

const cataclysmicGroup: DuplicateGroup = {
  weaponHash: 999767358,
  weaponName: "Cataclysmic",
  weaponIcon: "",
  weaponType: "Linear Fusion Rifle",
  damageType: 3,
  rolls: [cataclysmic1, cataclysmic2, cataclysmic3],
  keepRecommendations: ["demo-006"],
  junkRecommendations: ["demo-007", "demo-008"],
};

const funnelwebGroup: DuplicateGroup = {
  weaponHash: 3341893443,
  weaponName: "Funnelweb",
  weaponIcon: "",
  weaponType: "Submachine Gun",
  damageType: 4,
  rolls: [funnelWeb1, funnelWeb2],
  keepRecommendations: ["demo-009"],
  junkRecommendations: ["demo-010"],
};

const forbearanceGroup: DuplicateGroup = {
  weaponHash: 613334176,
  weaponName: "Forbearance",
  weaponIcon: "",
  weaponType: "Grenade Launcher",
  damageType: 2,
  rolls: [forbearance1, forbearance2],
  keepRecommendations: ["demo-011"],
  junkRecommendations: ["demo-012"],
};

export const DEMO_ANALYSIS: VaultAnalysis = {
  totalWeapons: 47,
  duplicateGroups: [
    cataclysmicGroup,
    austringerGroup,
    funnelwebGroup,
    calusGroup,
    forbearanceGroup,
  ],
  godRollCount: 4,
  junkCount: 7,
  keepCount: 5,
};
