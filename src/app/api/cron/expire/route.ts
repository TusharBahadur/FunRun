import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase/admin";

/**
 * Daily keep-alive (run by Vercel Cron, see vercel.json). Gifts never expire
 * any more, so nothing is cleaned up; one tiny query a day just keeps a free
 * Supabase project from pausing.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { error } = await getAdmin().from("gifts").select("id", { head: true, count: "exact" }).limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
