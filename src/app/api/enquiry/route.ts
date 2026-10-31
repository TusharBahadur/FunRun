import { NextResponse } from "next/server";

/**
 * Footer enquiry: emails the message to us through Resend (https://resend.com).
 * Needs RESEND_API_KEY in Vercel. Without it this answers 503 and the form
 * falls back to opening the visitor's email app with their message filled in.
 *
 * ENQUIRY_TO and ENQUIRY_FROM are optional. Until tynitales.com is verified in
 * Resend, the only allowed sender is Resend's test address, and it can only mail
 * the Resend account's own email, so that is the default inbox. Once the domain
 * is verified, set ENQUIRY_TO=support.tynitales@gmail.com and
 * ENQUIRY_FROM="TyniTales <hello@tynitales.com>".
 */
const RESEND_ACCOUNT_EMAIL = "tusharbahadur001@gmail.com";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: unknown; message?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Honeypot: real people never see or fill this field.
  if (typeof body.company === "string" && body.company) return NextResponse.json({ ok: true });

  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 3000) : "";
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Please check your email address." }, { status: 400 });
  if (message.length < 2) return NextResponse.json({ error: "Write us a line or two." }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: "not-configured" }, { status: 503 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM || "TyniTales <onboarding@resend.dev>",
      to: [process.env.ENQUIRY_TO || RESEND_ACCOUNT_EMAIL],
      reply_to: email,
      subject: `TyniTales enquiry from ${email}`,
      text: `${message}\n\n— ${email}`,
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "not-sent" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
