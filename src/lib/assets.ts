import files from "@/data/asset-files.json";

/**
 * Fingerprinted image files built by `npm run assets` (scripts/build-assets.mjs).
 * Keys are paths under assets/, e.g. "photos/cat.jpg" → "/a/p/cat.1e2f999a18.webp".
 * Templates use these, so a gift published today keeps today's exact image even
 * if the source is replaced later (the new file gets a new name).
 *
 * Server-side only: the map is too large to ship to the browser.
 */
const map = files as Record<string, { src: string; w: number; h: number }>;

export function asset(path: string) {
  const file = map[path];
  if (!file) throw new Error(`Unknown asset "${path}". Put it under assets/ and run npm run assets.`);
  return file.src;
}
