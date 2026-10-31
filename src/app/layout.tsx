import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Inter_Tight, Kalam } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
// Fonts: only the latin files are preloaded (they cover nearly every page).
// latin-ext (the ₹ sign) and devanagari still load on their own, the moment a
// page actually uses one of those characters.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Heart: the wordmark, highlighted words and gift card text. One variable file
// covers every serif look (classic, soft, playful) through its SOFT/WONK/opsz axes.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  // Not preloaded: with its axes the two files are ~264 KB, which on a slow
  // phone held back the first paint (LCP). Text shows in a size-matched
  // fallback serif for a moment, then swaps in.
  preload: false,
});

// Utility: small uppercase labels only.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  preload: false, // tiny labels only; swaps in a moment later
});

// Hand: handwritten captions, notes and signatures inside gifts — the human touch.
// Also writes Hindi.
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin", "latin-ext", "devanagari"],
  weight: ["400", "700"],
  preload: false, // only used inside gifts; not worth delaying every page for
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: { type: "website", siteName: siteConfig.name, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  // Set these in Vercel to verify the site in Google Search Console and Bing
  // Webmaster Tools (the "HTML tag" method: paste only the content="…" value).
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
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
        {/* Real-visitor performance data in the Vercel dashboard (Speed Insights). */}
        <SpeedInsights />
        <div
          aria-hidden
          className="grain pointer-events-none fixed inset-0 z-[70] opacity-[0.05]"
        />
      </body>
    </html>
  );
}
