export type FontGroup = "serif" | "sans" | "hand" | "fun" | "type";

export const fontGroups: { id: FontGroup; name: string }[] = [
  { id: "serif", name: "Elegant" },
  { id: "sans", name: "Clean" },
  { id: "hand", name: "Handwritten" },
  { id: "fun", name: "Fun" },
  { id: "type", name: "Typewriter" },
];

const SERIF = "ui-serif, Georgia, serif";
const SANS = "ui-sans-serif, system-ui, sans-serif";
const HAND = '"Segoe Print", "Bradley Hand", cursive';
const MONO = "ui-monospace, monospace";

/**
 * Fonts a sender can pick for the whole gift or for a single line.
 * Faces are loaded in gift-font-faces.ts (preload: false) and attached in layout.
 */
export const fontCatalog = [
  { id: "fraunces", name: "Fraunces", group: "serif", stack: `var(--font-fraunces), ${SERIF}` },
  { id: "playfair", name: "Playfair", group: "serif", stack: `var(--gf-playfair), ${SERIF}` },
  { id: "dm-serif", name: "DM Serif", group: "serif", stack: `var(--gf-dm-serif), ${SERIF}` },
  { id: "cormorant", name: "Cormorant", group: "serif", stack: `var(--gf-cormorant), ${SERIF}` },
  { id: "lora", name: "Lora", group: "serif", stack: `var(--gf-lora), ${SERIF}` },
  { id: "bodoni", name: "Bodoni", group: "serif", stack: `var(--gf-bodoni), ${SERIF}` },
  { id: "instrument", name: "Instrument", group: "serif", stack: `var(--gf-instrument), ${SERIF}` },
  { id: "cinzel", name: "Cinzel", group: "serif", stack: `var(--gf-cinzel), ${SERIF}` },

  { id: "inter", name: "Inter", group: "sans", stack: `var(--font-inter-tight), ${SANS}` },
  { id: "poppins", name: "Poppins", group: "sans", stack: `var(--gf-poppins), ${SANS}` },
  { id: "outfit", name: "Outfit", group: "sans", stack: `var(--gf-outfit), ${SANS}` },
  { id: "quicksand", name: "Quicksand", group: "sans", stack: `var(--gf-quicksand), ${SANS}` },
  { id: "space-grotesk", name: "Space Grotesk", group: "sans", stack: `var(--gf-space-grotesk), ${SANS}` },
  { id: "bricolage", name: "Bricolage", group: "sans", stack: `var(--gf-bricolage), ${SANS}` },
  { id: "fredoka", name: "Fredoka", group: "sans", stack: `var(--gf-fredoka), ${SANS}` },
  { id: "unbounded", name: "Unbounded", group: "sans", stack: `var(--gf-unbounded), ${SANS}` },

  { id: "kalam", name: "Kalam", group: "hand", stack: `var(--font-kalam), ${HAND}` },
  { id: "caveat", name: "Caveat", group: "hand", stack: `var(--gf-caveat), ${HAND}` },
  { id: "dancing", name: "Dancing Script", group: "hand", stack: `var(--gf-dancing), ${HAND}` },
  { id: "pacifico", name: "Pacifico", group: "hand", stack: `var(--gf-pacifico), ${HAND}` },
  { id: "great-vibes", name: "Great Vibes", group: "hand", stack: `var(--gf-great-vibes), ${HAND}` },
  { id: "sacramento", name: "Sacramento", group: "hand", stack: `var(--gf-sacramento), ${HAND}` },
  { id: "patrick", name: "Patrick Hand", group: "hand", stack: `var(--gf-patrick), ${HAND}` },
  { id: "shadows", name: "Shadows", group: "hand", stack: `var(--gf-shadows), ${HAND}` },
  { id: "indie", name: "Indie Flower", group: "hand", stack: `var(--gf-indie), ${HAND}` },
  { id: "apple", name: "Homemade Apple", group: "hand", stack: `var(--gf-apple), ${HAND}` },
  { id: "marker", name: "Marker", group: "hand", stack: `var(--gf-marker), ${HAND}` },
  { id: "yatra", name: "Yatra", group: "hand", stack: `var(--gf-yatra), ${HAND}` },

  { id: "abril", name: "Abril", group: "fun", stack: `var(--gf-abril), ${SERIF}` },
  { id: "lobster", name: "Lobster", group: "fun", stack: `var(--gf-lobster), ${HAND}` },
  { id: "righteous", name: "Righteous", group: "fun", stack: `var(--gf-righteous), ${SANS}` },
  { id: "bungee", name: "Bungee", group: "fun", stack: `var(--gf-bungee), ${SANS}` },
  { id: "amatic", name: "Amatic", group: "fun", stack: `var(--gf-amatic), ${HAND}` },
  { id: "baloo", name: "Baloo", group: "fun", stack: `var(--gf-baloo), ${SANS}` },

  { id: "plex-mono", name: "Plex Mono", group: "type", stack: `var(--font-plex-mono), ${MONO}` },
  { id: "space-mono", name: "Space Mono", group: "type", stack: `var(--gf-space-mono), ${MONO}` },
  { id: "special-elite", name: "Typewriter", group: "type", stack: `var(--gf-special-elite), ${MONO}` },
] as const satisfies readonly { id: string; name: string; group: FontGroup; stack: string }[];

export type FontId = (typeof fontCatalog)[number]["id"];

const byId = new Map<string, (typeof fontCatalog)[number]>(fontCatalog.map((f) => [f.id, f]));

export function catalogFont(id: string | undefined) {
  return id ? byId.get(id) : undefined;
}
