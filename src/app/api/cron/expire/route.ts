import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase/admin";

/**
 * Daily (run by Vercel Cron, see vercel.json). Gifts never expire; this clears
 * drafts nobody has touched for 60 days, and the query also keeps a free
 * Supabase project from pausing.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cutoff = new Date(Date.now() - 60 * 86_400_000).toISOString();
  const { error } = await getAdmin().from("drafts").delete().lt("updated_at", cutoff);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
