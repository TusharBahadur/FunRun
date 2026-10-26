"use client";

import { pinSticker } from "@/components/story/stickers";
import type { Story } from "@/components/story/types";
import { GIFT_SCHEMA_VERSION } from "@/lib/gift-links";
import { accessToken, getSupabase } from "@/lib/supabase/browser";

const MEDIA_BUCKET = "gift-media";

/** Browsers name a few types loosely; the storage bucket only accepts the standard names. */
const NORMALIZE: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "audio/mp3": "audio/mpeg",
  "audio/m4a": "audio/mp4",
  "audio/x-flac": "audio/flac",
};

const EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
  "audio/flac": "flac",
  "audio/opus": "opus",
};

export class NeedsSignIn extends Error {
  constructor() {
    super("Please sign in to make your gift live.");
  }
}

export type Published = { slug: string; unlockAt: string; expiresAt: string };

/**
 * Makes a gift live: uploads its photos and songs (which live inside the draft
 * as data URLs), swaps in their web links, then saves the gift and gets its link.
 */
export async function publishGift({
  templateSlug,
  name,
  story,
  link,
  unlockAt,
  onProgress,
}: {
  templateSlug: string;
  name: string;
  story: Story;
  link: string;
  unlockAt?: string;
  onProgress?: (done: number, total: number) => void;
}): Promise<Published> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) throw new NeedsSignIn();

  // Hidden pages never show, so don't upload their photos. Board stickers are
  // pinned to today's exact image, so later sticker edits never change this gift.
  const finalStory: Story = mapStrings({ ...story, scenes: story.scenes.filter((s) => !s.hidden) }, pinSticker);

  const inline = new Set<string>();
  collectDataUrls(finalStory, inline);
  const files = [...inline];
  const folder = `${userId}/${crypto.randomUUID()}`;
  const links = new Map<string, string>();

  onProgress?.(0, files.length);
  let done = 0;
  // A few at a time: quick on good connections, gentle on patchy mobile data.
  await runLimited(files, 3, async (dataUrl, i) => {
    const { blob, type } = dataUrlToBlob(dataUrl);
    const ext = EXTENSION[type];
    if (!ext) throw new Error("One of your files is a type we can't publish. Try a JPG photo or an MP3 song.");
    const path = `${folder}/${String(i + 1).padStart(2, "0")}.${ext}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: type, upsert: false, cacheControl: "31536000" });
    if (error) throw new Error(/size|exceed/i.test(error.message) ? "One file is over 5 MB. Try a smaller photo or song." : "A photo didn't upload. Check your connection and try again.");
    links.set(dataUrl, supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
    onProgress?.(++done, files.length);
  });

  const token = await accessToken();
  if (!token) throw new NeedsSignIn();

  const res = await fetch("/api/gifts", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      templateSlug,
      name,
      link,
      unlockAt,
      mediaFolder: files.length ? folder : undefined,
      schemaVersion: GIFT_SCHEMA_VERSION,
      story: mapStrings(finalStory, (v) => links.get(v) ?? v),
    }),
  });
  const json = (await res.json().catch(() => ({}))) as Partial<Published> & { error?: string };
  if (res.status === 401) throw new NeedsSignIn();
  if (!res.ok || !json.slug) throw new Error(json.error ?? "Couldn't make the gift live. Please try again.");
  return json as Published;
}

function collectDataUrls(value: unknown, out: Set<string>) {
  if (typeof value === "string") {
    if (value.startsWith("data:")) out.add(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectDataUrls(v, out);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectDataUrls(v, out);
  }
}

function mapStrings<T>(value: T, fn: (s: string) => string): T {
  if (typeof value === "string") return fn(value) as T;
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v, fn)])) as T;
  }
  return value;
}

function dataUrlToBlob(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  const meta = dataUrl.slice(5, comma); // after "data:"
  const raw = meta.split(";")[0].toLowerCase();
  const type = NORMALIZE[raw] ?? raw;
  const payload = dataUrl.slice(comma + 1);
  let bytes: Uint8Array;
  if (/;base64$/i.test(meta)) {
    const bin = atob(payload);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } else {
    bytes = new TextEncoder().encode(decodeURIComponent(payload));
  }
  return { blob: new Blob([bytes as BlobPart], { type }), type };
}

async function runLimited<T>(items: T[], limit: number, work: (item: T, index: number) => Promise<void>) {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      await work(items[i], i);
    }
  });
  await Promise.all(workers);
}
