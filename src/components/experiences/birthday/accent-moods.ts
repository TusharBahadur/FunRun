import type { CSSProperties } from "react";
import type { AccentFont } from "./types";

/**
 * How a *starred* word looks. Four clearly different faces, so the picker
 * actually shows a choice. Never the thin italic serif.
 * (The ids are kept from older versions so saved gifts still resolve.)
 */
type Mood = { name: string; family: string; weight: number; style: "normal" | "italic"; tracking: string };

const SANS = "var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif";

export const accentMoods: Record<AccentFont, Mood> = {
  classic: { name: "Bold", family: SANS, weight: 600, style: "normal", tracking: "inherit" },
  soft: { name: "Italic", family: SANS, weight: 600, style: "italic", tracking: "-0.03em" },
  playful: { name: "Handwritten", family: "var(--font-kalam), ui-rounded, system-ui, sans-serif", weight: 700, style: "normal", tracking: "0" },
  modern: { name: "Typewriter", family: "var(--font-plex-mono), ui-monospace, monospace", weight: 500, style: "normal", tracking: "-0.02em" },
};

export const accentMoodOrder: AccentFont[] = ["classic", "soft", "playful", "modern"];

/** CSS variables read by `.type-accent` (see globals.css). */
export function accentMoodVars(mood: AccentFont): CSSProperties {
  const m = accentMoods[mood] ?? accentMoods.classic;
  return {
    "--font-italic": m.family,
    "--accent-face": m.family,
    "--accent-style": m.style,
    "--accent-weight": m.weight,
    "--accent-tracking": m.tracking,
    "--accent-axes": "normal",
  } as CSSProperties;
}

/** Inline style for showing a mood on its own (e.g. a picker sample). */
export function accentMoodStyle(mood: AccentFont): CSSProperties {
  const m = accentMoods[mood] ?? accentMoods.classic;
  return { fontFamily: m.family, fontWeight: m.weight, fontStyle: m.style, letterSpacing: m.tracking, fontVariationSettings: "normal" };
}
