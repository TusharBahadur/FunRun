import { NextResponse } from "next/server";
import { allow } from "@/lib/rate-limit";
import { getAdmin, userFromRequest } from "@/lib/supabase/admin";

/**
 * "Download my data": everything we hold about the signed-in person, as one
 * JSON file. Built on request and sent straight back (never stored or linked
 * publicly). Only the caller's own rows are read. Password hashes for gift
 * locks are left out on purpose: they're security data, not personal data.
 */
export async function GET(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!(await allow("export", user.id, 60 * 60, 10))) {
    return NextResponse.json({ error: "You've downloaded your data a lot just now. Please try again in an hour." }, { status: 429 });
  }

  const db = getAdmin();
  const [profile, gifts, drafts, payments] = await Promise.all([
    db.from("profiles").select("display_name, avatar_url, sign_off, created_at, updated_at").eq("id", user.id).maybeSingle(),
    db
      .from("gifts")
      .select(
        "slug, template_slug, name, recipient, sender, story, status, price_paise, paid, unlock_at, edit_until, has_password, created_at, updated_at, open_count, first_opened_at, last_opened_at",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true }),
    db.from("drafts").select("id, template_slug, name, recipient, data, updated_at").eq("user_id", user.id),
    db.from("payments").select("order_id, payment_id, amount_paise, status, gift_slug, created_at").eq("user_id", user.id),
  ]);
  if (profile.error || gifts.error) return NextResponse.json({ error: "Couldn't gather your data. Please try again." }, { status: 500 });

  // Logged without any of the data itself, so requests can be traced.
  console.info("[privacy] data export", user.id);

  const body = {
    exported_at: new Date().toISOString(),
    about:
      "Everything TyniTales holds about your account. Photos and songs are listed as links inside each gift. See https://tynitales.com/privacy.",
    account: {
      id: user.id,
      email: user.email,
      sign_in_methods: user.app_metadata?.providers ?? [user.app_metadata?.provider].filter(Boolean),
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    },
    profile: profile.data,
    gifts: gifts.data ?? [],
    drafts_saved_to_account: drafts.data ?? [],
    payments: payments.data ?? [],
    not_included: [
      "Drafts saved only on your device: they're in that browser, not with us.",
      "Card, UPI and bank details: we never receive them. Razorpay holds your payment records.",
      "Your Google account details beyond your name, email and picture: Google holds them.",
      "Short-lived security logs (for example, request logs kept by our hosting provider).",
    ],
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="tynitales-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}
