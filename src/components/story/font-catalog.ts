export type FontGroup = "sans" | "hand" | "fun" | "type";

export const fontGroups: { id: FontGroup; name: string }[] = [
  { id: "sans", name: "Clean" },
  { id: "hand", name: "Handwritten" },
  { id: "fun", name: "Fun" },
  { id: "type", name: "Typewriter" },
];

const SANS = "ui-sans-serif, system-ui, sans-serif";
const HAND = "ui-rounded, system-ui, sans-serif";
const MONO = "ui-monospace, monospace";

/**
 * Fonts a sender can pick for the whole gift or for a single line.
 * Faces are loaded in gift-font-faces.ts (preload: false) and attached in layout.
 * Thin italic serifs and script faces are kept off this list — they do not
 * belong on gift previews.
 */
export const fontCatalog = [
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
  { id: "patrick", name: "Patrick Hand", group: "hand", stack: `var(--gf-patrick), ${HAND}` },
  { id: "indie", name: "Indie Flower", group: "hand", stack: `var(--gf-indie), ${HAND}` },
  { id: "marker", name: "Marker", group: "hand", stack: `var(--gf-marker), ${HAND}` },
  { id: "yatra", name: "Yatra", group: "hand", stack: `var(--gf-yatra), ${HAND}` },

  { id: "lobster", name: "Lobster", group: "fun", stack: `var(--gf-lobster), ${HAND}` },
  { id: "righteous", name: "Righteous", group: "fun", stack: `var(--gf-righteous), ${SANS}` },
  { id: "bungee", name: "Bungee", group: "fun", stack: `var(--gf-bungee), ${SANS}` },
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
