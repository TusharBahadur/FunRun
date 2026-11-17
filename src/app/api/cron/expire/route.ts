import { NextResponse } from "next/server";
import { getAdmin, MEDIA_BUCKET } from "@/lib/supabase/admin";

/**
 * Daily (run by Vercel Cron, see vercel.json). Gifts never expire; this clears
 * drafts nobody has touched for 60 days, the photos only those drafts used,
 * and rate-limit records older than a day. It also keeps a free Supabase
 * project from pausing.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cutoff = new Date(Date.now() - 60 * 86_400_000).toISOString();
  const db = getAdmin();
  const { error } = await db.from("drafts").delete().lt("updated_at", cutoff);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Rate-limit records only matter for a day.
  await db.from("rate_events").delete().lt("at", new Date(Date.now() - 86_400_000).toISOString());

  // Photos from drafts that are gone and never became a gift.
  const { data: stale } = await db.rpc("stale_draft_media");
  const paths = ((stale as string[] | null) ?? []).filter((p) => typeof p === "string" && p.includes("/drafts/"));
  let removed = 0;
  if (paths.length) {
    const { error: removeError } = await db.storage.from(MEDIA_BUCKET).remove(paths);
    if (!removeError) removed = paths.length;
  }
  return NextResponse.json({ ok: true, removedDraftPhotos: removed });
}
