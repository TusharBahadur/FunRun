import type { BirthdayTierId } from "@/components/experiences/birthday/tiers";
import type { Story, StoryLevel } from "@/components/story/types";
import type { OccasionId } from "@/config/site";
import { storyTemplates } from "./stories";

/**
 * Static seed data. The shape mirrors the future `templates` table so the
 * data layer in `src/lib/templates.ts` can swap to a database without
 * touching any UI.
 */

export type Motif = "hearts" | "stars" | "sun" | "polaroid" | "stamp" | "bloom" | "cake" | "ring";

/** Full-screen gift experiences: the original birthday one, and scene-by-scene stories. */
export type Experience = "birthday" | "story";

export interface Template {
  slug: string;
  name: string;
  occasion: OccasionId;
  description: string;
  /** Price in paise (INR). Wired to payments later. */
  pricePaise: number;
  isNew?: boolean;
  palette: { bg: string; fg: string; accent: string };
  motif: Motif;
  preview: { kicker: string; title: string; signoff: string };
  /** Set when the template has a full gift experience the recipient opens. */
  experience?: Experience;
  /** Which birthday tier this template is (sets its features and price). */
  tier?: BirthdayTierId;
  /** Extra colours the full experience needs beyond the card palette. */
  experiencePalette?: { cream: string; pink: string; gold: string; ink: string };
  /** Story templates: which price level (₹99 / ₹149 / ₹179) and the scenes. */
  level?: StoryLevel;
  story?: Story;
}

export const templates: Template[] = storyTemplates;
