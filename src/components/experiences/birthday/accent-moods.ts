import type { CSSProperties } from "react";
import type { AccentFont } from "./types";

/**
 * Highlight weights a sender can pick. All Inter Tight — gift previews never
 * use the thin italic serif, even on a starred word.
 */
export const accentMoods: Record<AccentFont, { name: string; family: string; axes: string; weight: number }> = {
  classic: { name: "Classic", family: "var(--font-inter-tight)", axes: "normal", weight: 600 },
  soft: { name: "Soft", family: "var(--font-inter-tight)", axes: "normal", weight: 500 },
  playful: { name: "Playful", family: "var(--font-inter-tight)", axes: "normal", weight: 700 },
  modern: { name: "Modern", family: "var(--font-inter-tight)", axes: "normal", weight: 800 },
};

export const accentMoodOrder: AccentFont[] = ["classic", "soft", "playful", "modern"];

/** CSS variables read by the `type-accent` utility. */
export function accentMoodVars(mood: AccentFont): CSSProperties {
  const m = accentMoods[mood] ?? accentMoods.classic;
  return {
    "--font-italic": m.family,
    "--accent-axes": m.axes,
    "--accent-weight": m.weight,
  } as CSSProperties;
}

/** Inline style for showing a mood on its own (e.g. a picker sample). */
export function accentMoodStyle(mood: AccentFont): CSSProperties {
  const m = accentMoods[mood];
  return { fontFamily: m.family, fontVariationSettings: m.axes, fontWeight: m.weight, fontStyle: "normal" };
}
