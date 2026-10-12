export type BirthdayPalette = {
  bg: string;
  fg: string;
  accent: string;
  /** Frosting / paper tone. */
  cream: string;
  /** Lighter frosting for the top tier drip. */
  pink: string;
  /** Flames and confetti sparkle. */
  gold: string;
  /** Text colour on cream cards (differs from `fg` on dark themes). */
  ink: string;
};

export type PhotoTone = "sun" | "sea" | "night" | "rose" | "leaf" | "dusk";

/** Everything the sender personalises. Later this comes from the saved gift. */
export type BirthdayGift = {
  recipient: string;
  sender: string;
  age: number;
  /** Used by the ₹99 tier instead of the full letter. */
  shortNote: string;
  message: string[];
  memories: { caption: string; date: string; tone: PhotoTone }[];
  /** Month-by-month strip for the ₹179 tier. */
  timeline: { month: string; caption: string; tone: PhotoTone }[];
  voiceNote: { transcript: string; seconds: number };
  song: { title: string; artist: string };
  wishes: { name: string; message: string; kind: "text" | "photo" | "voice"; tone?: PhotoTone }[];
};
