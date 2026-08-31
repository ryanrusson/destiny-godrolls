# Vault Janitor - Destiny 2 God Roll Checker

A web app that connects to your Bungie account, scans your Destiny 2 vault, and tells you which weapons and armor pieces to keep and which to dismantle. Weapons are compared against duplicate copies *and* against every other weapon in your vault that fills the same role, then checked against the community-curated [Voltron wishlist](https://github.com/48klocs/dim-wish-list-sources) with a built-in perk scoring fallback. Armor is assessed under the Edge of Fate Armor 3.0 tiering system (gear tiers, archetypes, stat rolls). Every weapon and armor piece gets a suggested [DIM](https://destinyitemmanager.com) tag, which can be pushed straight into your DIM account via DIM Sync or exported as a DIM search query for bulk tagging.

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Getting Started

### 1. Create a Bungie Application

Go to [bungie.net/en/Application](https://www.bungie.net/en/Application) and create a new app:

- **OAuth Client Type:** Confidential
- **Redirect URL:** `https://redirectmeto.com/http://localhost:4000/api/auth/callback`
  (The `redirectmeto.com` proxy is needed because Bungie requires HTTPS redirect URLs, but we're running localhost over HTTP.)

Note your **API Key**, **OAuth client_id**, and **OAuth client_secret**.

### 2. Configure Environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
BUNGIE_API_KEY=your_api_key
BUNGIE_CLIENT_ID=your_client_id
BUNGIE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:4000
SESSION_SECRET=some-random-string-at-least-32-characters
DIM_API_KEY=your_dim_api_key   # optional, enables "Sync to DIM" — see DIM Sync integration
```

### 3. Install and Run

```bash
npm install
npm run dev
```

The app runs on [http://localhost:4000](http://localhost:4000). You can also try the **Demo Mode** from the home page without signing in.

## How It Works

### Authentication

OAuth 2.0 flow with Bungie:

1. User clicks "Sign in with Bungie" &rarr; redirected to Bungie's OAuth page
2. Bungie redirects back to `/api/auth/callback` with an auth code
3. Server exchanges the code for access/refresh tokens
4. Session is stored in an encrypted httpOnly cookie (30-day expiry)
5. Tokens are automatically refreshed when expired

### Vault Analysis Pipeline

When you click "Scan Vault", the app:

1. **Fetches your profile** from the Bungie API (vault, character inventories, equipped items)
2. **Loads item definitions** from the Bungie manifest (weapon names, icons, stats, perk info)
3. **Downloads the Voltron wishlist** (cached for 6 hours) - a community-curated list of recommended weapon rolls
4. **Filters to Legendary and Exotic weapons** only
5. **Evaluates each weapon** against the wishlist and fallback scoring (see below)
6. **Compares every weapon** against its duplicates and against similar weapons you own, then recommends which to keep, review, or dismantle

### Weapon Scoring: Two Systems

#### 1. Wishlist Matching (Primary)

The app uses the [Voltron community wishlist](https://github.com/48klocs/dim-wish-list-sources) in DIM wishlist format. Each wishlist entry specifies a weapon hash and a set of perk hashes that make up a recommended roll.

For each weapon in your vault:
- Compare equipped perk hashes against all wishlist entries for that weapon
- **God Roll** = all perks match a wishlist entry (with 2+ perk matches)
- **Recommended (Keep)** = 3+ perks match a wishlist entry
- Wishlist perks are highlighted in gold on the weapon card

#### 2. Fallback Perk Scoring (for weapons not in the wishlist)

Many weapons have no wishlist coverage. For these, the app falls back to a built-in perk tier system that scores trait perks (columns 3 and 4) by name:

| Tier | Score | Examples |
|------|-------|---------|
| S | 3 | Rampage, Kill Clip, Vorpal Weapon, Rapid Hit, Incandescent, Voltshot |
| A | 2 | Demolitionist, Swashbuckler, Auto-Loading Holster, Dragonfly, Firing Line |
| B | 1 | Rangefinder, Opening Shot, Killing Wind, Headstone, Chill Clip |

The two trait perks are scored and summed (max 6 with two S-tier perks):

| Rating | Score | Badge |
|--------|-------|-------|
| Great Roll | 5+ | Yellow badge, treated like a god roll |
| Good Roll | 3-4 | Green badge, recommended to keep |
| OK | 1-2 | Kept only if it's the best copy |
| None | 0 | Junk candidate |

Only trait perks (columns 3 & 4) are scored. Barrel and magazine perks are too weapon-specific to rate generically.

### Armor Assessments (Armor 3.0)

The Armor tab assesses every Legendary and Exotic armor piece under the Edge of Fate armor system. Each piece gets a verdict — **KEEP**, **JUNK**, or **REVIEW** — with reason tags explaining why, plus filters to slice by class, slot, archetype, gear tier, and status.

How pieces are judged:

- **Gear tier (1-5)** comes from the Bungie API when available, or is derived from the stat total (T1 52-57 ... T5 = 75). Tier 5 pieces (max stats + tuning slot) are always keeps.
- **Archetype** (Brawler, Bulwark, Grenadier, Gunner, Paragon, Specialist) is read from the armor's intrinsic and determines the primary/secondary stats; the random tertiary stat is highlighted and factors into Tier 4 verdicts.
- **Duplicate comparison** groups pieces by class + slot + archetype; a piece that is strictly worse than another you own (same or lower tier, every stat equal or lower) is junk. Every group always keeps at least one piece.
- **Legacy armor** (pre-Edge of Fate, no archetype) is flagged junk-leaning since it can't compete with tiered gear.
- **Exotics get separate rules** and are never bulk-junked: the best roll of each distinct exotic is kept, and exotic class items keep the best copy of every unique perk combo (e.g. Spirit of the Assassin + Spirit of the Star-Eater).

### Weapon Comparisons

Owning three copies of one hand cannon is the obvious cleanup case, but it isn't
the only one. If you own six different kinetic hand cannons and only two are any
good, the other four are just as much vault clutter. The Weapons tab compares
your rolls along four scopes, switchable with the **Compare by** control:

| Scope | Groups by | Answers |
|-------|-----------|---------|
| **Duplicates** | Same weapon hash, 2+ copies | Which copy of this weapon do I keep? |
| **All Weapons** | Same weapon hash, singles included | What does this weapon look like? |
| **Same Archetype** | Weapon type + intrinsic frame + element | Which of my solar lightweight SMGs is best? |
| **Same Weapon Type** | Weapon type + equipment slot, any element | How many energy hand cannons am I really carrying? |

Any group with 2+ rolls gets a **Compare stats** toggle: a side-by-side table of
every stat the rolls disagree on, with the best value in each row highlighted.

### Keep / Review / Junk Recommendations

Each roll carries one verdict, computed once from every comparison, so the same
weapon reads the same way in every scope.

**Duplicate pass** (same weapon hash):

1. **Always keep** god rolls, recommended rolls, and equipped weapons
2. **Always keep at least one copy** - if nothing is recommended, keep the best roll (highest wishlist match count, then fallback score, then power level)
3. **Everything else is junk** - safe to dismantle

**Role pass** (same archetype):

Different weapons filling the same role compete with each other. A roll that two
or more similar weapons clearly beat drops to **review** rather than junk -
losing a role comparison is a much softer signal than being a redundant copy, so
nothing is ever auto-junked on that basis. Exotics sit the comparison out
entirely; they occupy a slot no legendary competes for.

### DIM Tagging

Every weapon roll and armor piece gets a suggested
[DIM](https://destinyitemmanager.com) tag, because a tag belongs to an item
rather than to a grouping:

| Tag | Weapons | Armor |
|-----|---------|-------|
| **Favorite** | God rolls | Kept Tier 5s and exotics |
| **Keep** | Worth vault space | Worth vault space |
| **Infuse** | Junk, but higher power than anything kept in that slot - use it as fuel | - |
| **Junk** | Safe to dismantle | Safe to dismantle |
| **Archive** | Outclassed by similar weapons - worth a manual look | Needs review - worth a manual look |

The **DIM Tagging** panel above the results (on both the Weapons and Armor
tabs) covers exactly the items currently in view, so your active filters let
you tag a slice at a time. It offers two ways to get the tags into DIM:

- **Sync to DIM** pushes the tags directly into your DIM account through the
  [DIM Sync API](https://github.com/DestinyItemManager/dim-api). Before writing
  anything it reads your existing DIM tags: items you tagged differently in DIM
  are skipped unless you tick the overwrite box, and hand-written DIM notes are
  never touched (the app only writes notes prefixed with `[VJ]`, and only
  overwrites its own). Requires `DIM_API_KEY` (below); tags appear the next
  time DIM syncs.
- **Copy DIM search** turns each tag into a DIM search query (`id:… or id:…`).
  Paste it into DIM's search bar and bulk-tag the set from the item actions
  menu. Works without any extra setup.

### DIM Sync integration

The "Sync to DIM" button needs a DIM API key. For local development you can
register one yourself — DIM's `/new_app` endpoint issues keys for
localhost-style origins:

```bash
curl -s -X POST https://api.destinyitemmanager.com/new_app \
  -H "Content-Type: application/json" \
  -d '{"id":"your-app-name-dev","bungieApiKey":"YOUR_BUNGIE_API_KEY","origin":"http://localhost:4000"}'
```

- `id` must match `/^[a-z0-9-]{3,}$/`; re-POSTing the same request returns the
  same key.
- `bungieApiKey` must be the **same** `BUNGIE_API_KEY` this app uses — DIM
  verifies your users' Bungie tokens with it.
- The response nests the key: `{"app":{"dimApiKey":"…"}}`. Put that value in
  `.env.local` as `DIM_API_KEY`.

Deploying to a real domain needs a production key: join the
[DIM Discord](https://discord.gg/dimapp) and message the maintainer (`bhollis`)
with your production origin.

Without `DIM_API_KEY` the app still works — the panel just offers the
copy-paste search queries instead of direct sync. The sync talks only to DIM's
servers; it never writes anything to Bungie, and the user must have DIM Sync
enabled in DIM's settings (it's the default).

### What the Weapon Card Shows

Each weapon card displays:
- Weapon icon, name, damage type, and weapon type
- Power level
- Stat bars (Range, Stability, Handling, Reload Speed, etc.)
- All available perks per column in a grid (DIM-style), with the equipped perk highlighted
- Wishlist perks marked with a gold dot
- The suggested DIM tag (FAVORITE / KEEP / INFUSE / JUNK / ARCHIVE) and roll quality (GOD ROLL / GREAT ROLL / GOOD ROLL / WISHLIST MATCH)
- The reasons behind the verdict ("Duplicate - a better copy is kept", "Outclassed by 2 other kinetic hand cannons you own")
- Wishlist notes from the community (when available)
- Perk score (for fallback-rated weapons)

Inside a comparison group, the best value for each stat is highlighted so you
can see at a glance which roll wins where.

## Project Structure

```
src/
  app/
    page.tsx              # Landing page (sign in / demo mode)
    vault/page.tsx        # Main vault analysis view
    api/
      auth/
        login/route.ts    # Initiates Bungie OAuth
        callback/route.ts # Handles OAuth callback
        logout/route.ts   # Clears session
      bungie/
        profile/route.ts  # Returns player info
        inventory/route.ts# Fetches + analyzes vault
      dim/
        preview/route.ts  # Reads existing DIM tags (for sync diffing)
        sync/route.ts     # Pushes tags into DIM Sync
  components/
    WeaponCard.tsx           # Individual weapon roll card
    ComparisonGroupCard.tsx  # A comparison group + its stat table
    DimTagPanel.tsx          # DIM tag summary and search-query export
  lib/
    bungie-api.ts         # Bungie API client
    bungie-auth.ts        # OAuth + session management
    manifest.ts           # Item definition loader
    wishlist.ts           # Voltron wishlist parser
    analyzer.ts           # Core analysis engine
    weapon-comparison.ts  # Comparison scopes, verdicts, and DIM tags
    dim-tags.ts           # Shared DIM interop (queries, annotations)
    dim-api.ts            # DIM Sync API client (auth + tag push)
    perk-ratings.ts       # Fallback perk tier database
    demo-data.ts          # Demo mode sample data
    types.ts              # TypeScript interfaces
```
