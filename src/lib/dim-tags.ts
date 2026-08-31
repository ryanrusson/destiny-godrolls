/**
 * DIM interop helpers shared by weapons and armor.
 *
 * Anything the analysis wants to hand to DIM — a copy-paste search query or a
 * DIM Sync tag update — goes through the minimal `DimTaggable` view that both
 * `WeaponRoll` and `ArmorPiece` satisfy, so a DIM tag stays a property of an
 * item instance, not of a particular grouping or view.
 */

import { DimTag, DIM_TAGS } from "./types";

/** The slice of an analyzed item that DIM tagging needs. */
export interface DimTaggable {
  itemInstanceId: string;
  suggestedTag: DimTag;
  /** Human-readable reason tags explaining the verdict */
  reasons: string[];
}

/** Prefix marking DIM notes written by this app, so re-syncs can safely overwrite them. */
export const DIM_NOTE_PREFIX = "[VJ]";

/** DIM caps notes at 1024 chars; ours stay far shorter so they read well in DIM's UI. */
const NOTE_MAX_LENGTH = 120;

/**
 * A single item annotation in DIM Sync's `tag` update action
 * (POST https://api.destinyitemmanager.com/profile).
 */
export interface DimItemAnnotation {
  /** Item instance id */
  id: string;
  /** null clears the tag */
  tag?: DimTag | null;
  /** null clears the note */
  notes?: string | null;
}

/**
 * Build a DIM search query that selects exactly these instances, e.g.
 * `id:6917529 or id:6917530`. Pasting it into DIM's search bar lets you bulk
 * tag the whole set from the item actions menu.
 */
export function buildDimQuery(instanceIds: string[]): string {
  return instanceIds.map((id) => `id:${id}`).join(" or ");
}

/** Instance ids per suggested DIM tag, ready for {@link buildDimQuery}. */
export function instanceIdsByTag(items: DimTaggable[]): Record<DimTag, string[]> {
  const byTag = Object.fromEntries(DIM_TAGS.map((t) => [t, [] as string[]])) as Record<
    DimTag,
    string[]
  >;
  for (const item of items) {
    byTag[item.suggestedTag].push(item.itemInstanceId);
  }
  return byTag;
}

/** The `[VJ]`-prefixed DIM note for an item, or undefined when there's nothing to say. */
export function buildDimNote(item: DimTaggable): string | undefined {
  if (item.reasons.length === 0) return undefined;
  const note = `${DIM_NOTE_PREFIX} ${item.reasons.join("; ")}`;
  return note.length > NOTE_MAX_LENGTH
    ? `${note.slice(0, NOTE_MAX_LENGTH - 1)}…`
    : note;
}

/** Turn analyzed items into DIM Sync tag annotations. */
export function buildDimAnnotations(items: DimTaggable[]): DimItemAnnotation[] {
  return items.map((item) => ({
    id: item.itemInstanceId,
    tag: item.suggestedTag,
    notes: buildDimNote(item),
  }));
}
