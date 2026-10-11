import type { OccasionId } from "@/config/site";

/**
 * Static seed data. The shape mirrors the future `templates` table so the
 * data layer in `src/lib/templates.ts` can swap to a database without
 * touching any UI.
 */

export type Motif = "hearts" | "stars" | "sun" | "polaroid" | "stamp" | "bloom";

export interface Template {
  slug: string;
  name: string;
  occasion: OccasionId;
  description: string;
  /** Price in the smallest currency unit (cents). Wired to payments later. */
  priceCents: number;
  isNew?: boolean;
  palette: { bg: string; fg: string; accent: string };
  motif: Motif;
  preview: { kicker: string; title: string; signoff: string };
}

export const templates: Template[] = [
  {
    slug: "paper-hearts",
    name: "Paper Hearts",
    occasion: "love",
    description: "A soft, swoony love letter.",
    priceCents: 900,
    isNew: true,
    palette: { bg: "#f6d3cf", fg: "#5a1a2b", accent: "#e23b54" },
    motif: "hearts",
    preview: {
      kicker: "For my favorite person",
      title: "You make Tuesdays feel like holidays.",
      signoff: "— always, J.",
    },
  },
  {
    slug: "midnight-letter",
    name: "Midnight Letter",
    occasion: "anniversary",
    description: "Starlit, quiet and a little poetic.",
    priceCents: 1200,
    palette: { bg: "#1d1b33", fg: "#f5efe6", accent: "#f2c46d" },
    motif: "stars",
    preview: {
      kicker: "Year three",
      title: "365 nights, and still it’s you.",
      signoff: "Happy anniversary",
    },
  },
  {
    slug: "sunday-morning",
    name: "Sunday Morning",
    occasion: "birthday",
    description: "Warm, golden and full of cheer.",
    priceCents: 900,
    palette: { bg: "#f8dc8c", fg: "#3b2a10", accent: "#e2683b" },
    motif: "sun",
    preview: {
      kicker: "Happy birthday",
      title: "Another lap around the sun, together.",
      signoff: "Open your gift ↓",
    },
  },
  {
    slug: "airmail",
    name: "Airmail",
    occasion: "long-distance",
    description: "For the miles between you.",
    priceCents: 900,
    isNew: true,
    palette: { bg: "#cfdfd6", fg: "#1f3a33", accent: "#e23b54" },
    motif: "stamp",
    preview: {
      kicker: "4,213 miles away",
      title: "Far apart, never far.",
      signoff: "See you soon",
    },
  },
  {
    slug: "polaroid-lane",
    name: "Polaroid Lane",
    occasion: "memories",
    description: "A scrapbook of your little moments.",
    priceCents: 1200,
    palette: { bg: "#ece4d6", fg: "#2a1f23", accent: "#7c8b6f" },
    motif: "polaroid",
    preview: {
      kicker: "Remember when",
      title: "Our favorite little moments.",
      signoff: "12 photos inside",
    },
  },
  {
    slug: "little-bloom",
    name: "Little Bloom",
    occasion: "thank-you",
    description: "A bright bouquet of gratitude.",
    priceCents: 700,
    palette: { bg: "#e23b54", fg: "#fbf8f3", accent: "#f6d3cf" },
    motif: "bloom",
    preview: {
      kicker: "A small note",
      title: "Thank you, truly, for everything.",
      signoff: "With love",
    },
  },
  {
    slug: "velvet",
    name: "Velvet",
    occasion: "anniversary",
    description: "Deep, rich and endlessly romantic.",
    priceCents: 1200,
    palette: { bg: "#5a1a2b", fg: "#f6d3cf", accent: "#e23b54" },
    motif: "hearts",
    preview: {
      kicker: "Ten years",
      title: "I’d choose you in every lifetime.",
      signoff: "Forever yours",
    },
  },
  {
    slug: "garden-party",
    name: "Garden Party",
    occasion: "birthday",
    description: "Playful petals for a joyful day.",
    priceCents: 900,
    palette: { bg: "#dfe7c8", fg: "#2e3a1c", accent: "#e98aa0" },
    motif: "bloom",
    preview: {
      kicker: "It’s your day",
      title: "May this year bloom just for you.",
      signoff: "Make a wish",
    },
  },
];
