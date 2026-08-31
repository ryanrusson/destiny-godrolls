import { NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/bungie-auth";
import { ensureDimToken, getDimTags, isDimConfigured } from "@/lib/dim-api";

/**
 * The user's existing DIM tags/notes, keyed by item instance id, so the sync
 * dialog can show what a push would change and protect hand-set tags.
 */
export async function GET() {
  try {
    if (!isDimConfigured()) {
      return NextResponse.json({ configured: false, tags: {} });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { dimToken, session: updatedSession, refreshed } =
      await ensureDimToken(session);
    if (refreshed) {
      await setSession(updatedSession);
    }

    const annotations = await getDimTags(
      dimToken,
      session.destinyMembershipId
    );

    const tags: Record<string, { tag: string | null; notes: string | null }> = {};
    for (const annotation of annotations) {
      tags[annotation.id] = {
        tag: annotation.tag ?? null,
        notes: annotation.notes ?? null,
      };
    }

    return NextResponse.json({ configured: true, tags });
  } catch (error) {
    console.error("DIM preview error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read DIM tags" },
      { status: 500 }
    );
  }
}
