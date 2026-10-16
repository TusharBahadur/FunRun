import { birthdayTiers, type BirthdayFeatures, type BirthdayTierId } from "@/components/experiences/birthday/tiers";
import type {
  AccentFont,
  BirthdayGift,
  BirthdayPalette,
  PhotoTone,
} from "@/components/experiences/birthday/types";
import { demoBirthdayGift } from "@/data/demo-gifts";

/** Everything a sender can change in the "Make your own" editor. */
export type Draft = {
  version: 1;
  tier: BirthdayTierId;
  recipient: string;
  sender: string;
  age: number;
  themeId: string;
  /** Custom colours layered on top of the theme. */
  colors: { bg?: string; fg?: string; accent?: string };
  accentFont: AccentFont;
  copy: { opening: string; greeting: string; finale: string };
  shortNote: string;
  /** Paragraphs separated by a blank line. */
  letter: string;
  photos: { id: string; src?: string; caption: string; date: string }[];
  voiceNote: string;
  song: { title: string; artist: string };
  wishes: { id: string; name: string; message: string; src?: string }[];
  hidden: Partial<Record<HideableSection, boolean>>;
};

/** Sections a sender may switch off (only if their tier includes them). */
export type HideableSection = "unwrap" | "surprise" | "micBlow" | "numbers" | "timeline" | "thankYou" | "keepsake";

export const hideableSections: { key: HideableSection; label: string }[] = [
  { key: "unwrap", label: "Unwrap a gift box first" },
  { key: "surprise", label: "“Surprise!” reveal of friends" },
  { key: "micBlow", label: "Blow into the mic" },
  { key: "numbers", label: "Life by the numbers" },
  { key: "timeline", label: "Year-in-photos timeline" },
  { key: "thankYou", label: "Thank-you reply button" },
  { key: "keepsake", label: "Keepsake poster download" },
];

export const photoLimit: Record<BirthdayTierId, number> = { candle: 0, wish: 6, party: 20 };
export const wishLimit: Record<BirthdayTierId, number> = { candle: 0, wish: 0, party: 15 };

export type Theme = { id: string; name: string; palette: BirthdayPalette };

export const themes: Theme[] = [
  {
    id: "frosting",
    name: "Frosting",
    palette: { bg: "#ffd6dc", fg: "#43111f", accent: "#e8344e", cream: "#fff4ef", pink: "#ffb3c1", gold: "#f6b73c", ink: "#43111f" },
  },
  {
    id: "butter",
    name: "Butter",
    palette: { bg: "#fbe6b3", fg: "#3b2410", accent: "#e2683b", cream: "#fff8e8", pink: "#ffc9a8", gold: "#f6b73c", ink: "#3b2410" },
  },
  {
    id: "midnight",
    name: "Midnight",
    palette: { bg: "#24113a", fg: "#fdeefe", accent: "#ff5c8a", cream: "#fff1f6", pink: "#ffb3d1", gold: "#ffd166", ink: "#24113a" },
  },
  {
    id: "mint",
    name: "Mint",
    palette: { bg: "#d9efe3", fg: "#12352a", accent: "#ff6b5b", cream: "#f6fff9", pink: "#ffc2b8", gold: "#f6b73c", ink: "#12352a" },
  },
  {
    id: "lavender",
    name: "Lavender",
    palette: { bg: "#e6dcfb", fg: "#2b1a4a", accent: "#7c4dff", cream: "#faf7ff", pink: "#d6c4ff", gold: "#ffcf5c", ink: "#2b1a4a" },
  },
  {
    id: "ocean",
    name: "Ocean",
    palette: { bg: "#0f2a3d", fg: "#eaf6ff", accent: "#4cc9f0", cream: "#f2fbff", pink: "#a8e6ff", gold: "#ffd166", ink: "#0f2a3d" },
  },
  {
    id: "noir",
    name: "Noir & gold",
    palette: { bg: "#141414", fg: "#f5f0e8", accent: "#e8c26b", cream: "#fbf6ec", pink: "#f2dfb4", gold: "#e8c26b", ink: "#141414" },
  },
];

const tierTheme: Record<BirthdayTierId, string> = { candle: "butter", wish: "frosting", party: "midnight" };

export function defaultDraft(tier: BirthdayTierId = "wish"): Draft {
  const demo = demoBirthdayGift;
  return {
    version: 1,
    tier,
    recipient: demo.recipient,
    sender: demo.sender,
    age: demo.age,
    themeId: tierTheme[tier],
    colors: {},
    accentFont: "classic",
    copy: { opening: "", greeting: "", finale: "" },
    shortNote: demo.shortNote,
    letter: demo.message.join("\n\n"),
    photos: demo.memories.map((m, i) => ({ id: `p${i}`, caption: m.caption, date: m.date })),
    voiceNote: demo.voiceNote.transcript,
    song: { ...demo.song },
    wishes: demo.wishes.slice(0, 6).map((w, i) => ({ id: `w${i}`, name: w.name, message: w.message })),
    hidden: {},
  };
}

/* ───────────── Turning a draft into what the experience plays ───────────── */

const TONE_CYCLE: PhotoTone[] = ["sea", "rose", "sun", "night", "leaf", "dusk"];

export function draftPalette(d: Draft): BirthdayPalette {
  const base = (themes.find((t) => t.id === d.themeId) ?? themes[0]).palette;
  const bg = d.colors.bg ?? base.bg;
  const fg = d.colors.fg ?? base.fg;
  const accent = d.colors.accent ?? base.accent;
  const custom = d.colors.bg || d.colors.fg || d.colors.accent;
  if (!custom) return base;
  return {
    ...base,
    bg,
    fg,
    accent,
    pink: mix(accent, "#ffffff", 0.55),
    // Cards stay light, so their text needs whichever theme colour is dark.
    ink: isLight(fg) ? bg : fg,
  };
}

export function draftToGift(d: Draft): BirthdayGift {
  const words = d.voiceNote.trim().split(/\s+/).length;
  return {
    recipient: d.recipient.trim() || "you",
    sender: d.sender.trim() || "Someone",
    age: clampAge(d.age),
    shortNote: d.shortNote,
    message: d.letter.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    memories: d.photos.map((p, i) => ({ caption: p.caption, date: p.date, tone: TONE_CYCLE[i % 6], src: p.src })),
    timeline: d.photos.map((p, i) => ({ month: p.date, caption: p.caption, tone: TONE_CYCLE[i % 6], src: p.src })),
    voiceNote: { transcript: d.voiceNote, seconds: Math.max(3, Math.min(59, Math.round(words / 2.5))) },
    song: d.song,
    wishes: d.wishes.map((w, i) => ({
      name: w.name.trim() || "A friend",
      message: w.message,
      kind: w.src ? "photo" : "text",
      tone: TONE_CYCLE[(i + 2) % 6],
      src: w.src,
    })),
    copy: d.copy,
  };
}

/** Sections that end up hidden: the sender's choices, plus empty content. */
export function draftHidden(d: Draft): Partial<Record<keyof BirthdayFeatures, boolean>> {
  return {
    ...d.hidden,
    photos: d.photos.length === 0,
    timeline: d.hidden.timeline || d.photos.length === 0,
    groupWishes: d.wishes.length === 0,
    voiceNote: !d.voiceNote.trim(),
  };
}

export function clampAge(age: number) {
  return Number.isFinite(age) ? Math.min(120, Math.max(1, Math.round(age))) : 1;
}

export function tierPrice(tier: BirthdayTierId) {
  return birthdayTiers[tier].pricePaise;
}

/* ───────────── Saving on this device ───────────── */

const STORAGE_KEY = "tynitales:draft:v1";

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (parsed.version !== 1) return null;
    const draft = { ...defaultDraft(parsed.tier), ...parsed };
    // Drafts saved before fonts were consolidated used font names, not moods.
    if (!["classic", "soft", "playful", "modern"].includes(draft.accentFont)) draft.accentFont = "classic";
    return draft;
  } catch {
    return null;
  }
}

/** Returns false when the browser refused (usually: photos too big for storage). */
export function saveDraft(d: Draft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
}

/** Shrinks a photo so drafts stay small enough to save and send to the preview. */
export async function fileToDataUrl(file: File, maxSide = 1200): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/* ───────────── Colour helpers ───────────── */

function parse(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}

export function isLight(hex: string) {
  const [r, g, b] = parse(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}
