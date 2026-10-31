"use client";

import { createContext, useContext } from "react";

/**
 * How eagerly gift photos load, set by whoever draws the gift:
 * - "lazy" (default): cards in a grid, most of them off screen.
 * - "eager": a gift being played; its current page is on screen.
 * - "priority": the one big picture a page is about (the template page's
 *   preview, the preview page, the front phone on the home page). Loads first.
 */
export type ImageLoading = "lazy" | "eager" | "priority";

export const ImageLoadingContext = createContext<ImageLoading>("lazy");

/** The <img> attributes for the current loading mode. */
export function useImageLoading() {
  const mode = useContext(ImageLoadingContext);
  return {
    loading: mode === "lazy" ? ("lazy" as const) : ("eager" as const),
    fetchPriority: mode === "priority" ? ("high" as const) : undefined,
  };
}
