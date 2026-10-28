// Server-only: checks the gift a sender sends us, for both publishing and later edits.
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/gift-links";

/** Text-only gift size once photos are uploaded. Real gifts are well under 100 KB. */
const MAX_STORY_BYTES = 512 * 1024;
/** How far ahead a gift can be scheduled to unlock. */
const MAX_SCHEDULE_DAYS = 366;

export const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

type StoryIn = { recipient?: unknown; sender?: unknown; palette?: unknown; scenes?: unknown };

/** The gift's pages, checked. Returns an error message instead when something's off. */
export function readStory(raw: unknown): { story: StoryIn & Record<string, unknown>; recipient: string; sender: string } | { error: string; status: number } {
  const story = raw as (StoryIn & Record<string, unknown>) | null;
  if (!story || typeof story !== "object" || !Array.isArray(story.scenes) || story.scenes.length === 0) {
    return { error: "The gift has no pages.", status: 400 };
  }
  const json = JSON.stringify(story);
  if (json.length > MAX_STORY_BYTES) return { error: "This gift is too large. Try removing a few pages.", status: 413 };
  // Photos and songs must be uploaded first; the gift only stores their links.
  if (json.includes('"data:')) return { error: "Some photos didn't finish uploading. Please try again.", status: 400 };
  return { story, recipient: str(story.recipient, 80) || "you", sender: str(story.sender, 80) || "me" };
}

/** A future unlock time within a year, or null for "right away". */
export function readUnlockAt(raw: unknown, now: Date): Date | null | { error: string; status: number } {
  const asked = typeof raw === "string" ? new Date(raw) : null;
  if (!asked || Number.isNaN(asked.getTime()) || asked <= now) return null;
  if (asked.getTime() - now.getTime() > MAX_SCHEDULE_DAYS * 86_400_000) return { error: "Pick an unlock time within the next year.", status: 400 };
  return asked;
}

/**
 * The password field: undefined = leave as is, null = no password,
 * a string = set this password. Anything else is an error.
 */
export function readPassword(raw: unknown): string | null | undefined | { error: string; status: number } {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return null;
  if (typeof raw !== "string") return { error: "That password didn't make sense.", status: 400 };
  const p = raw.trim();
  if (p.length < PASSWORD_MIN) return { error: `Use at least ${PASSWORD_MIN} characters for the password.`, status: 400 };
  if (p.length > PASSWORD_MAX) return { error: `Keep the password under ${PASSWORD_MAX} characters.`, status: 400 };
  return p;
}

export const isError = (v: unknown): v is { error: string; status: number } =>
  !!v && typeof v === "object" && "error" in v && "status" in v;
