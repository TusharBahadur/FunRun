// Regression tests: gift passwords are hashed, and unlock cookies are tied to the password.
import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, tokenMatches, unlockToken, verifyPassword } from "../src/lib/gift-secrets.ts";

process.env.SUPABASE_SECRET_KEY = "test_key";

test("passwords are never stored as typed", async () => {
  const stored = await hashPassword("our-song");
  assert.ok(stored.startsWith("scrypt$"));
  assert.ok(!stored.includes("our-song"));
  assert.equal(await verifyPassword("our-song", stored), true);
  assert.equal(await verifyPassword("our-son", stored), false);
});

test("an unlock cookie stops working when the password changes", async () => {
  const first = await hashPassword("one");
  const second = await hashPassword("two");
  const token = unlockToken("maya-abc123", first);
  assert.equal(tokenMatches(token, "maya-abc123", first), true);
  assert.equal(tokenMatches(token, "maya-abc123", second), false);
  assert.equal(tokenMatches(token, "other-gift", first), false);
  assert.equal(tokenMatches(undefined, "maya-abc123", first), false);
});
