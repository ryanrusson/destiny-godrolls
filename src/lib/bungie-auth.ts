import { cookies } from "next/headers";
import { BungieTokenResponse, UserSession } from "./types";

const BUNGIE_AUTH_URL = "https://www.bungie.net/en/OAuth/Authorize";
const BUNGIE_TOKEN_URL =
  "https://www.bungie.net/Platform/App/OAuth/Token/";

const SESSION_COOKIE = "destiny_session";

export function getAuthUrl(): string {
  const clientId = process.env.BUNGIE_CLIENT_ID;
  if (!clientId) throw new Error("BUNGIE_CLIENT_ID not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
  });

  return `${BUNGIE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<BungieTokenResponse> {
  const clientId = process.env.BUNGIE_CLIENT_ID;
  const clientSecret = process.env.BUNGIE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Bungie OAuth credentials not configured");
  }

  const response = await fetch(BUNGIE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<BungieTokenResponse> {
  const clientId = process.env.BUNGIE_CLIENT_ID;
  const clientSecret = process.env.BUNGIE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Bungie OAuth credentials not configured");
  }

  const response = await fetch(BUNGIE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  return response.json();
}

function encodeSession(session: UserSession): string {
  // Simple base64 encoding. In production, use proper encryption (e.g., iron-session).
  return Buffer.from(JSON.stringify(session)).toString("base64");
}

function decodeSession(encoded: string): UserSession | null {
  try {
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function setSession(session: UserSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;

  const session = decodeSession(cookie.value);
  if (!session) return null;

  // Check if token is expired and try to refresh
  if (Date.now() > session.tokenExpiry) {
    try {
      const tokens = await refreshAccessToken(session.refreshToken);
      const refreshedSession: UserSession = {
        ...session,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: Date.now() + tokens.expires_in * 1000,
      };
      await setSession(refreshedSession);
      return refreshedSession;
    } catch {
      // Refresh failed, clear session
      await clearSession();
      return null;
    }
  }

  return session;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
