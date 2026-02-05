import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, setSession } from "@/lib/bungie-auth";
import { getMembershipData } from "@/lib/bungie-api";
import { UserSession } from "@/lib/types";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(new URL("/?error=no_code", appUrl));
    }

    // Exchange code for tokens
    const tokens = await exchangeCode(code);

    // Get Destiny membership info
    const memberships = await getMembershipData(
      tokens.access_token,
      tokens.membership_id
    );

    if (!memberships || memberships.length === 0) {
      return NextResponse.redirect(new URL("/?error=no_membership", appUrl));
    }

    // Use the first (usually primary) membership
    const membership = memberships[0];

    const session: UserSession = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: Date.now() + tokens.expires_in * 1000,
      bungieMembershipId: tokens.membership_id,
      destinyMembershipId: membership.membershipId,
      destinyMembershipType: membership.membershipType,
      displayName:
        membership.bungieGlobalDisplayName ||
        membership.displayName ||
        "Guardian",
    };

    await setSession(session);

    return NextResponse.redirect(new URL("/vault", appUrl));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", appUrl));
  }
}
