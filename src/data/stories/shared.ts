import type { Scene, StoryLevel, StoryPalette } from "@/components/story/types";
import { giftPricing, type OccasionId } from "@/config/site";
import type { Motif, Template } from "@/data/templates";
import { palettes } from "@/data/themes";
import { asset } from "@/lib/assets";

export { palettes };

/** Every level costs the same; levels only change how much is in the gift. */
export const levelPrice: Record<StoryLevel, number> = {
  little: giftPricing.pricePaise,
  classic: giftPricing.pricePaise,
  grand: giftPricing.pricePaise,
};

type StoryTemplateInput = {
  slug: string;
  name: string;
  occasion: OccasionId;
  level: StoryLevel;
  description: string;
  palette: StoryPalette;
  motif: Motif;
  preview: Template["preview"];
  isNew?: boolean;
  tier?: Template["tier"];
  recipient: string;
  sender: string;
  melody: "birthday" | "lullaby" | "waltz" | "sunny";
  paper?: boolean;
  scenes: Scene[];
};

/** Turns a story recipe into a gallery template with the right price and colours. */
export function storyTemplate(t: StoryTemplateInput): Template {
  const { palette } = t;
  return {
    slug: t.slug,
    name: t.name,
    occasion: t.occasion,
    description: t.description,
    pricePaise: levelPrice[t.level],
    isNew: t.isNew ?? true,
    palette: { bg: palette.bg, fg: palette.fg, accent: palette.accent },
    experiencePalette: { cream: palette.cream, pink: palette.pink, gold: palette.gold, ink: palette.ink },
    motif: t.motif,
    preview: t.preview,
    experience: "story",
    tier: t.tier,
    level: t.level,
    story: { recipient: t.recipient, sender: t.sender, melody: t.melody, palette, paper: t.paper, scenes: t.scenes },
  };
}

/** Demo photos in assets/photos (Unsplash). Senders swap in their own. */
export const demoPhoto = (name: string) => asset(`photos/${name}.jpg`);

type SiteTemplateInput = Omit<StoryTemplateInput, "level" | "tier">;

/** A website-style gift: one long scrolling page instead of a game per page. */
export function siteTemplate(t: SiteTemplateInput): Template {
  const { palette } = t;
  return {
    slug: t.slug,
    name: t.name,
    occasion: t.occasion,
    description: t.description,
    pricePaise: giftPricing.pricePaise,
    isNew: t.isNew ?? true,
    palette: { bg: palette.bg, fg: palette.fg, accent: palette.accent },
    experiencePalette: { cream: palette.cream, pink: palette.pink, gold: palette.gold, ink: palette.ink },
    motif: t.motif,
    preview: t.preview,
    experience: "story",
    story: { format: "site", recipient: t.recipient, sender: t.sender, melody: t.melody, palette, scenes: t.scenes },
  };
}
