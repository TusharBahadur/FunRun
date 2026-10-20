import type { AccentFont, BirthdayPalette, PhotoTone } from "@/components/experiences/birthday/types";
import type { GiftFont } from "./gift-fonts";
import type { AnyStickerId, StickerPlacement } from "./stickers";

/**
 * A story is a gift told one scene at a time. Every scene is a small game with
 * one gesture; finishing it unlocks the next page. Templates are recipes of
 * scenes with their own words, palette and music.
 *
 * Copy fields accept `{to}` (recipient) and `{from}` (sender) placeholders and
 * `*stars*` for the highlighted words.
 */

export type StoryPalette = BirthdayPalette;
export type StoryLevel = "little" | "classic" | "grand";
export type MelodyId = "birthday" | "lullaby" | "waltz" | "sunny";

/** Shared headline block most scenes start with, plus per-scene studio settings. */
type Heading = {
  /** Hidden in the studio: skipped when the gift plays. */
  hidden?: boolean;
  /** Colours that apply to this scene only; the rest come from the story. */
  palette?: Partial<StoryPalette>;
  eyebrow?: string;
  title: string;
  /** What to do, in a few words. Shown until the scene is done. */
  hint?: string;
  /** Shown once the scene is done. */
  done?: string;
  /** Little animated stickers dotted around the page. */
  stickers?: StickerPlacement[];
  /** A sticker that pops up once the page is finished. */
  reaction?: AnyStickerId;
  /** Website gifts: the short name for this section in the menu. */
  nav?: string;
};

export type Photo = {
  caption: string;
  tone: PhotoTone;
  /** An uploaded photo (data URL or /public path); otherwise a soft placeholder. */
  src?: string;
  /** Handwritten under the caption, e.g. "Dec '24". */
  date?: string;
};

export type Scene =
  // Openers
  | ({ type: "seal" } & Heading & { note: string })
  | ({ type: "scratch" } & Heading & { reveal: string; sub?: string })
  | ({ type: "lights" } & Heading & { candles: number; reveal: string })
  | ({ type: "knock" } & Heading & { knocks: number; reveal: string })
  | ({ type: "unwrap" } & Heading & { taps: number; inside: string; insideSub?: string })
  // About them
  | ({ type: "spotlight" } & Heading & { photo?: string; tone?: PhotoTone; tags: string[] })
  | ({ type: "compliments" } & Heading & { bubbles: string[] })
  // Website sections (work as pages too)
  | ({ type: "hero" } & Heading & { subtitle?: string; photo?: string; tone?: PhotoTone })
  | ({ type: "countdown" } & Heading & { /** YYYY-MM-DD. Counts down if ahead, counts up if past. */ date: string; caption?: string })
  | ({ type: "noticed" } & Heading & { items: { title: string; text: string }[] })
  | ({ type: "gallery" } & Heading & { photos: Photo[] })
  | ({ type: "playlist" } & Heading & { songs: { title: string; note: string; link?: string; src?: string; tone: PhotoTone }[] })
  // Wishes and feelings
  | ({ type: "dandelion" } & Heading)
  | ({ type: "cake" } & Heading & { age: number })
  | ({ type: "meter" } & Heading & { label: string; levels: string[] })
  // Cards, paper and keepsakes
  | ({ type: "receipt" } & Heading & { store: string; items: { name: string; qty: string }[]; total: string })
  | ({ type: "deck" } & Heading & { cards: string[] })
  | ({ type: "coupon" } & Heading & { offer: string; terms: string })
  | ({ type: "jar" } & Heading & { notes: string[] })
  | ({ type: "polaroids" } & Heading & { photos: Photo[] })
  // Games
  | ({ type: "quiz" } & Heading & { questions: { q: string; options: string[]; reply: string }[] })
  | ({ type: "match" } & Heading & { symbols: ("heart" | "star" | "cake" | "sun" | "ring" | "flower")[] })
  | ({ type: "stars" } & Heading & { reveal: string })
  | ({ type: "question" } & Heading & { question: string; yes: string; no: string; after: string })
  | ({ type: "ringbox" } & Heading & { question: string })
  | ({ type: "bouquet" } & Heading & { flowers: number; card: string })
  | ({ type: "award" } & Heading & { trophy: "cup" | "medal"; engraving: string })
  | ({ type: "map" } & Heading & { pins: { place: string; when: string; memory: string }[] })
  // Reading and endings
  | ({ type: "letter" } & Heading & { paragraphs: string[]; signoff: string; /** A photo pinned to the corner of the letter. */ photo?: string })
  | ({ type: "numbers" } & Heading & { stats: { value: number; suffix?: string; label: string }[] })
  | ({ type: "wishes" } & Heading & { wishes: { name: string; message: string }[] })
  | ({ type: "voice" } & Heading & { transcript: string; seconds: number })
  | ({ type: "finale" } & Heading & { keepsake?: boolean; thankYou?: boolean; /** A little collage above the buttons. */ photos?: Photo[] });

export type SceneType = Scene["type"];

export type Story = {
  /** "pages": one game per page (default). "site": one long scrolling page. */
  format?: "pages" | "site";
  recipient: string;
  sender: string;
  melody: MelodyId;
  palette: StoryPalette;
  /** Highlight-font mood (see accent-moods.ts). Defaults to classic. */
  accentFont?: AccentFont;
  /** Headline, letter and caption font (see gift-fonts.ts). Defaults to classic. */
  font?: GiftFont;
  scenes: Scene[];
};

/** Scenes that are read rather than played: the next page is open right away. */
export const passiveScenes: SceneType[] = ["letter", "numbers", "wishes", "voice", "finale", "hero", "countdown", "noticed", "gallery", "playlist"];
