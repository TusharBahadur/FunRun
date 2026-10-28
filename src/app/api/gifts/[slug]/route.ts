import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isError, readPassword, readStory, readUnlockAt, str } from "@/lib/gift-input";
import { hashPassword } from "@/lib/gift-secrets";
import { getAdmin, userFromRequest } from "@/lib/supabase/admin";

type Body = { name?: unknown; unlockAt?: unknown; password?: unknown; story?: unknown };

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/**
 * Saves changes to a live gift. Only its sender can, and only until its
 * edit window closes (7 days after it went live). The link stays the same.
 */
export async function PATCH(request: Request, { params }: RouteContext<"/api/gifts/[slug]">) {
  const { slug } = await params;
  const user = await userFromRequest(request);
  if (!user) return fail(401, "Please sign in again.");

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail(400, "That request didn't make sense.");
  }

  const db = getAdmin();
  const { data: gift, error: loadError } = await db
    .from("gifts")
    .select("id, owner_id, status, unlock_at, edit_until, password_hash")
    .eq("slug", slug)
    .maybeSingle();
  if (loadError) return fail(500, "Couldn't load the gift. Please try again.");
  if (!gift || gift.owner_id !== user.id) return fail(404, "We couldn't find that gift in your account.");
  if (gift.status !== "live") return fail(409, "This gift can't be changed any more.");

  const now = new Date();
  if (!gift.edit_until || new Date(gift.edit_until) <= now) {
    return fail(403, "The 7 days for changes are over, so this gift is locked now.");
  }

  const update: Record<string, unknown> = { updated_at: now.toISOString() };

  if (body.story !== undefined) {
    const read = readStory(body.story);
    if ("error" in read) return fail(read.status, read.error);
    update.story = read.story;
    update.recipient = read.recipient;
    update.sender = read.sender;
    update.palette = read.story.palette ?? {};
  }
  const name = str(body.name, 120);
  if (name) update.name = name;

  // The opening time can move only while the gift hasn't opened yet.
  if (body.unlockAt !== undefined && new Date(gift.unlock_at) > now) {
    const asked = readUnlockAt(body.unlockAt, now);
    if (isError(asked)) return fail(asked.status, asked.error);
    update.unlock_at = (asked ?? now).toISOString();
  }

  const password = readPassword(body.password);
  if (isError(password)) return fail(password.status, password.error);
  if (password !== undefined) update.password_hash = password ? await hashPassword(password) : null;

  const { error } = await db.from("gifts").update(update).eq("id", gift.id);
  if (error) {
    console.error("[gifts] update failed", error);
    return fail(500, "Couldn't save your changes. Please try again.");
  }
  revalidateTag(`gift:${slug}`, "max");

  const hasPassword = password === undefined ? !!gift.password_hash : !!password;
  return NextResponse.json({
    slug,
    unlockAt: (update.unlock_at as string | undefined) ?? gift.unlock_at,
    editUntil: gift.edit_until,
    hasPassword,
  });
}
