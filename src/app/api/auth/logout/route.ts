import { NextResponse } from "next/server";
import { clearSession } from "@/lib/bungie-auth";

export async function GET() {
  await clearSession();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/", appUrl));
}
