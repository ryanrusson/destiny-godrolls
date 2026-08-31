import { DimItemAnnotation } from "./dim-tags";
import { UserSession } from "./types";

/**
 * Client for the DIM Sync API (https://github.com/DestinyItemManager/dim-api).
 *
 * DIM stores item tags/notes in its own backend, not Bungie's, so pushing our
 * recommendations there needs no Bungie write scope. Auth is a two-step:
 * exchange the user's Bungie access token for a DIM token (a 30-day JWT), then
 * send that token plus our DIM API key on every call.
 *
 * Requires DIM_API_KEY — see the "DIM Sync integration" section of the README
 * for how to register one.
 */

const DIM_API_BASE = "https://api.destinyitemmanager.com";

/** Re-exchange a bit before the JWT actually expires. */
const TOKEN_EXPIRY_MARGIN_MS = 60 * 60 * 1000;

/** DIM accepts up to 2 MB of JSON per request; 200 annotations is far under. */
const UPDATE_CHUNK_SIZE = 200;

export function isDimConfigured(): boolean {
  return Boolean(process.env.DIM_API_KEY);
}

function dimApiKey(): string {
  const apiKey = process.env.DIM_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DIM integration not configured: set DIM_API_KEY (see README)"
    );
  }
  return apiKey;
}

async function dimApiRequest(
  path: string,
  options: { method?: "GET" | "POST"; dimToken?: string; body?: unknown } = {}
): Promise<unknown> {
  const headers: Record<string, string> = {
    "X-API-Key": dimApiKey(),
  };
  if (options.dimToken) {
    headers["Authorization"] = `Bearer ${options.dimToken}`;
  }
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${DIM_API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DIM API error ${response.status}: ${body}`);
  }

  return response.json();
}

/**
 * Trade the user's Bungie access token for a DIM Sync token. DIM verifies the
 * Bungie token server-side, so the membershipId must be the Bungie.net one the
 * token was issued for.
 */
async function exchangeDimToken(
  bungieAccessToken: string,
  bungieMembershipId: string
): Promise<{ accessToken: string; expiresInSeconds: number }> {
  return (await dimApiRequest("/auth/token", {
    method: "POST",
    body: { bungieAccessToken, membershipId: bungieMembershipId },
  })) as { accessToken: string; expiresInSeconds: number };
}

/**
 * Get a valid DIM token for this session, reusing the cached one when it has
 * time left. Returns the (possibly updated) session so callers can persist it
 * back to the cookie.
 */
export async function ensureDimToken(
  session: UserSession,
  options: { forceRefresh?: boolean } = {}
): Promise<{ dimToken: string; session: UserSession; refreshed: boolean }> {
  if (
    !options.forceRefresh &&
    session.dimAccessToken &&
    session.dimTokenExpiry &&
    Date.now() < session.dimTokenExpiry - TOKEN_EXPIRY_MARGIN_MS
  ) {
    return { dimToken: session.dimAccessToken, session, refreshed: false };
  }

  const tokens = await exchangeDimToken(
    session.accessToken,
    session.bungieMembershipId
  );
  return {
    dimToken: tokens.accessToken,
    session: {
      ...session,
      dimAccessToken: tokens.accessToken,
      dimTokenExpiry: Date.now() + tokens.expiresInSeconds * 1000,
    },
    refreshed: true,
  };
}

/** The user's existing DIM tags/notes, for diffing before a sync. */
export async function getDimTags(
  dimToken: string,
  platformMembershipId: string
): Promise<DimItemAnnotation[]> {
  const params = new URLSearchParams({
    platformMembershipId,
    destinyVersion: "2",
    components: "tags",
  });
  const response = (await dimApiRequest(`/profile?${params.toString()}`, {
    dimToken,
  })) as { tags?: DimItemAnnotation[] };
  return response.tags ?? [];
}

export interface DimSyncResult {
  tagged: number;
  failed: number;
  /** Distinct validation messages from DIM, when any update was rejected */
  errors: string[];
}

/**
 * Push tag annotations into DIM Sync, chunked. DIM validates each update
 * independently (`results` is index-aligned with `updates`), applies the valid
 * ones, and reports the rest — so a partial failure still tags what it can.
 */
export async function postDimTagUpdates(
  dimToken: string,
  platformMembershipId: string,
  annotations: DimItemAnnotation[]
): Promise<DimSyncResult> {
  const result: DimSyncResult = { tagged: 0, failed: 0, errors: [] };

  for (let i = 0; i < annotations.length; i += UPDATE_CHUNK_SIZE) {
    const chunk = annotations.slice(i, i + UPDATE_CHUNK_SIZE);
    const response = (await dimApiRequest("/profile", {
      method: "POST",
      dimToken,
      body: {
        platformMembershipId,
        destinyVersion: 2,
        updates: chunk.map((payload) => ({ action: "tag", payload })),
      },
    })) as { results?: { status: string; message?: string }[] };

    for (const updateResult of response.results ?? []) {
      if (updateResult.status === "Success") {
        result.tagged += 1;
      } else {
        result.failed += 1;
        if (updateResult.message && !result.errors.includes(updateResult.message)) {
          result.errors.push(updateResult.message);
        }
      }
    }
  }

  return result;
}
