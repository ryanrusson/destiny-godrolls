import { NextResponse } from "next/server";
import { getSession } from "@/lib/bungie-auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      displayName: session.displayName,
      membershipType: session.destinyMembershipType,
      membershipId: session.destinyMembershipId,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
