"use client";

import { createContext, useContext } from "react";
import stickerStills from "@/data/sticker-stills.json";

/**
 * How eagerly gift photos load, set by whoever draws the gift:
 * - "thumb": template cards and thumbnails: lazy, and the small copy of each
 *   photo (<name>.thumb.webp, 400px) instead of the full one.
 * - "lazy" (default): off-screen content, e.g. a scrolling website gift.
 * - "eager": a gift being played; its current page is on screen.
 * - "priority": the one big picture a page is about (the template page's
 *   preview, the preview page, the front phone on the home page). Loads first.
 */
export type ImageLoading = "thumb" | "lazy" | "eager" | "priority";

export const ImageLoadingContext = createContext<ImageLoading>("lazy");

/** The <img> attributes for the current loading mode. */
export function useImageLoading() {
  const mode = useContext(ImageLoadingContext);
  return {
    loading: mode === "lazy" || mode === "thumb" ? ("lazy" as const) : ("eager" as const),
    fetchPriority: mode === "priority" ? ("high" as const) : undefined,
    thumb: mode === "thumb",
  };
}

const stills = new Set(stickerStills as string[]);

/**
 * The small copy of one of our images, for cards: a photo's 400px copy, a
 * sticker's 192px copy, or an animated sticker's first frame. Uploads and
 * anything else are left as they are.
 */
export function thumbSrc(src: string) {
  if (/^\/a\/p\/[^/]+\.[0-9a-f]{10}\.webp$/.test(src)) return src.replace(/\.webp$/, ".thumb.webp");
  const sticker = src.match(/^\/a\/s\/([^/]+\.[0-9a-f]{10})\.webp$/);
  if (sticker) return `/a/s/${sticker[1]}${stills.has(sticker[1]) ? ".still" : ".thumb"}.webp`;
  return src;
}
