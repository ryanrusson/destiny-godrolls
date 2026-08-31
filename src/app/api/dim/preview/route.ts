import { NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/bungie-auth";
import { ensureDimToken, getDimTags, isDimConfigured } from "@/lib/dim-api";

/**
 * The user's existing DIM tags/notes, keyed by item instance id, so the sync
 * dialog can show what a push would change and protect hand-set tags.
 *
 * `?check=1` short-circuits to just the configured flag — a cheap probe the UI
 * uses to warn upfront when this deployment has no DIM API key.
 */
export async function GET(request: Request) {
  try {
    if (!isDimConfigured()) {
      return NextResponse.json({ configured: false, tags: {} });
    }

    if (new URL(request.url).searchParams.get("check")) {
      return NextResponse.json({ configured: true, tags: {} });
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
