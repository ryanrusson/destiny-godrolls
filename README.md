# Vault Janitor - Destiny 2 God Roll Checker

A web app that connects to your Bungie account, scans your Destiny 2 vault, and tells you which duplicate weapons to keep and which to dismantle. Uses the community-curated [Voltron wishlist](https://github.com/48klocs/dim-wish-list-sources) and a built-in perk scoring fallback for weapons the wishlist doesn't cover.

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
6. **Groups duplicates** by weapon hash and recommends which to keep vs. dismantle

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

### Keep/Junk Recommendations

For each group of duplicate weapons:

1. **Always keep** god rolls, recommended rolls, and equipped weapons
2. **Always keep at least one copy** - if nothing is recommended, keep the best roll (highest wishlist match count, then fallback score, then power level)
3. **Everything else is junk** - safe to dismantle

### What the Weapon Card Shows

Each weapon card displays:
- Weapon icon, name, damage type, and weapon type
- Power level
- Stat bars (Range, Stability, Handling, Reload Speed, etc.)
- All available perks per column in a grid (DIM-style), with the equipped perk highlighted
- Wishlist perks marked with a gold dot
- A badge: GOD ROLL / KEEP / GREAT ROLL / GOOD ROLL / JUNK / KEEP (BEST)
- Wishlist notes from the community (when available)
- Perk score (for fallback-rated weapons)

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
  components/
    WeaponCard.tsx        # Individual weapon roll card
  lib/
    bungie-api.ts         # Bungie API client
    bungie-auth.ts        # OAuth + session management
    manifest.ts           # Item definition loader
    wishlist.ts           # Voltron wishlist parser
    analyzer.ts           # Core analysis engine
    perk-ratings.ts       # Fallback perk tier database
    demo-data.ts          # Demo mode sample data
    types.ts              # TypeScript interfaces
```
