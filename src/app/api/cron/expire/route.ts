import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getAdmin, MEDIA_BUCKET } from "@/lib/supabase/admin";

/**
 * Daily clean-up (run by Vercel Cron, see vercel.json): for every gift whose
 * link has closed, delete its photos and songs and clear its content. The
 * row stays so the link shows "wrapped up" and its code is never reused.
 * The gift page already refuses expired gifts, so this is about storage.
 * Running daily also keeps a free Supabase project from pausing.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdmin();
  const { data: gifts, error } = await db
    .from("gifts")
    .select("id, slug, media_folder")
    .eq("status", "live")
    .lte("expires_at", new Date().toISOString())
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let cleared = 0;
  let files = 0;
  for (const gift of gifts ?? []) {
    if (gift.media_folder) {
      const { data: list } = await db.storage.from(MEDIA_BUCKET).list(gift.media_folder, { limit: 1000 });
      const paths = (list ?? []).map((f) => `${gift.media_folder}/${f.name}`);
      if (paths.length) {
        const { error: rmError } = await db.storage.from(MEDIA_BUCKET).remove(paths);
        if (rmError) continue; // try again tomorrow rather than losing track of the files
        files += paths.length;
      }
    }
    const { error: upError } = await db.from("gifts").update({ status: "expired", story: null }).eq("id", gift.id);
    if (!upError) {
      revalidateTag(`gift:${gift.slug}`, "max");
      cleared++;
    }
  }

  return NextResponse.json({ cleared, files, more: (gifts?.length ?? 0) === 200 });
}
