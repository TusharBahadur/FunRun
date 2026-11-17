/**
 * Which links a published gift may carry (server-side check on publish and edit).
 *
 * A gift's photos, stickers and songs are links the recipient's browser loads.
 * Through the studio they're always our own uploads or our own files, but the
 * API takes any JSON, so without this check someone could point a "photo" at
 * their own server and learn each recipient's IP address, or show anything.
 *
 * Rules, for the fields that hold media:
 * - our own files (no scheme: "/a/p/…", sticker ids like "m-dance-cat") are fine;
 * - photos and stickers may only link to our storage bucket;
 * - a song link may be any https address (pasting a song link is a feature);
 * - nothing may use javascript:, data:, blob:, plain http: or "//host" links.
 *
 * No imports, so it can be tested on its own (see media-urls.test.ts).
 */

/** Keys whose values are loaded as media by the gift. */
const MEDIA_KEYS = new Set(["src", "photo", "file", "link", "caller", "party", "stamp", "reaction", "id"]);
const SONG_KEYS = new Set(["link"]);
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export type MediaProblem = { key: string; value: string };

/** The first media link that isn't allowed, or null when every one is fine. */
export function findBadMediaUrl(value: unknown, storagePrefix: string | null, key = ""): MediaProblem | null {
  if (typeof value === "string") {
    if (key === "youtubeId") return /^[A-Za-z0-9_-]{11}$/.test(value) ? null : { key, value };
    if (!MEDIA_KEYS.has(key)) return null;
    return mediaValueOk(key, value, storagePrefix) ? null : { key, value };
  }
  if (Array.isArray(value)) {
    for (const v of value) {
      // Arrays of stickers are objects ({ id, at }); arrays of strings keep the parent key.
      const bad = findBadMediaUrl(v, storagePrefix, key);
      if (bad) return bad;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const bad = findBadMediaUrl(v, storagePrefix, k);
      if (bad) return bad;
    }
  }
  return null;
}

function mediaValueOk(key: string, raw: string, storagePrefix: string | null) {
  const v = raw.trim();
  if (v.startsWith("//") || v.startsWith("\\")) return false;
  if (!SCHEME.test(v)) return true; // our own path or a sticker id
  if (!/^https:\/\//i.test(v)) return false; // http:, javascript:, data:, blob:, …
  if (storagePrefix && v.startsWith(storagePrefix)) return true;
  return SONG_KEYS.has(key);
}

/** Our public storage bucket, e.g. "https://<project>.supabase.co/storage/v1/object/public/gift-media/". */
export function storagePrefixFrom(supabaseUrl: string | undefined) {
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/gift-media/`;
}
