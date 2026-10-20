import type { CSSProperties } from "react";

/**
 * The font a sender picks for their gift. All three are families already
 * loaded for the brand — nothing new is downloaded.
 *
 * Classic keeps today's look: Fraunces headlines, Kalam for notes.
 * Handwritten sets the whole gift in Kalam. Clean sets it in Inter Tight.
 */
export type GiftFont = "classic" | "hand" | "clean";

export const giftFonts: Record<GiftFont, { name: string; note: string; family: string; weight: number; axes: string }> = {
  classic: { name: "Classic", note: "Clean headlines, handwritten notes", family: "var(--font-fraunces)", weight: 560, axes: '"SOFT" 30, "WONK" 0' },
  hand: { name: "Handwritten", note: "The whole gift, like a real note", family: "var(--font-kalam)", weight: 700, axes: "normal" },
  clean: { name: "Clean", note: "Plain and modern", family: "var(--font-inter-tight)", weight: 500, axes: "normal" },
};

export const giftFontOrder: GiftFont[] = ["classic", "hand", "clean"];

/** Sample styling for the picker. Not used to render the gift itself. */
export function giftFontStyle(font: GiftFont): CSSProperties {
  const f = giftFonts[font];
  return { fontFamily: f.family, fontWeight: f.weight, fontVariationSettings: f.axes, fontStyle: "normal" };
}

/**
 * Stickers read `--font-hand` directly. Headlines and `type-hand` are switched
 * in globals.css via `[data-gift-font]`, because those utilities inline the
 * family and would ignore a variable override.
 */
export function giftFontVars(font?: GiftFont): CSSProperties {
  if (font === "clean") {
    return { "--font-hand": "var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif" } as CSSProperties;
  }
  return {};
}
