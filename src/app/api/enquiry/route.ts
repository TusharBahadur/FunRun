import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

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

  // A short "we got your note" back to the visitor. Only once our own domain is
  // the sender (ENQUIRY_FROM set): Resend's test sender can't mail strangers.
  // It deliberately doesn't repeat their message, so the form can't be used to
  // send someone else arbitrary text from our address.
  const from = process.env.ENQUIRY_FROM;
  if (from) {
    const replyTo = process.env.ENQUIRY_TO || siteConfig.contact.email;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        reply_to: replyTo,
        subject: "We got your note 💌",
        text: confirmationText(replyTo),
        html: confirmationHtml(replyTo),
      }),
    }).catch(() => {
      // Their note already reached us; a missing confirmation isn't worth an error.
    });
  }

  return NextResponse.json({ ok: true });
}

function confirmationText(replyTo: string) {
  return [
    "Hi!",
    "",
    "Thanks for writing to TyniTales. Your note reached us, and a real person reads every one.",
    "We usually reply within a day. If you think of anything else, just reply to this email.",
    "",
    `— Team TyniTales`,
    `${siteConfig.url} · ${replyTo}`,
  ].join("\n");
}

function confirmationHtml(replyTo: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5efe6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5efe6;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fbf8f3;border-radius:20px;border:1px solid rgba(27,18,21,0.08);">
<tr><td style="padding:32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1b1215;">
<p style="margin:0 0 20px;font-size:22px;font-weight:700;letter-spacing:-0.02em;">TyniTales<span style="color:#e23b54;">.</span></p>
<p style="margin:0 0 6px;font-size:26px;line-height:1.2;font-weight:700;letter-spacing:-0.02em;">We got your note <span style="color:#e23b54;">♥</span></p>
<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#5c4f54;">Thanks for writing to us. Your message reached us, and a real person reads every one.</p>
<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#5c4f54;">We usually reply within a day. Thought of something else? Just reply to this email.</p>
<p style="margin:28px 0 0;"><a href="${siteConfig.url}/templates" style="display:inline-block;background:#bf2840;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px;">Browse gifts while you wait</a></p>
<p style="margin:28px 0 0;font-size:13px;line-height:1.5;color:#5c4f54;">— Team TyniTales<br><a href="mailto:${replyTo}" style="color:#bf2840;text-decoration:none;">${replyTo}</a></p>
</td></tr></table>
</td></tr></table>
</body></html>`;
}
