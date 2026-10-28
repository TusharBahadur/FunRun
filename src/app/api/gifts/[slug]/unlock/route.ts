import { NextResponse } from "next/server";
import { tokenMatches, unlockCookie, unlockToken, verifyPassword } from "@/lib/gift-secrets";
import { getAdmin } from "@/lib/supabase/admin";

/**
 * Checks a gift's password. When it's right, a cookie remembers it on this
 * device (for a year), so they don't have to type it every time.
 */
export async function POST(request: Request, { params }: RouteContext<"/api/gifts/[slug]/unlock">) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,48}$/.test(slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password.trim().slice(0, 200) : "";
  } catch {
    /* empty password below */
  }

  const { data: gift } = await getAdmin().from("gifts").select("password_hash").eq("slug", slug).maybeSingle();
  if (!gift) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!gift.password_hash) return NextResponse.json({ ok: true });

  // Already unlocked on this device.
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${unlockCookie(slug)}=([^;]+)`))?.[1];
  if (tokenMatches(cookie, slug, gift.password_hash)) return NextResponse.json({ ok: true });

  const ok = password.length > 0 && (await verifyPassword(password, gift.password_hash));
  if (!ok) {
    // A short pause makes guessing slow without bothering real people.
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "That's not the password. Try again?" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(unlockCookie(slug), unlockToken(slug, gift.password_hash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/for/${slug}`,
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
