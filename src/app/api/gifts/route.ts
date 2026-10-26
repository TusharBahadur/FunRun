import { NextResponse } from "next/server";
import { giftPricing } from "@/config/site";
import { expiryFor, GIFT_SCHEMA_VERSION, giftSlug } from "@/lib/gift-links";
import { getAdmin, userFromRequest } from "@/lib/supabase/admin";
import { getTemplateBySlug } from "@/lib/templates";

/** Gifts a sender can publish per day: generous for real use, stops runaway scripts. */
const DAILY_LIMIT = 20;
/** Text-only gift size once photos are uploaded. Real gifts are well under 100 KB. */
const MAX_STORY_BYTES = 512 * 1024;
/** How far ahead a gift can be scheduled to unlock. */
const MAX_SCHEDULE_DAYS = 366;

type Body = {
  templateSlug?: unknown;
  name?: unknown;
  link?: unknown;
  unlockAt?: unknown;
  mediaFolder?: unknown;
  schemaVersion?: unknown;
  story?: unknown;
};

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Publishes a gift: saves it and returns its share link. Gifts can't be edited afterwards. */
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

  const story = body.story as { recipient?: unknown; sender?: unknown; palette?: unknown; scenes?: unknown } | null;
  if (!story || typeof story !== "object" || !Array.isArray(story.scenes) || story.scenes.length === 0) {
    return fail(400, "The gift has no pages.");
  }
  const storyJson = JSON.stringify(story);
  if (storyJson.length > MAX_STORY_BYTES) return fail(413, "This gift is too large. Try removing a few pages.");
  // Photos and songs must be uploaded first; the gift only stores their links.
  if (storyJson.includes('"data:')) return fail(400, "Some photos didn't finish uploading. Please try again.");

  const recipient = str(story.recipient, 80) || "you";
  const sender = str(story.sender, 80) || "me";
  const name = str(body.name, 120) || `${template.name} for ${recipient}`;

  const mediaFolder = str(body.mediaFolder, 120);
  if (mediaFolder && !new RegExp(`^${user.id}/[0-9a-f-]{36}$`).test(mediaFolder)) return fail(400, "Bad upload folder.");

  const now = new Date();
  let unlockAt = now;
  const asked = typeof body.unlockAt === "string" ? new Date(body.unlockAt) : null;
  if (asked && !Number.isNaN(asked.getTime()) && asked > now) {
    if (asked.getTime() - now.getTime() > MAX_SCHEDULE_DAYS * 86_400_000) return fail(400, "Pick an unlock time within the next year.");
    unlockAt = asked;
  }
  const expiresAt = expiryFor(unlockAt);

  const db = getAdmin();

  const since = new Date(now.getTime() - 86_400_000).toISOString();
  const { count } = await db.from("gifts").select("id", { count: "exact", head: true }).eq("owner_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) return fail(429, "You've made a lot of gifts today. Try again tomorrow.");

  const linkName = str(body.link, 40) || recipient;

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
      expires_at: expiresAt.toISOString(),
    });
    if (!error) {
      return NextResponse.json({ slug, unlockAt: unlockAt.toISOString(), expiresAt: expiresAt.toISOString() }, { status: 201 });
    }
    if (error.code !== "23505") {
      console.error("[gifts] insert failed", error);
      return fail(500, "Couldn't save the gift. Please try again.");
    }
  }
  return fail(500, "Couldn't make a link. Please try again.");
}
