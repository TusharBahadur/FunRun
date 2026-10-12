import type { BirthdayTierId } from "@/components/experiences/birthday/tiers";
import type { OccasionId } from "@/config/site";

/**
 * Static seed data. The shape mirrors the future `templates` table so the
 * data layer in `src/lib/templates.ts` can swap to a database without
 * touching any UI.
 */

export type Motif = "hearts" | "stars" | "sun" | "polaroid" | "stamp" | "bloom" | "cake";

/** Full-screen gift experiences that exist so far. */
export type Experience = "birthday";

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
}

export const templates: Template[] = [
  {
    slug: "make-a-wish",
    name: "Make a Wish",
    occasion: "birthday",
    description: "Unwrap it, blow out the candles, relive the year.",
    pricePaise: 14900,
    isNew: true,
    palette: { bg: "#ffd6dc", fg: "#43111f", accent: "#e8344e" },
    motif: "cake",
    preview: {
      kicker: "Happy birthday",
      title: "Make a wish. This one’s all yours.",
      signoff: "Blow out the candles ↓",
    },
    experience: "birthday",
    tier: "wish",
    experiencePalette: { cream: "#fff4ef", pink: "#ffb3c1", gold: "#f6b73c", ink: "#43111f" },
  },
  {
    slug: "candle",
    name: "Candle",
    occasion: "birthday",
    description: "A sweet little birthday moment. Blow out the candles.",
    pricePaise: 9900,
    palette: { bg: "#fbe6b3", fg: "#3b2410", accent: "#e2683b" },
    motif: "cake",
    preview: {
      kicker: "Happy birthday",
      title: "Light the candles. It’s your day.",
      signoff: "Tap to make a wish",
    },
    experience: "birthday",
    tier: "candle",
    experiencePalette: { cream: "#fff8e8", pink: "#ffc9a8", gold: "#f6b73c", ink: "#3b2410" },
  },
  {
    slug: "the-party",
    name: "The Party",
    occasion: "birthday",
    description: "Everyone who loves them, in one gift. Friends join in.",
    pricePaise: 17900,
    isNew: true,
    palette: { bg: "#24113a", fg: "#fdeefe", accent: "#ff5c8a" },
    motif: "cake",
    preview: {
      kicker: "Surprise!",
      title: "Everyone showed up for you.",
      signoff: "12 friends inside ↓",
    },
    experience: "birthday",
    tier: "party",
    experiencePalette: { cream: "#fff1f6", pink: "#ffb3d1", gold: "#ffd166", ink: "#24113a" },
  },
  {
    slug: "paper-hearts",
    name: "Paper Hearts",
    occasion: "love",
    description: "A soft, swoony love letter.",
    pricePaise: 9900,
    isNew: true,
    palette: { bg: "#f6d3cf", fg: "#5a1a2b", accent: "#e23b54" },
    motif: "hearts",
    preview: {
      kicker: "For my favorite person",
      title: "You make Tuesdays feel like holidays.",
      signoff: "â always, J.",
    },
  },
  {
    slug: "midnight-letter",
    name: "Midnight Letter",
    occasion: "anniversary",
    description: "Starlit, quiet and a little poetic.",
    pricePaise: 14900,
    palette: { bg: "#1d1b33", fg: "#f5efe6", accent: "#f2c46d" },
    motif: "stars",
    preview: {
      kicker: "Year three",
      title: "365 nights, and still itâs you.",
      signoff: "Happy anniversary",
    },
  },
  {
    slug: "sunday-morning",
    name: "Sunday Morning",
    occasion: "birthday",
    description: "Warm, golden and full of cheer.",
    pricePaise: 9900,
    palette: { bg: "#f8dc8c", fg: "#3b2a10", accent: "#e2683b" },
    motif: "sun",
    preview: {
      kicker: "Happy birthday",
      title: "Another lap around the sun, together.",
      signoff: "Open your gift â",
    },
  },
  {
    slug: "airmail",
    name: "Airmail",
    occasion: "long-distance",
    description: "For the miles between you.",
    pricePaise: 9900,
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
    pricePaise: 14900,
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
    pricePaise: 9900,
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
    pricePaise: 14900,
    palette: { bg: "#5a1a2b", fg: "#f6d3cf", accent: "#e23b54" },
    motif: "hearts",
    preview: {
      kicker: "Ten years",
      title: "Iâd choose you in every lifetime.",
      signoff: "Forever yours",
    },
  },
  {
    slug: "garden-party",
    name: "Garden Party",
    occasion: "birthday",
    description: "Playful petals for a joyful day.",
    pricePaise: 9900,
    palette: { bg: "#dfe7c8", fg: "#2e3a1c", accent: "#e98aa0" },
    motif: "bloom",
    preview: {
      kicker: "Itâs your day",
      title: "May this year bloom just for you.",
      signoff: "Make a wish",
    },
  },
];
