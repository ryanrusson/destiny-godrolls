import { NextResponse } from "next/server";
import { getSession } from "@/lib/bungie-auth";
import { getProfile } from "@/lib/bungie-api";
import { analyzeProfile } from "@/lib/analyzer";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profile = await getProfile(
      session.accessToken,
      session.destinyMembershipType,
      session.destinyMembershipId
    );

    const analysis = await analyzeProfile(profile);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
