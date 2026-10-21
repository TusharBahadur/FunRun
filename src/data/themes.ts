import type { BirthdayPalette } from "@/components/experiences/birthday/types";

/**
 * Gift colour themes. Soft, milky backgrounds with one candy accent —
 * more stationery-shop than neon. Cards stay cream so photos and letters
 * always sit on paper.
 */
export const palettes = {
  strawberry: {
    bg: "#ffe8ee",
    fg: "#542436",
    accent: "#dc5570",
    cream: "#fff9f7",
    pink: "#ffd2de",
    gold: "#e8b45c",
    ink: "#542436",
  },
  matcha: {
    bg: "#eef3e0",
    fg: "#2a3624",
    accent: "#5a8648",
    cream: "#fffcf5",
    pink: "#dce6c8",
    gold: "#c9a84a",
    ink: "#2a3624",
  },
  honey: {
    bg: "#fff0d2",
    fg: "#4a2e14",
    accent: "#d06632",
    cream: "#fffbf3",
    pink: "#f3d4b0",
    gold: "#e8ae3c",
    ink: "#4a2e14",
  },
  blueberry: {
    bg: "#eeeff8",
    fg: "#2a2c52",
    accent: "#686cc0",
    cream: "#fbfaff",
    pink: "#d2d4f0",
    gold: "#d4b04a",
    ink: "#2a2c52",
  },
  peach: {
    bg: "#ffece0",
    fg: "#4c2818",
    accent: "#e46848",
    cream: "#fff8f3",
    pink: "#ffd2be",
    gold: "#ecaa48",
    ink: "#4c2818",
  },
  taro: {
    bg: "#f2eaf5",
    fg: "#3a2846",
    accent: "#a85898",
    cream: "#fdfbff",
    pink: "#e6d0e6",
    gold: "#d4a84a",
    ink: "#3a2846",
  },
  cocoa: {
    bg: "#3a2824",
    fg: "#f7ece6",
    accent: "#e07060",
    cream: "#fff3eb",
    pink: "#e8c0b4",
    gold: "#d4a050",
    ink: "#3a2824",
  },
  moon: {
    bg: "#243044",
    fg: "#f3eef6",
    accent: "#e070a0",
    cream: "#fff5fa",
    pink: "#f0c0d4",
    gold: "#e8b858",
    ink: "#243044",
  },
} satisfies Record<string, BirthdayPalette>;

export type ThemeId = keyof typeof palettes;

export const themeNames: Record<ThemeId, string> = {
  strawberry: "Strawberry milk",
  matcha: "Matcha latte",
  honey: "Honey toast",
  blueberry: "Blueberry yogurt",
  peach: "Peach soda",
  taro: "Taro milk",
  cocoa: "Hot cocoa",
  moon: "Moon milk",
};

export const themeList = (Object.keys(palettes) as ThemeId[]).map((id) => ({
  id,
  name: themeNames[id],
  palette: palettes[id],
}));
