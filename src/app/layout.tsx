import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Inter_Tight, Kalam } from "next/font/google";
import { Suspense } from "react";
import { Cursor } from "@/components/motion/cursor";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import "./globals.css";

/*
 * The TyniTales type system: three families, one job each, plus a handwriting
 * face used only inside gifts. Hindi text falls
 * back to the device's own Devanagari font (every modern phone ships one).
 * See .claude/skills/tynitales-typography/SKILL.md before adding anything.
 */

// Voice: headlines, body and interface.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"], // latin-ext carries the ₹ sign
  style: ["normal", "italic"],
});

// Heart: the wordmark, highlighted words and gift card text. One variable file
// covers every serif look (classic, soft, playful) through its SOFT/WONK/opsz axes.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"], // latin-ext carries the ₹ sign
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

// Utility: small uppercase labels only.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"], // latin-ext carries the ₹ sign
  weight: ["400", "500"],
});

// Hand: handwritten captions, notes and signatures inside gifts — the human touch.
// Also writes Hindi. Not preloaded: only gift pages use it.
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin", "latin-ext", "devanagari"],
  weight: ["400", "700"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: "#f5efe6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${fraunces.variable} ${plexMono.variable} ${kalam.variable} antialiased`}
    >
      <body className="min-h-svh bg-cream font-sans text-ink">
        <Providers>{children}</Providers>
        {/* The cursor reads the URL, so it can't block pages from pre-rendering. */}
        <Suspense fallback={null}>
          <Cursor />
        </Suspense>
        <div
          aria-hidden
          className="grain pointer-events-none fixed inset-0 z-[70] opacity-[0.05]"
        />
      </body>
    </html>
  );
}
