import { HAPPY_BIRTHDAY_MELODY, type Melody } from "@/components/experiences/music-box";
import type { MelodyId } from "./types";

/**
 * Soothing, relaxing, and warm ambient acoustic melodies.
 * Tuned to lower, soothing frequencies (octaves 3 & 4) for a comforting felt-piano atmosphere.
 */
export const melodies: Record<MelodyId, Melody> = {
  birthday: HAPPY_BIRTHDAY_MELODY,

  // Tender, deeply peaceful felt piano for love letters, apologies, and intimate notes.
  lullaby: {
    beat: 0.58,
    notes: [
      ["E4", 1.5], ["G4", 1], ["C4", 1.5], ["E4", 1], ["D4", 2],
      ["C4", 1.5], ["E4", 1], ["G3", 1.5], ["C4", 1], ["B3", 2],
      ["A3", 1.5], ["C4", 1], ["E4", 1.5], ["D4", 1], ["G3", 2],
      ["C4", 2],   ["E4", 1.5], ["D4", 1.5], ["B3", 1], ["C4", 3],
    ],
  },

  // A warm, gentle romantic acoustic waltz for anniversaries, proposals, and love stories.
  waltz: {
    beat: 0.50,
    notes: [
      ["C4", 1], ["E4", 1], ["G4", 1], ["A4", 2], ["G4", 1],
      ["E4", 1], ["D4", 1], ["C4", 1], ["D4", 3],
      ["D4", 1], ["F4", 1], ["A4", 1], ["G4", 2], ["E4", 1],
      ["C4", 1], ["B3", 1], ["A3", 1], ["G3", 3],
      ["C4", 1], ["E4", 1], ["G4", 1], ["C5", 2], ["B4", 1],
      ["A4", 1], ["G4", 1], ["D4", 1], ["C4", 3],
    ],
  },

  // Relaxing, uplifting, and sunny acoustic groove for friendship and celebration.
  sunny: {
    beat: 0.42,
    notes: [
      ["C4", 1], ["E4", 1], ["G4", 1.5], ["A4", 1], ["G4", 2],
      ["E4", 1], ["G4", 1], ["C4", 1.5], ["D4", 1], ["E4", 2],
      ["F4", 1], ["A4", 1], ["G4", 1.5], ["E4", 1], ["D4", 2],
      ["C4", 1.5], ["D4", 1], ["E4", 1], ["G4", 1.5], ["C4", 3],
    ],
  },
};
