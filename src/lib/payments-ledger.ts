import { getAdmin } from "@/lib/supabase/admin";

/**
 * The `payments` table: every paid Razorpay order and the gift it became.
 * Written by the webhook and by publishing; read to let someone finish a gift
 * they already paid for. Server only.
 */

export async function recordPaid(p: { orderId: string; paymentId?: string; userId?: string; templateSlug?: string; amountPaise: number }) {
  const { error } = await getAdmin()
    .from("payments")
    .upsert(
      {
        order_id: p.orderId,
        payment_id: p.paymentId ?? null,
        user_id: p.userId ?? null,
        template_slug: p.templateSlug ?? null,
        amount_paise: p.amountPaise,
        status: "paid",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "order_id", ignoreDuplicates: false },
    );
  if (error) console.error("[payments] record failed", error.message);
}

export async function markRefunded(orderId: string) {
  const { error } = await getAdmin().from("payments").update({ status: "refunded", updated_at: new Date().toISOString() }).eq("order_id", orderId);
  if (error) console.error("[payments] mark refunded failed", error.message);
}

export async function markUsed(orderId: string, giftSlug: string) {
  const { error } = await getAdmin().from("payments").update({ gift_slug: giftSlug, updated_at: new Date().toISOString() }).eq("order_id", orderId);
  if (error) console.error("[payments] mark used failed", error.message);
}

/** A payment this person made for this template that never became a gift. */
export async function unusedPayment(userId: string, templateSlug: string) {
  const { data } = await getAdmin()
    .from("payments")
    .select("order_id, payment_id, amount_paise")
    .eq("user_id", userId)
    .eq("template_slug", templateSlug)
    .eq("status", "paid")
    .is("gift_slug", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { order_id: string; payment_id: string | null; amount_paise: number } | null;
}
