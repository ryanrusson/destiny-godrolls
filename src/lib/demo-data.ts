import { VaultAnalysis, DuplicateGroup, WeaponRoll } from "./types";

// Demo data to showcase the app without needing a Bungie API key
// These represent realistic weapon rolls from Destiny 2

const B = "https://www.bungie.net";

// Pre-resolved icon paths from the Bungie manifest
const DEMO_ICONS = {
  austringer: {
    icon: `${B}/common/destiny2_content/icons/e905d8c17ef5ead5c6f9cd107b4b6f09.jpg`,
    screenshot: `${B}/common/destiny2_content/screenshots/2429822977.jpg`,
    watermark: `${B}/common/destiny2_content/icons/58d3ec8338cc9746a2e0cf901fbcec0e.png`,
  },
  calusMiniTool: {
    icon: `${B}/common/destiny2_content/icons/40909558f2b45d65917eb0c9e245f403.jpg`,
    screenshot: `${B}/common/destiny2_content/screenshots/2490988246.jpg`,
    watermark: `${B}/common/destiny2_content/icons/75adde12e4e9c9fb237e492d8258eb73.png`,
  },
  cataclysmic: {
    icon: `${B}/common/destiny2_content/icons/a180748fde0e20e450b841663c388833.jpg`,
    screenshot: `${B}/common/destiny2_content/screenshots/999767358.jpg`,
    watermark: `${B}/common/destiny2_content/icons/0b441021fbc328e6d0e2abc895f5c96e.png`,
  },
  funnelweb: {
    icon: `${B}/common/destiny2_content/icons/d936e6dd748647d394afd71110f48b21.jpg`,
    screenshot: `${B}/common/destiny2_content/screenshots/3341893443.jpg`,
    watermark: `${B}/common/destiny2_content/icons/0b441021fbc328e6d0e2abc895f5c96e.png`,
  },
  forbearance: {
    icon: `${B}/common/destiny2_content/icons/2222167aadddbfe4954b9710784c1f6e.jpg`,
    screenshot: `${B}/common/destiny2_content/screenshots/613334176.jpg`,
    watermark: `${B}/common/destiny2_content/icons/0b441021fbc328e6d0e2abc895f5c96e.png`,
  },
  refurbishedA499: {
    icon: `${B}/common/destiny2_content/icons/c0b504a8a098196ec5c54c510547d048.jpg`,
    screenshot: `${B}/common/destiny2_content/screenshots/3661051060.jpg`,
    watermark: `${B}/common/destiny2_content/icons/95f7754d52d6016fdc445fb62aa7a31e.png`,
  },
};

function makeRoll(overrides: Partial<WeaponRoll> & { itemInstanceId: string; itemHash: number; name: string }): WeaponRoll {
  return {
    icon: "",
    tierName: "Legendary",
    typeName: "Auto Rifle",
    damageType: 1,
    powerLevel: 1810,
    stats: [
      { statHash: 4284893193, name: "RPM", value: 140 },
      { statHash: 4043523819, name: "Impact", value: 84 },
      { statHash: 1240592695, name: "Range", value: 55 },
      { statHash: 155624089, name: "Stability", value: 46 },
      { statHash: 943549884, name: "Handling", value: 52 },
      { statHash: 4188031367, name: "Reload Speed", value: 48 },
      { statHash: 1345609583, name: "Aim Assistance", value: 68 },
      { statHash: 3555269338, name: "Zoom", value: 14 },
    ],
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
  icon: DEMO_ICONS.austringer.icon,
  screenshot: DEMO_ICONS.austringer.screenshot,
  watermark: DEMO_ICONS.austringer.watermark,
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
      activePerks: [{ perkHash: 1, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 1, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [
        { perkHash: 2, name: "Hammer-Forged Rifling", icon: `${B}/common/destiny2_content/icons/2b9eb6d4489cffc18c10223279198bcc.png`, description: "+10 Range", isActive: true, isWishlistPerk: true },
        { perkHash: 6, name: "Full Bore", icon: `${B}/common/destiny2_content/icons/40a4bdcf0f5a4e492927f9569eaf529d.png`, description: "+15 Range, -10 Stability, -5 Handling", isActive: false, isWishlistPerk: false },
        { perkHash: 7, name: "Fluted Barrel", icon: `${B}/common/destiny2_content/icons/260eba9dd149dbb94b1306c9ed4dd8db.png`, description: "+5 Stability, +15 Handling", isActive: false, isWishlistPerk: false },
        { perkHash: 8, name: "Corkscrew Rifling", icon: `${B}/common/destiny2_content/icons/7730e1732ed7ef91afce50277639c493.png`, description: "+5 Range, +5 Stability, +5 Handling", isActive: false, isWishlistPerk: false },
      ],
      selectedPerk: { perkHash: 2, name: "Hammer-Forged Rifling", icon: `${B}/common/destiny2_content/icons/2b9eb6d4489cffc18c10223279198bcc.png`, description: "+10 Range", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [
        { perkHash: 3, name: "Ricochet Rounds", icon: `${B}/common/destiny2_content/icons/0a494d0442b32aff8c30d8b2b53561bd.png`, description: "+5 Range, +10 Stability", isActive: true, isWishlistPerk: true },
        { perkHash: 9, name: "High-Caliber Rounds", icon: `${B}/common/destiny2_content/icons/9d1c49edb2d2b24c74067742c09fd5a5.png`, description: "Staggers targets. +5 Range", isActive: false, isWishlistPerk: false },
        { perkHash: 14, name: "Accurized Rounds", icon: `${B}/common/destiny2_content/icons/d85024478504205359c7fb52dbc4f6b6.png`, description: "+10 Range", isActive: false, isWishlistPerk: true },
      ],
      selectedPerk: { perkHash: 3, name: "Ricochet Rounds", icon: `${B}/common/destiny2_content/icons/0a494d0442b32aff8c30d8b2b53561bd.png`, description: "+5 Range, +10 Stability", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 3,
      activePerks: [
        { perkHash: 4, name: "Eye of the Storm", icon: `${B}/common/destiny2_content/icons/3bd3715fd92350cf1f08cf69a3841320.jpg`, description: "Improved accuracy as health gets lower", isActive: true, isWishlistPerk: true },
        { perkHash: 15, name: "Outlaw", icon: `${B}/common/destiny2_content/icons/382df469a091c33e190ee583b64923e8.png`, description: "Precision kills greatly decrease reload time", isActive: false, isWishlistPerk: false },
      ],
      selectedPerk: { perkHash: 4, name: "Eye of the Storm", icon: `${B}/common/destiny2_content/icons/3bd3715fd92350cf1f08cf69a3841320.jpg`, description: "Improved accuracy as health gets lower", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [
        { perkHash: 5, name: "Rangefinder", icon: `${B}/common/destiny2_content/icons/74270d52bec24f1f5f4c987f5f37fce9.png`, description: "Aiming increases range", isActive: true, isWishlistPerk: true },
        { perkHash: 16, name: "Rampage", icon: `${B}/common/destiny2_content/icons/8976ead57430e4f5f8af1b3005de4f83.png`, description: "Kills grant increased damage for a short time", isActive: false, isWishlistPerk: false },
      ],
      selectedPerk: { perkHash: 5, name: "Rangefinder", icon: `${B}/common/destiny2_content/icons/74270d52bec24f1f5f4c987f5f37fce9.png`, description: "Aiming increases range", isActive: true, isWishlistPerk: true },
    },
  ],
});

const cantataJunk1: WeaponRoll = makeRoll({
  itemInstanceId: "demo-002",
  itemHash: 372697604,
  name: "Austringer",
  icon: DEMO_ICONS.austringer.icon,
  screenshot: DEMO_ICONS.austringer.screenshot,
  watermark: DEMO_ICONS.austringer.watermark,
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
      activePerks: [{ perkHash: 1, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 1, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 10, name: "Full Bore", icon: `${B}/common/destiny2_content/icons/40a4bdcf0f5a4e492927f9569eaf529d.png`, description: "+15 Range, -10 Stability, -5 Handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 10, name: "Full Bore", icon: `${B}/common/destiny2_content/icons/40a4bdcf0f5a4e492927f9569eaf529d.png`, description: "+15 Range, -10 Stability, -5 Handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 11, name: "Extended Mag", icon: `${B}/common/destiny2_content/icons/66cfea124e24e73cca1ce6370b44ca7e.png`, description: "+6 Magazine, -45 Reload Speed", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 11, name: "Extended Mag", icon: `${B}/common/destiny2_content/icons/66cfea124e24e73cca1ce6370b44ca7e.png`, description: "+6 Magazine, -45 Reload Speed", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 12, name: "Hip-Fire Grip", icon: `${B}/common/destiny2_content/icons/b481f0ed53a3ae0b31a370d115a06860.png`, description: "Increases accuracy when firing from the hip", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 12, name: "Hip-Fire Grip", icon: `${B}/common/destiny2_content/icons/b481f0ed53a3ae0b31a370d115a06860.png`, description: "Increases accuracy when firing from the hip", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 13, name: "Thresh", icon: `${B}/common/destiny2_content/icons/7f9dcf3bd4a8a4e0d2d0922827f038c9.png`, description: "Kills grant a small amount of Super energy", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 13, name: "Thresh", icon: `${B}/common/destiny2_content/icons/7f9dcf3bd4a8a4e0d2d0922827f038c9.png`, description: "Kills grant a small amount of Super energy", isActive: true, isWishlistPerk: false },
    },
  ],
});

const cantataJunk2: WeaponRoll = makeRoll({
  itemInstanceId: "demo-003",
  itemHash: 372697604,
  name: "Austringer",
  icon: DEMO_ICONS.austringer.icon,
  screenshot: DEMO_ICONS.austringer.screenshot,
  watermark: DEMO_ICONS.austringer.watermark,
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
      activePerks: [{ perkHash: 1, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 1, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 20, name: "Arrowhead Brake", icon: `${B}/common/destiny2_content/icons/8f7fb54687aa52a9c2595d90ce9c9417.png`, description: "+30 Recoil Direction, +10 Handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 20, name: "Arrowhead Brake", icon: `${B}/common/destiny2_content/icons/8f7fb54687aa52a9c2595d90ce9c9417.png`, description: "+30 Recoil Direction, +10 Handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 21, name: "Alloy Magazine", icon: `${B}/common/destiny2_content/icons/069170916c98748b7b3e33b80bd7d689.png`, description: "Faster reloads when the magazine is empty", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 21, name: "Alloy Magazine", icon: `${B}/common/destiny2_content/icons/069170916c98748b7b3e33b80bd7d689.png`, description: "Faster reloads when the magazine is empty", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 22, name: "Underdog", icon: "", description: "Improved reload when health is low", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 22, name: "Underdog", icon: "", description: "Improved reload when health is low", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 23, name: "Unrelenting", icon: `${B}/common/destiny2_content/icons/1e5843177c71ae3f2a4770d01a2f3813.png`, description: "Rapidly defeating targets triggers health regen", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 23, name: "Unrelenting", icon: `${B}/common/destiny2_content/icons/1e5843177c71ae3f2a4770d01a2f3813.png`, description: "Rapidly defeating targets triggers health regen", isActive: true, isWishlistPerk: false },
    },
  ],
});

const callusGodRoll: WeaponRoll = makeRoll({
  itemInstanceId: "demo-004",
  itemHash: 2714220251,
  name: "CALUS Mini-Tool",
  icon: DEMO_ICONS.calusMiniTool.icon,
  screenshot: DEMO_ICONS.calusMiniTool.screenshot,
  watermark: DEMO_ICONS.calusMiniTool.watermark,
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
      activePerks: [{ perkHash: 30, name: "Lightweight Frame", icon: `${B}/common/destiny2_content/icons/6db8cd21c2b3e6fffeb6f111d6c70dd2.png`, description: "Superb handling. Move faster with this weapon equipped.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 30, name: "Lightweight Frame", icon: `${B}/common/destiny2_content/icons/6db8cd21c2b3e6fffeb6f111d6c70dd2.png`, description: "Superb handling. Move faster with this weapon equipped.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 31, name: "Fluted Barrel", icon: `${B}/common/destiny2_content/icons/260eba9dd149dbb94b1306c9ed4dd8db.png`, description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 31, name: "Fluted Barrel", icon: `${B}/common/destiny2_content/icons/260eba9dd149dbb94b1306c9ed4dd8db.png`, description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 32, name: "Tactical Mag", icon: `${B}/common/destiny2_content/icons/f0e309a267b25279a871d182f8910bcc.png`, description: "+5 Stability, +10 Reload, +3 Magazine", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 32, name: "Tactical Mag", icon: `${B}/common/destiny2_content/icons/f0e309a267b25279a871d182f8910bcc.png`, description: "+5 Stability, +10 Reload, +3 Magazine", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 33, name: "Grave Robber", icon: `${B}/common/destiny2_content/icons/043d100167af67d6041719044a033221.png`, description: "Melee kills reload this weapon", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 33, name: "Grave Robber", icon: `${B}/common/destiny2_content/icons/043d100167af67d6041719044a033221.png`, description: "Melee kills reload this weapon", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 34, name: "Incandescent", icon: `${B}/common/destiny2_content/icons/22ed4a2cd5a0eb129a14ce77db49373f.png`, description: "Defeating targets spreads scorch to nearby enemies", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 34, name: "Incandescent", icon: `${B}/common/destiny2_content/icons/22ed4a2cd5a0eb129a14ce77db49373f.png`, description: "Defeating targets spreads scorch to nearby enemies", isActive: true, isWishlistPerk: true },
    },
  ],
});

const callusJunk: WeaponRoll = makeRoll({
  itemInstanceId: "demo-005",
  itemHash: 2714220251,
  name: "CALUS Mini-Tool",
  icon: DEMO_ICONS.calusMiniTool.icon,
  screenshot: DEMO_ICONS.calusMiniTool.screenshot,
  watermark: DEMO_ICONS.calusMiniTool.watermark,
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
      activePerks: [{ perkHash: 30, name: "Lightweight Frame", icon: `${B}/common/destiny2_content/icons/6db8cd21c2b3e6fffeb6f111d6c70dd2.png`, description: "Superb handling.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 30, name: "Lightweight Frame", icon: `${B}/common/destiny2_content/icons/6db8cd21c2b3e6fffeb6f111d6c70dd2.png`, description: "Superb handling.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 40, name: "Corkscrew Rifling", icon: `${B}/common/destiny2_content/icons/7730e1732ed7ef91afce50277639c493.png`, description: "+5 Range, +5 Stability, +5 Handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 40, name: "Corkscrew Rifling", icon: `${B}/common/destiny2_content/icons/7730e1732ed7ef91afce50277639c493.png`, description: "+5 Range, +5 Stability, +5 Handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 41, name: "Appended Mag", icon: `${B}/common/destiny2_content/icons/d9f468cce26fe35d9db413e2f8451127.png`, description: "+6 Magazine", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 41, name: "Appended Mag", icon: `${B}/common/destiny2_content/icons/d9f468cce26fe35d9db413e2f8451127.png`, description: "+6 Magazine", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 42, name: "Threat Detector", icon: `${B}/common/destiny2_content/icons/9611bdbc48aff898193fd5f705c7cf30.png`, description: "Improved reload, stability, and handling when near enemies", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 42, name: "Threat Detector", icon: `${B}/common/destiny2_content/icons/9611bdbc48aff898193fd5f705c7cf30.png`, description: "Improved reload, stability, and handling when near enemies", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 43, name: "Surrounded", icon: `${B}/common/destiny2_content/icons/979881b68ca7839267c9aef5aea2b0ce.png`, description: "Increased damage when near many enemies", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 43, name: "Surrounded", icon: `${B}/common/destiny2_content/icons/979881b68ca7839267c9aef5aea2b0ce.png`, description: "Increased damage when near many enemies", isActive: true, isWishlistPerk: false },
    },
  ],
});

const cataclysmic1: WeaponRoll = makeRoll({
  itemInstanceId: "demo-006",
  itemHash: 999767358,
  name: "Cataclysmic",
  icon: DEMO_ICONS.cataclysmic.icon,
  screenshot: DEMO_ICONS.cataclysmic.screenshot,
  watermark: DEMO_ICONS.cataclysmic.watermark,
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
      activePerks: [{ perkHash: 50, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 50, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 51, name: "Fluted Barrel", icon: `${B}/common/destiny2_content/icons/260eba9dd149dbb94b1306c9ed4dd8db.png`, description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 51, name: "Fluted Barrel", icon: `${B}/common/destiny2_content/icons/260eba9dd149dbb94b1306c9ed4dd8db.png`, description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 52, name: "Enhanced Battery", icon: `${B}/common/destiny2_content/icons/0ee59b61e99c52c85c2ea18ab705f700.png`, description: "+1 Magazine", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 52, name: "Enhanced Battery", icon: `${B}/common/destiny2_content/icons/0ee59b61e99c52c85c2ea18ab705f700.png`, description: "+1 Magazine", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 53, name: "Fourth Time's the Charm", icon: `${B}/common/destiny2_content/icons/a5edd4e751e1aa34bf8328a63b121e71.png`, description: "Rapidly hitting 4 precision shots returns 2 rounds", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 53, name: "Fourth Time's the Charm", icon: `${B}/common/destiny2_content/icons/a5edd4e751e1aa34bf8328a63b121e71.png`, description: "Rapidly hitting 4 precision shots returns 2 rounds", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 54, name: "Bait and Switch", icon: `${B}/common/destiny2_content/icons/bc91e95edfbc9163dd88339a93b66913.png`, description: "Dealing damage with all weapons briefly increases this weapon's damage", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 54, name: "Bait and Switch", icon: `${B}/common/destiny2_content/icons/bc91e95edfbc9163dd88339a93b66913.png`, description: "Dealing damage with all weapons briefly increases this weapon's damage", isActive: true, isWishlistPerk: true },
    },
  ],
});

const cataclysmic2: WeaponRoll = makeRoll({
  itemInstanceId: "demo-007",
  itemHash: 999767358,
  name: "Cataclysmic",
  icon: DEMO_ICONS.cataclysmic.icon,
  screenshot: DEMO_ICONS.cataclysmic.screenshot,
  watermark: DEMO_ICONS.cataclysmic.watermark,
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
      activePerks: [{ perkHash: 50, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 50, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 60, name: "Hammer-Forged Rifling", icon: `${B}/common/destiny2_content/icons/2b9eb6d4489cffc18c10223279198bcc.png`, description: "+10 Range", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 60, name: "Hammer-Forged Rifling", icon: `${B}/common/destiny2_content/icons/2b9eb6d4489cffc18c10223279198bcc.png`, description: "+10 Range", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 61, name: "Projection Fuse", icon: `${B}/common/destiny2_content/icons/eaa6fcec699a88e768782068d5e509e1.png`, description: "+10 Range", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 61, name: "Projection Fuse", icon: `${B}/common/destiny2_content/icons/eaa6fcec699a88e768782068d5e509e1.png`, description: "+10 Range", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 62, name: "Shoot to Loot", icon: `${B}/common/destiny2_content/icons/e8c6e23afe3c4215f0dc0c2941500c28.png`, description: "Shooting an ammo brick picks it up", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 62, name: "Shoot to Loot", icon: `${B}/common/destiny2_content/icons/e8c6e23afe3c4215f0dc0c2941500c28.png`, description: "Shooting an ammo brick picks it up", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 63, name: "Vorpal Weapon", icon: `${B}/common/destiny2_content/icons/bc5130b227ee577f2678ec2d2c97bf4a.png`, description: "Increased damage against bosses and vehicles", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 63, name: "Vorpal Weapon", icon: `${B}/common/destiny2_content/icons/bc5130b227ee577f2678ec2d2c97bf4a.png`, description: "Increased damage against bosses and vehicles", isActive: true, isWishlistPerk: true },
    },
  ],
});

const cataclysmic3: WeaponRoll = makeRoll({
  itemInstanceId: "demo-008",
  itemHash: 999767358,
  name: "Cataclysmic",
  icon: DEMO_ICONS.cataclysmic.icon,
  screenshot: DEMO_ICONS.cataclysmic.screenshot,
  watermark: DEMO_ICONS.cataclysmic.watermark,
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
      activePerks: [{ perkHash: 50, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 50, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "Fires a long-range precision bolt.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 70, name: "Polygonal Rifling", icon: `${B}/common/destiny2_content/icons/7d7aaccee29cf450d4057a9de871cdc8.png`, description: "+10 Stability", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 70, name: "Polygonal Rifling", icon: `${B}/common/destiny2_content/icons/7d7aaccee29cf450d4057a9de871cdc8.png`, description: "+10 Stability", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 71, name: "Particle Repeater", icon: `${B}/common/destiny2_content/icons/8a273117023794757631a34803314351.png`, description: "+10 Stability", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 71, name: "Particle Repeater", icon: `${B}/common/destiny2_content/icons/8a273117023794757631a34803314351.png`, description: "+10 Stability", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 72, name: "Compulsive Reloader", icon: `${B}/common/destiny2_content/icons/ef5843dfe8134c7385945216ece2bb06.png`, description: "Faster reloads when the magazine is more than half full", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 72, name: "Compulsive Reloader", icon: `${B}/common/destiny2_content/icons/ef5843dfe8134c7385945216ece2bb06.png`, description: "Faster reloads when the magazine is more than half full", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 73, name: "Adrenaline Junkie", icon: `${B}/common/destiny2_content/icons/6f8bde03140b53e6dc583ada1aeaa51d.png`, description: "Grenade kills give this weapon increased damage", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 73, name: "Adrenaline Junkie", icon: `${B}/common/destiny2_content/icons/6f8bde03140b53e6dc583ada1aeaa51d.png`, description: "Grenade kills give this weapon increased damage", isActive: true, isWishlistPerk: false },
    },
  ],
});

const funnelWeb1: WeaponRoll = makeRoll({
  itemInstanceId: "demo-009",
  itemHash: 3341893443,
  name: "Funnelweb",
  icon: DEMO_ICONS.funnelweb.icon,
  screenshot: DEMO_ICONS.funnelweb.screenshot,
  watermark: DEMO_ICONS.funnelweb.watermark,
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
      activePerks: [{ perkHash: 80, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 80, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 81, name: "Fluted Barrel", icon: `${B}/common/destiny2_content/icons/260eba9dd149dbb94b1306c9ed4dd8db.png`, description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 81, name: "Fluted Barrel", icon: `${B}/common/destiny2_content/icons/260eba9dd149dbb94b1306c9ed4dd8db.png`, description: "+5 Stability, +15 Handling", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 82, name: "Accurized Rounds", icon: `${B}/common/destiny2_content/icons/d85024478504205359c7fb52dbc4f6b6.png`, description: "+10 Range", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 82, name: "Accurized Rounds", icon: `${B}/common/destiny2_content/icons/d85024478504205359c7fb52dbc4f6b6.png`, description: "+10 Range", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 83, name: "Subsistence", icon: `${B}/common/destiny2_content/icons/eaa8f4295a71bf47df7ffd8599f7af4d.png`, description: "Kills partially reload from reserves", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 83, name: "Subsistence", icon: `${B}/common/destiny2_content/icons/eaa8f4295a71bf47df7ffd8599f7af4d.png`, description: "Kills partially reload from reserves", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 84, name: "Frenzy", icon: `${B}/common/destiny2_content/icons/23e06f4ced1b3e6476f342978ff5bb37.png`, description: "Sustained combat boosts damage, handling, and reload", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 84, name: "Frenzy", icon: `${B}/common/destiny2_content/icons/23e06f4ced1b3e6476f342978ff5bb37.png`, description: "Sustained combat boosts damage, handling, and reload", isActive: true, isWishlistPerk: true },
    },
  ],
});

const funnelWeb2: WeaponRoll = makeRoll({
  itemInstanceId: "demo-010",
  itemHash: 3341893443,
  name: "Funnelweb",
  icon: DEMO_ICONS.funnelweb.icon,
  screenshot: DEMO_ICONS.funnelweb.screenshot,
  watermark: DEMO_ICONS.funnelweb.watermark,
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
      activePerks: [{ perkHash: 80, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 80, name: "Aggressive Frame", icon: `${B}/common/destiny2_content/icons/64209c4fd20513b33109c374179d0958.png`, description: "High damage, slow fire rate", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 90, name: "Extended Barrel", icon: `${B}/common/destiny2_content/icons/d9e5e8fa07a84c29252b78b0e7b3106d.png`, description: "+10 Range, -10 Handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 90, name: "Extended Barrel", icon: `${B}/common/destiny2_content/icons/d9e5e8fa07a84c29252b78b0e7b3106d.png`, description: "+10 Range, -10 Handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 91, name: "Steady Rounds", icon: `${B}/common/destiny2_content/icons/6c6e1cc341487a8afd0b0c714a229255.png`, description: "+15 Stability, -5 Range", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 91, name: "Steady Rounds", icon: `${B}/common/destiny2_content/icons/6c6e1cc341487a8afd0b0c714a229255.png`, description: "+15 Stability, -5 Range", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 92, name: "Killing Wind", icon: `${B}/common/destiny2_content/icons/db2aa71ff6d808929bb0e668dcf0822e.png`, description: "Final blows grant mobility, range, and handling", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 92, name: "Killing Wind", icon: `${B}/common/destiny2_content/icons/db2aa71ff6d808929bb0e668dcf0822e.png`, description: "Final blows grant mobility, range, and handling", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 93, name: "Adrenaline Junkie", icon: `${B}/common/destiny2_content/icons/6f8bde03140b53e6dc583ada1aeaa51d.png`, description: "Grenade kills give increased damage", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 93, name: "Adrenaline Junkie", icon: `${B}/common/destiny2_content/icons/6f8bde03140b53e6dc583ada1aeaa51d.png`, description: "Grenade kills give increased damage", isActive: true, isWishlistPerk: false },
    },
  ],
});

const forbearance1: WeaponRoll = makeRoll({
  itemInstanceId: "demo-011",
  itemHash: 613334176,
  name: "Forbearance",
  icon: DEMO_ICONS.forbearance.icon,
  screenshot: DEMO_ICONS.forbearance.screenshot,
  watermark: DEMO_ICONS.forbearance.watermark,
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
      activePerks: [{ perkHash: 100, name: "Wave Frame", icon: `${B}/common/destiny2_content/icons/30428876335fdd1e164128b9e5a6e4ad.png`, description: "Fires a wave of energy on impact", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 100, name: "Wave Frame", icon: `${B}/common/destiny2_content/icons/30428876335fdd1e164128b9e5a6e4ad.png`, description: "Fires a wave of energy on impact", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 101, name: "Quick Launch", icon: `${B}/common/destiny2_content/icons/dfad5d8b00b79c4393943b791a624874.png`, description: "+10 Velocity, +15 Handling", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 101, name: "Quick Launch", icon: `${B}/common/destiny2_content/icons/dfad5d8b00b79c4393943b791a624874.png`, description: "+10 Velocity, +15 Handling", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 102, name: "High-Velocity Rounds", icon: `${B}/common/destiny2_content/icons/2a2b757cd73305126990cd19ad011a2c.png`, description: "+15 Velocity, +10 Reload Speed", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 102, name: "High-Velocity Rounds", icon: `${B}/common/destiny2_content/icons/2a2b757cd73305126990cd19ad011a2c.png`, description: "+15 Velocity, +10 Reload Speed", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 103, name: "Ambitious Assassin", icon: `${B}/common/destiny2_content/icons/1f93b49c7f10b1be70083f913a3c5d63.png`, description: "Overflows the magazine based on number of rapid kills", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 103, name: "Ambitious Assassin", icon: `${B}/common/destiny2_content/icons/1f93b49c7f10b1be70083f913a3c5d63.png`, description: "Overflows the magazine based on number of rapid kills", isActive: true, isWishlistPerk: true },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 104, name: "Chain Reaction", icon: `${B}/common/destiny2_content/icons/d17a60978288581d13a4aab6b9fc2b0e.png`, description: "Each final blow creates an elemental explosion", isActive: true, isWishlistPerk: true }],
      selectedPerk: { perkHash: 104, name: "Chain Reaction", icon: `${B}/common/destiny2_content/icons/d17a60978288581d13a4aab6b9fc2b0e.png`, description: "Each final blow creates an elemental explosion", isActive: true, isWishlistPerk: true },
    },
  ],
});

const forbearance2: WeaponRoll = makeRoll({
  itemInstanceId: "demo-012",
  itemHash: 613334176,
  name: "Forbearance",
  icon: DEMO_ICONS.forbearance.icon,
  screenshot: DEMO_ICONS.forbearance.screenshot,
  watermark: DEMO_ICONS.forbearance.watermark,
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
      activePerks: [{ perkHash: 100, name: "Wave Frame", icon: `${B}/common/destiny2_content/icons/30428876335fdd1e164128b9e5a6e4ad.png`, description: "Fires a wave of energy on impact", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 100, name: "Wave Frame", icon: `${B}/common/destiny2_content/icons/30428876335fdd1e164128b9e5a6e4ad.png`, description: "Fires a wave of energy on impact", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 110, name: "Volatile Launch", icon: `${B}/common/destiny2_content/icons/d255c9140cf640cfc820f995d1c1e96a.png`, description: "+15 Blast Radius, -5 Handling, -10 Velocity", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 110, name: "Volatile Launch", icon: `${B}/common/destiny2_content/icons/d255c9140cf640cfc820f995d1c1e96a.png`, description: "+15 Blast Radius, -5 Handling, -10 Velocity", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 111, name: "Mini Frags", icon: `${B}/common/destiny2_content/icons/89e6a61d84c55c679d578fe6a689da27.png`, description: "+5 Blast Radius, +5 Velocity", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 111, name: "Mini Frags", icon: `${B}/common/destiny2_content/icons/89e6a61d84c55c679d578fe6a689da27.png`, description: "+5 Blast Radius, +5 Velocity", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 112, name: "Unrelenting", icon: `${B}/common/destiny2_content/icons/1e5843177c71ae3f2a4770d01a2f3813.png`, description: "Rapidly defeating targets triggers health regen", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 112, name: "Unrelenting", icon: `${B}/common/destiny2_content/icons/1e5843177c71ae3f2a4770d01a2f3813.png`, description: "Rapidly defeating targets triggers health regen", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 113, name: "Disruption Break", icon: `${B}/common/destiny2_content/icons/45b57ce27fa0213218c7cb8f2253c517.png`, description: "Breaking shields grants bonus kinetic damage", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 113, name: "Disruption Break", icon: `${B}/common/destiny2_content/icons/45b57ce27fa0213218c7cb8f2253c517.png`, description: "Breaking shields grants bonus kinetic damage", isActive: true, isWishlistPerk: false },
    },
  ],
});

// Fallback-scored weapon (not in any wishlist)
const refurbishedGood: WeaponRoll = makeRoll({
  itemInstanceId: "demo-013",
  itemHash: 1399109800,
  name: "Refurbished A499",
  icon: DEMO_ICONS.refurbishedA499.icon,
  screenshot: DEMO_ICONS.refurbishedA499.screenshot,
  watermark: DEMO_ICONS.refurbishedA499.watermark,
  typeName: "Auto Rifle",
  damageType: 2, // Arc
  powerLevel: 1810,
  isGodRoll: true,
  isRecommended: true,
  matchedPerkCount: 0,
  location: "vault",
  usedFallback: true,
  fallbackRating: "great",
  fallbackScore: 5,
  fallbackMaxScore: 6,
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 200, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "This weapon's recoil pattern is more predictably vertical.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 200, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "This weapon's recoil pattern is more predictably vertical.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [
        { perkHash: 201, name: "Hammer-Forged Rifling", icon: `${B}/common/destiny2_content/icons/2b9eb6d4489cffc18c10223279198bcc.png`, description: "+10 Range", isActive: true, isWishlistPerk: false },
        { perkHash: 202, name: "Smallbore", icon: `${B}/common/destiny2_content/icons/7d1bb6a623f14959a47156ee71acfc3a.png`, description: "+7 Range, +7 Stability", isActive: false, isWishlistPerk: false },
      ],
      selectedPerk: { perkHash: 201, name: "Hammer-Forged Rifling", icon: `${B}/common/destiny2_content/icons/2b9eb6d4489cffc18c10223279198bcc.png`, description: "+10 Range", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [
        { perkHash: 203, name: "Ricochet Rounds", icon: `${B}/common/destiny2_content/icons/0a494d0442b32aff8c30d8b2b53561bd.png`, description: "+5 Range, +10 Stability", isActive: true, isWishlistPerk: false },
        { perkHash: 204, name: "Flared Magwell", icon: `${B}/common/destiny2_content/icons/f95e67e4ff37466505d66d3fa1030782.png`, description: "+5 Stability, +15 Reload Speed", isActive: false, isWishlistPerk: false },
      ],
      selectedPerk: { perkHash: 203, name: "Ricochet Rounds", icon: `${B}/common/destiny2_content/icons/0a494d0442b32aff8c30d8b2b53561bd.png`, description: "+5 Range, +10 Stability", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [
        { perkHash: 205, name: "Feeding Frenzy", icon: `${B}/common/destiny2_content/icons/89d7e65f5ebe8d291ea96f128765921d.png`, description: "Each rapid kill progressively increases reload speed", isActive: true, isWishlistPerk: false },
        { perkHash: 206, name: "Subsistence", icon: `${B}/common/destiny2_content/icons/eaa8f4295a71bf47df7ffd8599f7af4d.png`, description: "Kills partially reload from reserves", isActive: false, isWishlistPerk: false },
      ],
      selectedPerk: { perkHash: 205, name: "Feeding Frenzy", icon: `${B}/common/destiny2_content/icons/89d7e65f5ebe8d291ea96f128765921d.png`, description: "Each rapid kill progressively increases reload speed", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [
        { perkHash: 207, name: "Rampage", icon: `${B}/common/destiny2_content/icons/8976ead57430e4f5f8af1b3005de4f83.png`, description: "Kills grant increased damage. Stacks 3x.", isActive: true, isWishlistPerk: false },
        { perkHash: 208, name: "Adrenaline Junkie", icon: `${B}/common/destiny2_content/icons/6f8bde03140b53e6dc583ada1aeaa51d.png`, description: "Grenade kills give increased damage", isActive: false, isWishlistPerk: false },
      ],
      selectedPerk: { perkHash: 207, name: "Rampage", icon: `${B}/common/destiny2_content/icons/8976ead57430e4f5f8af1b3005de4f83.png`, description: "Kills grant increased damage. Stacks 3x.", isActive: true, isWishlistPerk: false },
    },
  ],
});

const refurbishedBad: WeaponRoll = makeRoll({
  itemInstanceId: "demo-014",
  itemHash: 1399109800,
  name: "Refurbished A499",
  icon: DEMO_ICONS.refurbishedA499.icon,
  screenshot: DEMO_ICONS.refurbishedA499.screenshot,
  watermark: DEMO_ICONS.refurbishedA499.watermark,
  typeName: "Auto Rifle",
  damageType: 2,
  powerLevel: 1795,
  isGodRoll: false,
  isRecommended: false,
  matchedPerkCount: 0,
  location: "vault",
  usedFallback: true,
  fallbackRating: "ok",
  fallbackScore: 1,
  fallbackMaxScore: 1,
  perks: [
    {
      columnIndex: 0,
      activePerks: [{ perkHash: 200, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "This weapon's recoil pattern is more predictably vertical.", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 200, name: "Precision Frame", icon: `${B}/common/destiny2_content/icons/e9dd736124e8ef94048901a279a5bb18.png`, description: "This weapon's recoil pattern is more predictably vertical.", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 1,
      activePerks: [{ perkHash: 210, name: "Polygonal Rifling", icon: `${B}/common/destiny2_content/icons/7d7aaccee29cf450d4057a9de871cdc8.png`, description: "+10 Stability", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 210, name: "Polygonal Rifling", icon: `${B}/common/destiny2_content/icons/7d7aaccee29cf450d4057a9de871cdc8.png`, description: "+10 Stability", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 2,
      activePerks: [{ perkHash: 211, name: "Extended Mag", icon: `${B}/common/destiny2_content/icons/66cfea124e24e73cca1ce6370b44ca7e.png`, description: "+6 Magazine, -45 Reload Speed", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 211, name: "Extended Mag", icon: `${B}/common/destiny2_content/icons/66cfea124e24e73cca1ce6370b44ca7e.png`, description: "+6 Magazine, -45 Reload Speed", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 3,
      activePerks: [{ perkHash: 212, name: "Hip-Fire Grip", icon: `${B}/common/destiny2_content/icons/b481f0ed53a3ae0b31a370d115a06860.png`, description: "Increases accuracy when firing from the hip", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 212, name: "Hip-Fire Grip", icon: `${B}/common/destiny2_content/icons/b481f0ed53a3ae0b31a370d115a06860.png`, description: "Increases accuracy when firing from the hip", isActive: true, isWishlistPerk: false },
    },
    {
      columnIndex: 4,
      activePerks: [{ perkHash: 213, name: "Zen Moment", icon: `${B}/common/destiny2_content/icons/9650a58cd3a439bf3b53a53dbc8122a0.png`, description: "Dealing damage increases stability", isActive: true, isWishlistPerk: false }],
      selectedPerk: { perkHash: 213, name: "Zen Moment", icon: `${B}/common/destiny2_content/icons/9650a58cd3a439bf3b53a53dbc8122a0.png`, description: "Dealing damage increases stability", isActive: true, isWishlistPerk: false },
    },
  ],
});

// Build duplicate groups
const austringerGroup: DuplicateGroup = {
  weaponHash: 372697604,
  weaponName: "Austringer",
  weaponIcon: DEMO_ICONS.austringer.icon,
  weaponType: "Hand Cannon",
  damageType: 1,
  rolls: [cantataGodRoll, cantataJunk1, cantataJunk2],
  keepRecommendations: ["demo-001"],
  junkRecommendations: ["demo-002", "demo-003"],
};

const calusGroup: DuplicateGroup = {
  weaponHash: 2714220251,
  weaponName: "CALUS Mini-Tool",
  weaponIcon: DEMO_ICONS.calusMiniTool.icon,
  weaponType: "Submachine Gun",
  damageType: 3,
  rolls: [callusGodRoll, callusJunk],
  keepRecommendations: ["demo-004"],
  junkRecommendations: ["demo-005"],
};

const cataclysmicGroup: DuplicateGroup = {
  weaponHash: 999767358,
  weaponName: "Cataclysmic",
  weaponIcon: DEMO_ICONS.cataclysmic.icon,
  weaponType: "Linear Fusion Rifle",
  damageType: 3,
  rolls: [cataclysmic1, cataclysmic2, cataclysmic3],
  keepRecommendations: ["demo-006"],
  junkRecommendations: ["demo-007", "demo-008"],
};

const funnelwebGroup: DuplicateGroup = {
  weaponHash: 3341893443,
  weaponName: "Funnelweb",
  weaponIcon: DEMO_ICONS.funnelweb.icon,
  weaponType: "Submachine Gun",
  damageType: 4,
  rolls: [funnelWeb1, funnelWeb2],
  keepRecommendations: ["demo-009"],
  junkRecommendations: ["demo-010"],
};

const forbearanceGroup: DuplicateGroup = {
  weaponHash: 613334176,
  weaponName: "Forbearance",
  weaponIcon: DEMO_ICONS.forbearance.icon,
  weaponType: "Grenade Launcher",
  damageType: 2,
  rolls: [forbearance1, forbearance2],
  keepRecommendations: ["demo-011"],
  junkRecommendations: ["demo-012"],
};

const refurbishedGroup: DuplicateGroup = {
  weaponHash: 1399109800,
  weaponName: "Refurbished A499",
  weaponIcon: DEMO_ICONS.refurbishedA499.icon,
  weaponType: "Auto Rifle",
  damageType: 2,
  rolls: [refurbishedGood, refurbishedBad],
  keepRecommendations: ["demo-013"],
  junkRecommendations: ["demo-014"],
};

export const DEMO_ANALYSIS: VaultAnalysis = {
  totalWeapons: 49,
  duplicateGroups: [
    cataclysmicGroup,
    austringerGroup,
    refurbishedGroup,
    funnelwebGroup,
    calusGroup,
    forbearanceGroup,
  ],
  godRollCount: 5,
  junkCount: 8,
  keepCount: 6,
};
