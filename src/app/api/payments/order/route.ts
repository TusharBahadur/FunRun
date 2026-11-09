import { NextResponse } from "next/server";
import { str } from "@/lib/gift-input";
import { unusedPayment } from "@/lib/payments-ledger";
import { createOrder, paymentsEnabled, RazorpayError } from "@/lib/razorpay";
import { userFromRequest } from "@/lib/supabase/admin";
import { getTemplateBySlug } from "@/lib/templates";

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/**
 * Starts a payment for one gift: a Razorpay order for the template's price.
 * The price comes from the template, never from the browser.
 * Body: { templateSlug }. Returns { order_id, amount, currency, key_id }, or
 * { already_paid: true } when they paid for this template before and the gift never saved.
 */
export async function POST(request: Request) {
  if (!paymentsEnabled()) return fail(503, "Payments aren't switched on.");
  const user = await userFromRequest(request);
  if (!user) return fail(401, "Please sign in again.");

  let body: { templateSlug?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return fail(400, "That request didn't make sense.");
  }
  const template = await getTemplateBySlug(str(body.templateSlug, 80));
  if (!template) return fail(400, "That template doesn't exist.");
  if (template.pricePaise < 100) return fail(400, "This gift doesn't need a payment.");

  // Already paid for this template, but the gift never saved? Use that payment, don't charge again.
  const earlier = await unusedPayment(user.id, template.slug).catch(() => null);
  if (earlier && earlier.amount_paise >= template.pricePaise) return NextResponse.json({ already_paid: true, order_id: earlier.order_id });

  try {
    const order = await createOrder({
      amount: template.pricePaise,
      currency: "INR",
      receipt: `tt_${Date.now().toString(36)}_${user.id.slice(0, 8)}`,
      // Checked again when the gift is published: same person, same template, same price.
      notes: { user_id: user.id, template_slug: template.slug },
    });
    return NextResponse.json({ order_id: order.id, amount: order.amount, currency: order.currency, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    if (e instanceof RazorpayError) return fail(e.status, e.message);
    console.error("[payments/order]", e);
    return fail(500, "Couldn't start the payment. Please try again.");
  }
}
