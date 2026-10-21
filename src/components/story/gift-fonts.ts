import type { CSSProperties } from "react";
import { catalogFont, type FontId } from "./font-catalog";

/**
 * The font a sender picks for their whole gift: one of three mixed presets
 * built from the brand families, or any single font from the catalog.
 *
 * Classic keeps Inter Tight headlines and Kalam for notes.
 * Handwritten sets the whole gift in Kalam. Clean sets it in Inter Tight.
 */
export type GiftFont = "classic" | "hand" | "clean";
export type StoryFont = GiftFont | FontId;

export const giftFonts: Record<GiftFont, { name: string; note: string; family: string; weight: number; axes: string }> = {
  classic: { name: "Classic", note: "Clean headlines, handwritten notes", family: "var(--font-inter-tight)", weight: 560, axes: "normal" },
  hand: { name: "Handwritten", note: "The whole gift, like a real note", family: "var(--font-kalam)", weight: 700, axes: "normal" },
  clean: { name: "Clean", note: "Plain and modern", family: "var(--font-inter-tight)", weight: 500, axes: "normal" },
};

export const giftFontOrder: GiftFont[] = ["classic", "hand", "clean"];

export function isGiftPreset(font: string | undefined): font is GiftFont {
  return font === "classic" || font === "hand" || font === "clean";
}

/** Sample styling for the picker. Not used to render the gift itself. */
export function giftFontStyle(font: GiftFont): CSSProperties {
  const f = giftFonts[font];
  return { fontFamily: f.family, fontWeight: f.weight, fontVariationSettings: f.axes, fontStyle: "normal" };
}

/**
 * Attributes for the gift root. Presets are switched in globals.css via
 * `[data-gift-font]`, because the type utilities inline their family and
 * would ignore a variable override. Catalog fonts use `custom` plus a variable.
 */
export function giftFontRoot(font?: StoryFont): { "data-gift-font": string; style: CSSProperties } {
  const custom = isGiftPreset(font) ? undefined : catalogFont(font);
  if (custom) {
    return {
      "data-gift-font": "custom",
      style: { "--gift-face": custom.stack, "--font-hand": custom.stack } as CSSProperties,
    };
  }
  const preset = isGiftPreset(font) ? font : "classic";
  return {
    "data-gift-font": preset,
    style: preset === "clean" ? ({ "--font-hand": "var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif" } as CSSProperties) : {},
  };
}
