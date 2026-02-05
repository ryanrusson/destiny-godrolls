import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/bungie-auth";

export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.redirect(
      new URL("/?error=config", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  }
}
