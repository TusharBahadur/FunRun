import { NextResponse } from "next/server";
import { readProof, signatureMatches } from "@/lib/razorpay";

const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

/**
 * Checks a payment Razorpay's checkout reported: the signature must match
 * HMAC-SHA256(order_id|payment_id) with our key secret. Nothing is marked paid
 * here: publishing the gift (POST /api/gifts) checks the same proof again and
 * records the payment with the gift.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "That request didn't make sense.");
  }
  const proof = readProof(body);
  if (!proof) return fail(400, "Missing payment details.");
  if (!signatureMatches(proof.orderId, proof.paymentId, proof.signature)) return fail(400, "We couldn't confirm that payment.");
  return NextResponse.json({ ok: true });
}
