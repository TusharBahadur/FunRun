// Server-only: uses node:crypto and the Supabase secret key. Never import from a "use client" file.
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

/** "scrypt$<salt>$<hash>", both base64. The password itself is never stored. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, 32);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [kind, salt, hash] = stored.split("$");
  if (kind !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password.normalize("NFKC"), Buffer.from(salt, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Name of the cookie that remembers a gift was unlocked on this device. */
export const unlockCookie = (slug: string) => `tt_gift_${slug.replace(/[^a-z0-9-]/g, "")}`;

/**
 * The cookie's value: a signature tied to this gift and its current password,
 * so changing the password locks everyone out again.
 */
export function unlockToken(slug: string, passwordHash: string) {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Supabase isn't configured.");
  return createHmac("sha256", key).update(`gift-unlock:${slug}:${passwordHash}`).digest("base64url");
}

export function tokenMatches(token: string | undefined, slug: string, passwordHash: string) {
  if (!token) return false;
  const expected = Buffer.from(unlockToken(slug, passwordHash));
  const actual = Buffer.from(token);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
