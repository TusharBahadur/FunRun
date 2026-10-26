/**
 * The three birthday tiers. Each level up adds something the recipient can
 * feel: ₹99 is a sweet moment, ₹149 makes it about them, ₹179 makes it from
 * everyone who loves them.
 */

export type BirthdayTierId = "candle" | "wish" | "party";

export type BirthdayFeatures = {
  /** Wrapped gift to tap open before the cake. */
  unwrap: boolean;
  /** Friends' names burst in after unwrapping. */
  surprise: boolean;
  /** "Blow into your mic" option on the cake. */
  micBlow: boolean;
  /** Full letter (otherwise a short note). */
  letter: boolean;
  /** Swipeable polaroid stack. */
  photos: boolean;
  /** Month-by-month "year in photos" strip. */
  timeline: boolean;
  /** Years / days / heartbeats count-up. */
  numbers: boolean;
  /** A recorded message from the sender. */
  voiceNote: boolean;
  /** Sender's own song instead of the music box. */
  ownSong: boolean;
  /** Wall of messages from friends. */
  groupWishes: boolean;
  /** Recipient can reply with a thank-you. */
  thankYou: boolean;
  /** Downloadable poster of the day. */
  keepsake: boolean;
};

export type BirthdayTier = {
  id: BirthdayTierId;
  name: string;
  pricePaise: number;
  pitch: string;
  features: BirthdayFeatures;
  /** Plain-language rows for the comparison table and detail page. */
  highlights: string[];
};

export const birthdayTiers: Record<BirthdayTierId, BirthdayTier> = {
  candle: {
    id: "candle",
    name: "Candle",
    pricePaise: 9900,
    pitch: "A sweet birthday moment.",
    features: {
      unwrap: false,
      surprise: false,
      micBlow: false,
      letter: true,
      photos: true,
      timeline: false,
      numbers: false,
      voiceNote: false,
      ownSong: false,
      groupWishes: false,
      thankYou: false,
      keepsake: false,
    },
    highlights: [
      "Their name, their photo, and a cake with their age",
      "Shake open a few of your photos together",
      "Tap to blow out the candles, with confetti",
      "A letter from you",
    ],
  },
  wish: {
    id: "wish",
    name: "Make a Wish",
    pricePaise: 9900,
    pitch: "A birthday story about them.",
    features: {
      unwrap: true,
      surprise: false,
      micBlow: true,
      letter: true,
      photos: true,
      timeline: false,
      numbers: true,
      voiceNote: false,
      ownSong: false,
      groupWishes: false,
      thankYou: true,
      keepsake: false,
    },
    highlights: [
      "Everything in Candle",
      "A wrapped gift they unwrap first",
      "Blow into the mic to put out the candles",
      "A full letter, revealed line by line",
      "Up to 6 photos in a swipeable stack",
      "Their life by the numbers",
      "Unlocks at midnight on their birthday",
      "They can send you a thank-you",
    ],
  },
  party: {
    id: "party",
    name: "The Party",
    pricePaise: 9900,
    pitch: "Everyone who loves them, in one gift.",
    features: {
      unwrap: true,
      surprise: true,
      micBlow: true,
      letter: true,
      photos: true,
      timeline: true,
      numbers: true,
      voiceNote: true,
      ownSong: true,
      groupWishes: true,
      thankYou: true,
      keepsake: true,
    },
    highlights: [
      "Everything in Make a Wish",
      "Group wishes: up to 15 friends add a message, photo or voice note",
      "A “surprise!” reveal of everyone who joined",
      "A voice note from you",
      "Your own song instead of the music box",
      "Up to 20 photos, plus a year-in-photos timeline",
      "A downloadable keepsake poster",
    ],
  },
};

export const birthdayTierOrder: BirthdayTierId[] = ["candle", "wish", "party"];
