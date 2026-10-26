import { NextResponse } from "next/server";
import { getAdmin, MEDIA_BUCKET, userFromRequest } from "@/lib/supabase/admin";

/**
 * Deletes the signed-in account: every photo and song they uploaded, then the
 * account itself (their profile and gifts go with it). Their links stop working.
 */
export async function POST(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const db = getAdmin();
  const storage = db.storage.from(MEDIA_BUCKET);

  // Uploads live in "<user id>/<upload id>/<file>".
  const { data: folders, error: listError } = await storage.list(user.id, { limit: 1000 });
  if (listError) return NextResponse.json({ error: "Couldn't delete your photos. Please try again." }, { status: 500 });
  for (const folder of folders ?? []) {
    const prefix = `${user.id}/${folder.name}`;
    const { data: list } = await storage.list(prefix, { limit: 1000 });
    const paths = (list ?? []).map((f) => `${prefix}/${f.name}`);
    if (paths.length) {
      const { error } = await storage.remove(paths);
      if (error) return NextResponse.json({ error: "Couldn't delete your photos. Please try again." }, { status: 500 });
    }
  }

  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: "Couldn't delete your account. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
