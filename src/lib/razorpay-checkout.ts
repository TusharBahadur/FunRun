"use client";

/**
 * Razorpay Standard Checkout in the browser: create an order on our server,
 * open Razorpay's payment sheet, and hand back its proof of payment. Only the
 * key id is used here; the secret stays on the server.
 */

export type PaymentProof = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

/** They closed the payment sheet without paying. */
export class PaymentCancelled extends Error {
  constructor() {
    super("Payment cancelled. Your gift is still here; pay whenever you’re ready.");
  }
}

/** Payments are on when the site has a Razorpay key id. */
export const paymentsOn = () => !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

type RazorpayInstance = { open: () => void; on: (event: "payment.failed", cb: (r: { error?: { description?: string } }) => void) => void };
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance;

let loading: Promise<RazorpayCtor> | null = null;

function loadCheckout(): Promise<RazorpayCtor> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Razorpay didn't load.")));
      s.onerror = () => {
        loading = null;
        s.remove();
        reject(new Error("Couldn't load the payment page. Check your connection and try again."));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

/** Warm up: fetch Razorpay's script before they press Pay. */
export function preloadCheckout() {
  if (paymentsOn()) void loadCheckout().catch(() => {});
}

/**
 * Takes payment for one gift. Resolves with Razorpay's proof once paid and
 * checked; rejects with PaymentCancelled if they close the sheet, or an Error
 * with a message to show.
 */
export async function payForGift({
  templateSlug,
  token,
  description,
  email,
  name,
  color,
}: {
  templateSlug: string;
  /** Supabase access token: orders are made for the signed-in sender. */
  token: string;
  description: string;
  email?: string;
  name?: string;
  color?: string;
}): Promise<PaymentProof> {
  const [Razorpay, order] = await Promise.all([
    loadCheckout(),
    fetch("/api/payments/order", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ templateSlug }),
    }).then(async (res) => {
      const json = (await res.json().catch(() => ({}))) as { order_id?: string; amount?: number; currency?: string; key_id?: string; error?: string };
      if (!res.ok || !json.order_id) throw new Error(json.error ?? "Couldn't start the payment. Please try again.");
      return json as Required<Pick<typeof json, "order_id" | "amount" | "currency" | "key_id">>;
    }),
  ]);

  const proof = await new Promise<PaymentProof>((resolve, reject) => {
    let failure: string | null = null;
    const rzp = new Razorpay({
      key: order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: "TyniTales",
      description,
      prefill: { email, name },
      theme: { color: color ?? "#c2475a" },
      handler: (r: PaymentProof) => resolve(r),
      modal: {
        // Closed without paying (or after a failed try): tell them what happened.
        ondismiss: () => reject(failure ? new Error(failure) : new PaymentCancelled()),
        confirm_close: true,
      },
    });
    rzp.on("payment.failed", (r) => {
      // Razorpay lets them try again in the same sheet; remember why, in case they close it.
      failure = `Payment failed: ${r.error?.description ?? "please try again"}. You haven’t been charged.`;
    });
    rzp.open();
  });

  // Double-check with our server before going on.
  const res = await fetch("/api/payments/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(proof),
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? "We couldn't confirm your payment. If money left your account, write to us and we’ll sort it out.");
  }
  return proof;
}
