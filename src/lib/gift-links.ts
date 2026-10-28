import { giftPricing } from "@/config/site";

/**
 * Saved with every published gift. Bump it when a change to the scene
 * components would make older gifts render differently, and keep the old
 * behaviour for gifts with a lower version.
 */
export const GIFT_SCHEMA_VERSION = 1;

/** "Maya Sharma!" → "maya-sharma". Empty when nothing usable is left (e.g. non-Latin names). */
export function slugifyName(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
    .replace(/-+$/g, "");
}

// No 0/o, 1/l/i: easy to read out loud or type from a screenshot.
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** 6 random characters: ~887 million combinations, so links can't be guessed. */
export function randomCode(length = 6) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** The link path for a gift: "maya-k3x9p2", or "for-you-k3x9p2" when there's no usable name. */
export function giftSlug(name: string) {
  return `${slugifyName(name) || "for-you"}-${randomCode()}`;
}

/** Until when a gift published at `from` can still be changed. */
export function editableUntil(from: Date = new Date()) {
  return new Date(from.getTime() + giftPricing.editDays * 24 * 60 * 60 * 1000);
}

/** Gift passwords: long enough to mean something, short enough to read out. */
export const PASSWORD_MIN = 4;
export const PASSWORD_MAX = 64;

/** True while a moment (like the end of the edit window) is still ahead. */
export function isFuture(iso: string | null | undefined) {
  return !!iso && new Date(iso).getTime() > Date.now();
}

/** "23 Dec 2026" in Indian English. */
export function formatDay(iso: string | Date) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function giftPath(slug: string) {
  return `/for/${slug}`;
}
