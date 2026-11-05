import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay, server side only (the key secret must never reach the browser).
 * Talks to the REST API directly: three calls don't need the SDK.
 * Payments are on once RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set;
 * without them, gifts publish free as before.
 */

const API = "https://api.razorpay.com/v1";

export function paymentsEnabled() {
  return !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;
}

function auth() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new RazorpayError(500, "Payments aren't set up.");
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export class RazorpayError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  notes: Record<string, string>;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { authorization: auth(), "content-type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { description?: string } };
  if (!res.ok) {
    console.error("[razorpay]", path, res.status, json.error?.description);
    // 401 from Razorpay means our keys are wrong, not the customer's fault.
    throw new RazorpayError(500, res.status === 401 ? "Payments aren't set up correctly." : "Couldn't reach the payment service. Please try again.");
  }
  return json;
}

/** A new order. `amount` in paise (Razorpay's minimum is 100). */
export function createOrder(input: { amount: number; currency?: string; receipt: string; notes?: Record<string, string> }) {
  if (!Number.isInteger(input.amount) || input.amount < 100) throw new RazorpayError(400, "Amount must be at least ₹1.");
  return call<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({ amount: input.amount, currency: input.currency ?? "INR", receipt: input.receipt.slice(0, 40), notes: input.notes }),
  });
}

export function fetchOrder(orderId: string) {
  return call<RazorpayOrder>(`/orders/${encodeURIComponent(orderId)}`);
}

/** Razorpay signs order_id|payment_id with the key secret; a match proves the payment is real. */
export function signatureMatches(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type PaymentProof = { orderId: string; paymentId: string; signature: string };

/** Reads { razorpay_order_id, razorpay_payment_id, razorpay_signature } (or the short names). */
export function readProof(body: unknown): PaymentProof | null {
  const b = (body ?? {}) as Record<string, unknown>;
  const pick = (...keys: string[]) => {
    for (const k of keys) if (typeof b[k] === "string" && (b[k] as string).length <= 200) return b[k] as string;
    return "";
  };
  const orderId = pick("razorpay_order_id", "orderId");
  const paymentId = pick("razorpay_payment_id", "paymentId");
  const signature = pick("razorpay_signature", "signature");
  return orderId && paymentId && signature ? { orderId, paymentId, signature } : null;
}
