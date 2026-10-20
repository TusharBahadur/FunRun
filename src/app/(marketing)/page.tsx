import { Preloader } from "@/components/motion/preloader";
import { CallToAction } from "@/components/sections/call-to-action";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LoveNotes } from "@/components/sections/love-notes";
import { MarqueeBand } from "@/components/sections/marquee-band";
import { Statement } from "@/components/sections/statement";
import { TemplateShowcase } from "@/components/sections/template-showcase";
import { loveNotes } from "@/data/love-notes";
import { getTemplates, type Template } from "@/lib/templates";

export default async function HomePage() {
  const templates = await getTemplates();
  const pick = (slugs: string[]) =>
    slugs
      .map((slug) => templates.find((t) => t.slug === slug))
      .filter((t): t is Template => Boolean(t));

  return (
    <>
      <Preloader />
      <main>
        <Hero featured={pick(["sealed-with-love", "make-a-wish", "written-in-the-stars", "for-maa"])} />
        <MarqueeBand />
        <Statement />
        <TemplateShowcase templates={templates.filter((t) => t.level === "classic")} />
        <HowItWorks previews={pick(["little-bloom", "paper-hearts", "midnight-letter"])} />
        <Features />
        <LoveNotes notes={loveNotes} />
        <CallToAction />
      </main>
    </>
  );
}
