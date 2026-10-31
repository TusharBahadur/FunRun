"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RotatingWords } from "@/components/motion/rotating-words";
import { SplitText } from "@/components/motion/split-text";
import { TemplatePreview } from "@/components/templates/template-preview";
import { ButtonLink } from "@/components/ui/button";
import { EASE_OUT, INTRO_DELAY } from "@/lib/motion";
import type { Template } from "@/lib/templates";

/**
 * Each entry: the phrase shown in the headline, and the template slug whose
 * card appears on the right (desktop only). Order here drives both.
 */
const entries: { phrase: string; slug: string }[] = [
  { phrase: "I love you",            slug: "sealed-with-love" },
  { phrase: "happy birthday",        slug: "make-a-wish" },
  { phrase: "I miss you",            slug: "midnight-notes" },
  { phrase: "thank you",             slug: "paper-hearts" },
  { phrase: "I'm sorry",             slug: "little-sorry" },
  { phrase: "marry me?",             slug: "written-in-the-stars" },
  { phrase: "you're my person",      slug: "our-corner" },
  { phrase: "forever yours",         slug: "forever-yours" },
  { phrase: "still thinking of you", slug: "still-you" },
];

const INTERVAL = 1800; // ms per phrase

export function Hero({ featured }: { featured: Template[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY       = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const titleScale   = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % entries.length), INTERVAL);
    return () => clearInterval(id);
  }, []);

  const activeTemplate = featured.find((t) => t.slug === entries[index].slug) ?? featured[0];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-5 pb-8 pt-24 md:pt-28 lg:pt-32"
    >
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-[45%] size-[70vw] max-h-[900px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-blush),transparent)] will-change-transform"
          animate={{ scale: [1, 1.15, 1], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[10%] top-[10%] size-[30vw] max-w-[420px] rounded-full bg-[radial-gradient(closest-side,#f8dc8c,transparent)] opacity-30 will-change-transform"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Desktop: two-column ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto hidden max-w-6xl items-center gap-12 lg:flex xl:gap-20">

        {/* Left: headline + CTA */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity, scale: titleScale }}
          className="flex flex-1 flex-col items-start"
        >
          <h1 className="text-[clamp(2.8rem,5.5vw,6rem)] type-display">
            <span className="block font-semibold">
              <SplitText text="Say" delay={INTRO_DELAY + 0.05} immediate />
            </span>
            <span className="type-accent block text-[1.08em] leading-[1.02] text-rose">
              <RotatingWords
                words={entries.map((e) => e.phrase)}
                interval={INTERVAL}
                startDelay={INTRO_DELAY + 0.2}
              />
            </span>
            <span className="block font-bold italic">
              <SplitText text="beautifully." delay={INTRO_DELAY + 0.35} immediate />
            </span>
          </h1>

          <p
            className="tt-css-reveal type-copy mt-5 max-w-sm text-balance text-muted"
            style={{ animation: `tt-fade-up 0.9s cubic-bezier(0.22,1,0.36,1) ${INTRO_DELAY + 0.6}s both` }}
          >
            A little gift page, made for one person.
          </p>

          <div
            className="tt-css-reveal mt-8 flex flex-wrap items-center gap-3"
            style={{ animation: `tt-fade-up 0.9s cubic-bezier(0.22,1,0.36,1) ${INTRO_DELAY + 0.75}s both` }}
          >
            <ButtonLink href="/templates" size="lg">Browse templates</ButtonLink>
            <ButtonLink href="#how" variant="ghost" size="lg" icon={false}>See how it works</ButtonLink>
          </div>
        </motion.div>

        {/* Right: template card crossfading with the active phrase */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity, scale: titleScale }}
          className="relative w-[260px] shrink-0 xl:w-[300px]"
          aria-hidden
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTemplate?.slug ?? index}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="pointer-events-none"
            >
              {activeTemplate && (
                <div className="rounded-[2rem] shadow-[0_36px_64px_-24px_rgba(27,18,21,0.38),0_8px_20px_-6px_rgba(27,18,21,0.14)]">
                  <TemplatePreview template={activeTemplate} className="rounded-[2rem]" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Template name label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`label-${index}`}
              className="mt-3 text-center text-[0.72rem] uppercase tracking-wide text-muted/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTemplate?.name}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Mobile / tablet: centred layout ─────────────────────────────── */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity, scale: titleScale }}
        className="relative z-10 flex flex-col items-center text-center lg:hidden"
      >
        <h1 className="text-[clamp(2.6rem,min(8vw,11svh),7.5rem)] type-display">
          <span className="block font-semibold">
            <SplitText text="Say" delay={INTRO_DELAY + 0.05} immediate />
          </span>
          <span className="type-accent block text-[1.08em] leading-[1.02] text-rose">
            <RotatingWords
              words={entries.map((e) => e.phrase)}
              interval={INTERVAL}
              startDelay={INTRO_DELAY + 0.2}
            />
          </span>
          <span className="block font-bold italic">
            <SplitText text="beautifully." delay={INTRO_DELAY + 0.35} immediate />
          </span>
        </h1>

        <p
          className="tt-css-reveal type-copy mt-5 max-w-xl text-balance text-muted md:mt-8"
          style={{ animation: `tt-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${INTRO_DELAY + 0.6}s both` }}
        >
          A little gift page, made for one person.
        </p>

        <div
          className="tt-css-reveal mt-8 flex flex-col items-center gap-3 sm:flex-row md:mt-10"
          style={{ animation: `tt-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${INTRO_DELAY + 0.75}s both` }}
        >
          <ButtonLink href="/templates" size="lg">Browse templates</ButtonLink>
          <ButtonLink href="#how" variant="ghost" size="lg" icon={false}>See how it works</ButtonLink>
        </div>

        {/* Tablet fan */}
        <MobileFan templates={featured.slice(0, 3)} />
      </motion.div>
    </section>
  );
}

const fan = [
  { rotate: -12, x: -86, y: 18 },
  { rotate: 0,   x: 0,   y: 0  },
  { rotate: 12,  x: 86,  y: 18 },
];

function MobileFan({ templates }: { templates: Template[] }) {
  return (
    <div aria-hidden className="pointer-events-none relative mt-14 hidden h-[300px] w-full max-w-[360px] md:block lg:hidden">
      <div className="absolute inset-0 origin-top scale-[1.42]">
        {templates.map((t, i) => (
          <motion.div
            key={t.slug}
            className="absolute left-1/2 top-0 -ml-[66px] w-[132px]"
            style={{ zIndex: i === 1 ? 2 : 1 }}
            initial={{ opacity: 0, y: 60, rotate: 0, x: 0 }}
            animate={{ opacity: 1, y: fan[i].y, rotate: fan[i].rotate, x: fan[i].x }}
            transition={{ duration: 1.1, ease: EASE_OUT, delay: INTRO_DELAY + 0.9 + i * 0.1 }}
          >
            <div
              className="animate-float rounded-[1.1rem] shadow-[0_24px_40px_-18px_rgba(27,18,21,0.45)]"
              style={{ animationDelay: `${i * -1.7}s` }}
            >
              <TemplatePreview template={t} className="rounded-[1.1rem]" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
