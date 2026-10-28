import { NextResponse } from "next/server";
import { giftPricing } from "@/config/site";
import { editableUntil, GIFT_SCHEMA_VERSION, giftSlug } from "@/lib/gift-links";
import { isError, readPassword, readStory, readUnlockAt, str } from "@/lib/gift-input";
import { hashPassword } from "@/lib/gift-secrets";
import { getAdmin, userFromRequest } from "@/lib/supabase/admin";
import { getTemplateBySlug } from "@/lib/templates";

/** Gifts a sender can publish per day: generous for real use, stops runaway scripts. */
const DAILY_LIMIT = 20;

type Body = {
  templateSlug?: unknown;
  name?: unknown;
  link?: unknown;
  unlockAt?: unknown;
  mediaFolder?: unknown;
  schemaVersion?: unknown;
  password?: unknown;
  story?: unknown;
};

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/**
 * Publishes a gift: saves it and returns its share link. The link never
 * expires; the sender can still change the gift for a few days (see PATCH /api/gifts/[slug]).
 */
export async function POST(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return fail(401, "Please sign in again.");

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail(400, "That request didn't make sense.");
  }

  const template = await getTemplateBySlug(str(body.templateSlug, 80));
  if (!template) return fail(400, "That template doesn't exist.");

  const read = readStory(body.story);
  if ("error" in read) return fail(read.status, read.error);
  const { story, recipient, sender } = read;
  const name = str(body.name, 120) || `${template.name} for ${recipient}`;

  const mediaFolder = str(body.mediaFolder, 120);
  if (mediaFolder && !new RegExp(`^${user.id}/[0-9a-f-]{36}$`).test(mediaFolder)) return fail(400, "Bad upload folder.");

  const now = new Date();
  const asked = readUnlockAt(body.unlockAt, now);
  if (isError(asked)) return fail(asked.status, asked.error);
  const unlockAt = asked ?? now;

  const password = readPassword(body.password);
  if (isError(password)) return fail(password.status, password.error);

  const db = getAdmin();

  const since = new Date(now.getTime() - 86_400_000).toISOString();
  const { count } = await db.from("gifts").select("id", { count: "exact", head: true }).eq("owner_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) return fail(429, "You've made a lot of gifts today. Try again tomorrow.");

  const linkName = str(body.link, 40) || recipient;
  const editUntil = editableUntil(now);
  const passwordHash = password ? await hashPassword(password) : null;

  // The random code makes clashes vanishingly rare; retry just in case.
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = giftSlug(linkName);
    const { error } = await db.from("gifts").insert({
      owner_id: user.id,
      slug,
      template_slug: template.slug,
      name,
      recipient,
      sender,
      story,
      palette: story.palette ?? {},
      media_folder: mediaFolder || null,
      schema_version: Number.isInteger(body.schemaVersion) ? Math.min(Math.max(body.schemaVersion as number, 1), GIFT_SCHEMA_VERSION) : GIFT_SCHEMA_VERSION,
      price_paise: giftPricing.pricePaise,
      paid: false,
      unlock_at: unlockAt.toISOString(),
      edit_until: editUntil.toISOString(),
      password_hash: passwordHash,
    });
    if (!error) {
      return NextResponse.json(
        { slug, unlockAt: unlockAt.toISOString(), editUntil: editUntil.toISOString(), hasPassword: !!passwordHash },
        { status: 201 },
      );
    }
    if (error.code !== "23505") {
      console.error("[gifts] insert failed", error);
      return fail(500, "Couldn't save the gift. Please try again.");
    }
  }
  return fail(500, "Couldn't make a link. Please try again.");
}
