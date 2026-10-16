import { themes } from "@/components/editor/draft";
import type { Scene, StoryLevel, StoryPalette } from "@/components/story/types";
import type { OccasionId } from "@/config/site";
import type { Motif, Template } from "@/data/templates";

/** Prices follow the three levels used everywhere: ₹99, ₹149, ₹179. */
export const levelPrice: Record<StoryLevel, number> = { little: 9900, classic: 14900, grand: 17900 };

const theme = (id: string) => themes.find((t) => t.id === id)!.palette;

/** Story palettes: the editor's occasion themes plus a deep wine one for romance. */
export const palettes = {
  frosting: theme("frosting"),
  butter: theme("butter"),
  midnight: theme("midnight"),
  mint: theme("mint"),
  lavender: theme("lavender"),
  ocean: theme("ocean"),
  noir: theme("noir"),
  wine: { bg: "#4a1424", fg: "#fbe4e8", accent: "#ff7a93", cream: "#fff3f5", pink: "#f6c1cc", gold: "#f6b73c", ink: "#4a1424" },
} satisfies Record<string, StoryPalette>;

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
    story: { recipient: t.recipient, sender: t.sender, melody: t.melody, palette, scenes: t.scenes },
  };
}

/** Demo photos in /public/demo/birthday (Unsplash). Senders swap in their own. */
export const demoPhoto = (name: string) => `/demo/birthday/${name}.jpg`;
