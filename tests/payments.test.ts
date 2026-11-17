// Regression tests: payment and webhook signatures must match exactly.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { readProof, signatureMatches, webhookSignatureMatches } from "../src/lib/razorpay.ts";

process.env.RAZORPAY_KEY_SECRET = "test_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "hook_secret";
const sign = (data: string, key: string) => createHmac("sha256", key).update(data).digest("hex");

test("a real payment signature matches", () => {
  assert.equal(signatureMatches("order_1", "pay_1", sign("order_1|pay_1", "test_secret")), true);
});

test("a forged or swapped signature doesn't", () => {
  assert.equal(signatureMatches("order_1", "pay_1", sign("order_1|pay_2", "test_secret")), false);
  assert.equal(signatureMatches("order_1", "pay_1", sign("order_1|pay_1", "wrong_secret")), false);
  assert.equal(signatureMatches("order_1", "pay_1", ""), false);
  assert.equal(signatureMatches("order_1", "pay_1", "short"), false);
});

test("webhooks need the webhook secret over the exact body", () => {
  const body = '{"event":"order.paid"}';
  assert.equal(webhookSignatureMatches(body, sign(body, "hook_secret")), true);
  assert.equal(webhookSignatureMatches(body + " ", sign(body, "hook_secret")), false);
  assert.equal(webhookSignatureMatches(body, sign(body, "test_secret")), false);
  assert.equal(webhookSignatureMatches(body, ""), false);
});

test("payment proofs need all three parts", () => {
  assert.equal(readProof({ razorpay_order_id: "o", razorpay_payment_id: "p" }), null);
  assert.deepEqual(readProof({ razorpay_order_id: "o", razorpay_payment_id: "p", razorpay_signature: "s" }), { orderId: "o", paymentId: "p", signature: "s" });
  assert.equal(readProof({ razorpay_order_id: "o".repeat(500), razorpay_payment_id: "p", razorpay_signature: "s" }), null);
});
