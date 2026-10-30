import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

/**
 * Footer enquiry: emails the message to us through Resend (https://resend.com).
 * Needs RESEND_API_KEY in Vercel. Without it this answers 503 and the form
 * falls back to opening the visitor's email app with their message filled in.
 *
 * ENQUIRY_TO (default: the contact email) and ENQUIRY_FROM (default: Resend's
 * test sender, which can only mail the Resend account's own address) are optional.
 */
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
      to: [process.env.ENQUIRY_TO || siteConfig.contact.email],
      reply_to: email,
      subject: `TyniTales enquiry from ${email}`,
      text: `${message}\n\n— ${email}`,
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "not-sent" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
