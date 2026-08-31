import { NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/bungie-auth";
import { ensureDimToken, isDimConfigured, postDimTagUpdates } from "@/lib/dim-api";
import { DimItemAnnotation } from "@/lib/dim-tags";
import { DimTag, DIM_TAGS } from "@/lib/types";

// Mirrors DIM's own server-side validation so bad entries fail here, not there.
const ITEM_ID_PATTERN = /^\d{1,32}$/;
const DIM_NOTES_MAX_LENGTH = 1024;
const MAX_UPDATES_PER_SYNC = 5000;

function parseAnnotations(body: unknown): DimItemAnnotation[] | string {
  if (typeof body !== "object" || body === null) return "Request body must be JSON";
  const updates = (body as { updates?: unknown }).updates;
  if (!Array.isArray(updates)) return "updates must be an array";
  if (updates.length === 0) return "updates is empty";
  if (updates.length > MAX_UPDATES_PER_SYNC) {
    return `updates cannot exceed ${MAX_UPDATES_PER_SYNC} items`;
  }

  const annotations: DimItemAnnotation[] = [];
  for (const update of updates) {
    if (typeof update !== "object" || update === null) {
      return "each update must be an object";
    }
    const { id, tag, notes } = update as {
      id?: unknown;
      tag?: unknown;
      notes?: unknown;
    };
    if (typeof id !== "string" || !ITEM_ID_PATTERN.test(id)) {
      return `item id ${String(id)} is not a valid instance id`;
    }
    if (tag !== null && !DIM_TAGS.includes(tag as DimTag)) {
      return `tag ${String(tag)} is not a DIM tag`;
    }
    if (
      notes !== undefined &&
      notes !== null &&
      (typeof notes !== "string" || notes.length > DIM_NOTES_MAX_LENGTH)
    ) {
      return `notes must be a string under ${DIM_NOTES_MAX_LENGTH} characters`;
    }
    annotations.push({
      id,
      tag: tag as DimTag | null,
      ...(notes !== undefined ? { notes: notes as string | null } : {}),
    });
  }
  return annotations;
}

/** Push tag annotations into the user's DIM Sync profile. */
export async function POST(request: Request) {
  try {
    if (!isDimConfigured()) {
      return NextResponse.json(
        { error: "DIM integration not configured: set DIM_API_KEY (see README)" },
        { status: 503 }
      );
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const annotations = parseAnnotations(await request.json());
    if (typeof annotations === "string") {
      return NextResponse.json({ error: annotations }, { status: 400 });
    }

    const { dimToken, session: updatedSession, refreshed } =
      await ensureDimToken(session);
    if (refreshed) {
      await setSession(updatedSession);
    }

    const result = await postDimTagUpdates(
      dimToken,
      session.destinyMembershipId,
      annotations
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("DIM sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync tags to DIM" },
      { status: 500 }
    );
  }
}
