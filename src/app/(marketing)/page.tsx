import type { Metadata } from "next";
import { CallToAction } from "@/components/sections/call-to-action";
import { FeaturedTemplates } from "@/components/sections/featured-templates";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LoveNotes } from "@/components/sections/love-notes";
import { Showcase } from "@/components/sections/showcase";
import { occasions, siteConfig } from "@/config/site";
import { loveNotes } from "@/data/love-notes";
import { getTemplates, type Template } from "@/lib/templates";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Tells search engines who runs the site (brand name, logo, contact) and what
// the site is called, for the brand panel and sitelinks in results.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.svg`,
      email: siteConfig.contact.email,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.contact.email,
        telephone: `+${siteConfig.contact.whatsapp}`,
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "en-IN",
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ],
};

export default async function HomePage() {
  const templates = await getTemplates();
  const pick = (slugs: string[]) =>
    slugs
      .map((slug) => templates.find((t) => t.slug === slug))
      .filter((t): t is Template => Boolean(t));

  // One of each kind: the mid-size design for the first eight occasions
  // (two rows of four on desktop; phones and tablets show six).
  const featured = occasions
    .map((o) => templates.find((t) => t.occasion === o.id && t.level === "classic") ?? templates.find((t) => t.occasion === o.id))
    .filter((t): t is Template => Boolean(t))
    .slice(0, 8);

  return (
    <>
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <Hero featured={pick(["sealed-with-love", "make-a-wish", "our-corner", "midnight-notes"])} />
        <Showcase templates={pick([
            "little-sorry",
            "our-map",
            "make-a-wish",
            "white-flag",
            "sealed-with-love",
            "paper-hearts",
            "written-in-the-stars",
            "partner-in-crime",
            "make-it-right",
            "for-maa",
          ])} total={templates.length} />
        <FeaturedTemplates templates={featured} total={templates.length} />
        <HowItWorks />
        <Features />
        <LoveNotes notes={loveNotes} />
        <CallToAction />
      </main>
    </>
  );
}
