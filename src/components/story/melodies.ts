import { HAPPY_BIRTHDAY_MELODY, type Melody } from "@/components/experiences/music-box";
import type { MelodyId } from "./types";

/** Short original music-box tunes, one per mood. "R" = rest. */
export const melodies: Record<MelodyId, Melody> = {
  birthday: HAPPY_BIRTHDAY_MELODY,

  // Tender and slow, for love letters and apologies.
  lullaby: {
    beat: 0.5,
    notes: [
      ["E5", 1], ["C5", 1], ["G4", 1], ["C5", 1.5], ["D5", 0.5], ["E5", 2],
      ["D5", 1], ["B4", 1], ["G4", 1], ["B4", 1.5], ["C5", 0.5], ["D5", 2],
      ["E5", 1], ["G5", 1], ["E5", 1], ["D5", 1.5], ["C5", 0.5], ["A4", 2],
      ["G4", 1], ["C5", 1], ["E5", 1], ["D5", 1.5], ["B4", 0.5], ["C5", 3],
    ],
  },

  // A lilting 3/4, for anniversaries and proposals.
  waltz: {
    beat: 0.42,
    notes: [
      ["C5", 1], ["E5", 1], ["G5", 1], ["A5", 2], ["G5", 1],
      ["F5", 1], ["E5", 1], ["D5", 1], ["E5", 3],
      ["D5", 1], ["F5", 1], ["A5", 1], ["G5", 2], ["E5", 1],
      ["D5", 1], ["C5", 1], ["B4", 1], ["C5", 3],
      ["E5", 1], ["G5", 1], ["C5", 1], ["A4", 2], ["C5", 1],
      ["G4", 1], ["B4", 1], ["D5", 1], ["C5", 3],
    ],
  },

  // Bright and bouncy, for parents' days and girlfriend's day.
  sunny: {
    beat: 0.32,
    notes: [
      ["C5", 1], ["E5", 1], ["G5", 1], ["E5", 1], ["F5", 1], ["A5", 1], ["G5", 2],
      ["E5", 1], ["C5", 1], ["D5", 1], ["E5", 1], ["D5", 2], ["R", 2],
      ["C5", 1], ["E5", 1], ["G5", 1], ["E5", 1], ["A5", 1], ["G5", 1], ["F5", 1], ["E5", 1],
      ["D5", 1], ["G4", 1], ["B4", 1], ["D5", 1], ["C5", 4],
    ],
  },
};
