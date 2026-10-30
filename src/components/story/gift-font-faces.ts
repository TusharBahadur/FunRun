import {
  Baloo_2,
  Bricolage_Grotesque,
  Bungee,
  Caveat,
  Fredoka,
  Indie_Flower,
  Lobster,
  Outfit,
  Patrick_Hand,
  Permanent_Marker,
  Poppins,
  Quicksand,
  Righteous,
  Space_Grotesk,
  Space_Mono,
  Special_Elite,
  Unbounded,
  Yatra_One,
} from "next/font/google";

/*
 * Extra faces for gifts only. None are preloaded — the browser downloads a
 * family once some text on screen uses it. Only the gift and studio route
 * layouts import this (see src/app/for/layout.tsx), so the rest of the site
 * doesn't carry these @font-face rules. Never import it from client components.
 *
 * Thin italic serifs and script faces are not loaded: they do not belong
 * on gift previews.
 */

const poppins = Poppins({ subsets: ["latin", "latin-ext", "devanagari"], weight: ["400", "600"], variable: "--gf-poppins", preload: false, display: "swap" });
const outfit = Outfit({ subsets: ["latin", "latin-ext"], variable: "--gf-outfit", preload: false, display: "swap" });
const quicksand = Quicksand({ subsets: ["latin", "latin-ext"], variable: "--gf-quicksand", preload: false, display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--gf-space-grotesk", preload: false, display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--gf-bricolage", preload: false, display: "swap" });
const fredoka = Fredoka({ subsets: ["latin", "latin-ext"], variable: "--gf-fredoka", preload: false, display: "swap" });
const unbounded = Unbounded({ subsets: ["latin", "latin-ext"], variable: "--gf-unbounded", preload: false, display: "swap" });

const caveat = Caveat({ subsets: ["latin", "latin-ext"], variable: "--gf-caveat", preload: false, display: "swap" });
const patrick = Patrick_Hand({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--gf-patrick", preload: false, display: "swap" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--gf-marker", preload: false, display: "swap" });
const indie = Indie_Flower({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--gf-indie", preload: false, display: "swap" });
const yatra = Yatra_One({ subsets: ["latin", "latin-ext", "devanagari"], weight: "400", variable: "--gf-yatra", preload: false, display: "swap" });

const righteous = Righteous({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--gf-righteous", preload: false, display: "swap" });
const bungee = Bungee({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--gf-bungee", preload: false, display: "swap" });
const lobster = Lobster({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--gf-lobster", preload: false, display: "swap" });
const baloo = Baloo_2({ subsets: ["latin", "latin-ext", "devanagari"], variable: "--gf-baloo", preload: false, display: "swap" });

const spaceMono = Space_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], variable: "--gf-space-mono", preload: false, display: "swap" });
const specialElite = Special_Elite({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--gf-special-elite", preload: false, display: "swap" });

export const giftFontVariables = [
  poppins, outfit, quicksand, spaceGrotesk, bricolage, fredoka, unbounded,
  caveat, patrick, marker, indie, yatra,
  righteous, bungee, lobster, baloo,
  spaceMono, specialElite,
]
  .map((f) => f.variable)
  .join(" ");
