import { NextResponse } from "next/server";
import { recordPaid } from "@/lib/payments-ledger";
import { webhookSignatureMatches } from "@/lib/razorpay";

type OrderPaid = {
  event?: string;
  payload?: {
    order?: { entity?: { id?: string; amount?: number; amount_paid?: number; notes?: Record<string, string> } };
    payment?: { entity?: { id?: string; order_id?: string; amount?: number; notes?: Record<string, string> } };
  };
};

/**
 * Razorpay tells us directly when an order is paid, so a payment is never lost
 * if the buyer's tab closes before their gift saves. Set up in Razorpay →
 * Account & Settings → Webhooks: this URL, the "order.paid" event, and the
 * secret in RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!webhookSignatureMatches(raw, request.headers.get("x-razorpay-signature") ?? "")) {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }
  let body: OrderPaid;
  try {
    body = JSON.parse(raw) as OrderPaid;
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }

  if (body.event === "order.paid" || body.event === "payment.captured") {
    const order = body.payload?.order?.entity;
    const payment = body.payload?.payment?.entity;
    const orderId = order?.id ?? payment?.order_id;
    const notes = order?.notes ?? payment?.notes ?? {};
    if (orderId) {
      await recordPaid({
        orderId,
        paymentId: payment?.id,
        userId: notes.user_id,
        templateSlug: notes.template_slug,
        amountPaise: order?.amount_paid ?? order?.amount ?? payment?.amount ?? 0,
      });
    }
  }
  // Anything else: acknowledged and ignored, so Razorpay doesn't keep retrying.
  return NextResponse.json({ ok: true });
}
