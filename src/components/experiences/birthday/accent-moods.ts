import type { CSSProperties } from "react";
import type { AccentFont } from "./types";

/**
 * Highlight-font "moods" a sender can pick. Three are the same Fraunces file
 * with different axis settings, so variety costs no extra downloads.
 */
export const accentMoods: Record<AccentFont, { name: string; family: string; axes: string; weight: number }> = {
  classic: { name: "Classic", family: "var(--font-fraunces)", axes: '"SOFT" 0, "WONK" 0', weight: 400 },
  soft: { name: "Soft", family: "var(--font-fraunces)", axes: '"SOFT" 100, "WONK" 0', weight: 350 },
  playful: { name: "Playful", family: "var(--font-fraunces)", axes: '"SOFT" 50, "WONK" 1', weight: 500 },
  modern: { name: "Modern", family: "var(--font-inter-tight)", axes: "normal", weight: 500 },
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
  return { fontFamily: m.family, fontVariationSettings: m.axes, fontWeight: m.weight, fontStyle: "italic" };
}
