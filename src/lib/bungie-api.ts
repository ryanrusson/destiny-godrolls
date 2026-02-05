import {
  DestinyItemComponent,
  DestinyItemInstance,
  DestinyItemSocketsComponent,
  BungieMembership,
} from "./types";

const BUNGIE_API_BASE = "https://www.bungie.net/Platform";
const BUNGIE_ROOT = "https://www.bungie.net";

export function bungieIconUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BUNGIE_ROOT}${path}`;
}

async function bungieApiRequest(
  path: string,
  accessToken?: string
): Promise<unknown> {
  const apiKey = process.env.BUNGIE_API_KEY;
  if (!apiKey) throw new Error("BUNGIE_API_KEY not configured");

  const headers: Record<string, string> = {
    "X-API-Key": apiKey,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BUNGIE_API_BASE}${path}`, {
    headers,
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Bungie API error ${response.status}: ${body}`
    );
  }

  const data = await response.json();

  if (data.ErrorCode !== 1) {
    throw new Error(
      `Bungie API error: ${data.Message} (${data.ErrorCode})`
    );
  }

  return data.Response;
}

export async function getMembershipData(
  accessToken: string,
  bungieMembershipId: string
): Promise<BungieMembership[]> {
  const response = (await bungieApiRequest(
    `/User/GetMembershipsById/${bungieMembershipId}/254/`,
    accessToken
  )) as {
    destinyMemberships: BungieMembership[];
  };

  return response.destinyMemberships;
}

// Profile components we need:
// 102 = ProfileInventories (vault)
// 200 = Characters
// 201 = CharacterInventories
// 205 = CharacterEquipment
// 300 = ItemInstances
// 304 = ItemSockets
const PROFILE_COMPONENTS = "102,200,201,205,300,304";

export interface ProfileResponse {
  profileInventory: {
    data: { items: DestinyItemComponent[] };
  };
  characters: {
    data: Record<
      string,
      {
        characterId: string;
        classType: number;
        light: number;
        emblemBackgroundPath: string;
      }
    >;
  };
  characterInventories: {
    data: Record<string, { items: DestinyItemComponent[] }>;
  };
  characterEquipment: {
    data: Record<string, { items: DestinyItemComponent[] }>;
  };
  itemComponents: {
    instances: {
      data: Record<string, DestinyItemInstance>;
    };
    sockets: {
      data: Record<string, DestinyItemSocketsComponent>;
    };
  };
}

export async function getProfile(
  accessToken: string,
  membershipType: number,
  membershipId: string
): Promise<ProfileResponse> {
  return (await bungieApiRequest(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${PROFILE_COMPONENTS}`,
    accessToken
  )) as ProfileResponse;
}

export async function getManifestUrls(): Promise<{
  jsonWorldComponentContentPaths: Record<string, Record<string, string>>;
}> {
  return (await bungieApiRequest("/Destiny2/Manifest/")) as {
    jsonWorldComponentContentPaths: Record<string, Record<string, string>>;
  };
}

export async function getManifestTable(
  tablePath: string
): Promise<Record<string, unknown>> {
  const response = await fetch(`${BUNGIE_ROOT}${tablePath}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch manifest table: ${response.status}`);
  }
  return response.json();
}
