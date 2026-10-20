"use client";

import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SplitText } from "@/components/motion/split-text";
import { TemplateCard } from "@/components/templates/template-card";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Template } from "@/lib/templates";

const cardWidth = "w-[min(64vw,340px,40svh)] shrink-0";

/** Pinned section that converts vertical scroll into a horizontal gallery. */
export function TemplateShowcase({ templates }: { templates: Template[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const distance = useMotionValue(0);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const d = Math.max(0, track.scrollWidth - window.innerWidth);
      distance.set(d);
      setHeight(d);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [distance]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * distance.get());

  return (
    <section
      id="templates"
      ref={sectionRef}
      className="relative bg-ink text-cream"
      style={{ height: height === null ? "300vh" : `calc(100svh + ${height}px)` }}
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-7xl items-end justify-between gap-6 px-5">
          <div>
            <Eyebrow index="02" className="text-cream/50">
              The collection
            </Eyebrow>
            <h2 className="mt-4 text-[clamp(2.2rem,5vw,4.75rem)] type-display">
              <SplitText text="Templates for" />{" "}
              <SplitText
                text="every kind of love."
                className="type-accent text-blush"
                delay={0.15}
              />
            </h2>
          </div>
          <ButtonLink href="/templates" variant="light" className="hidden md:inline-flex">
            View all
          </ButtonLink>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max gap-6 px-5 lg:px-[max(1.25rem,calc((100vw-80rem)/2+1.25rem))]"
        >
          {templates.map((t) => (
            <TemplateCard key={t.slug} template={t} className={cardWidth} />
          ))}
          <div className={cardWidth}>
            <Link
              href="/templates"
              className="group grid aspect-[3/4] place-items-center rounded-[1.75rem] border border-dashed border-cream/20 p-8 text-center transition-colors hover:border-rose hover:bg-rose/10"
            >
              <span>
                <span className="type-display block text-4xl">
                  More arriving every week
                </span>
                <span className="mt-4 inline-block text-sm text-cream/60 transition-colors group-hover:text-cream">
                  Browse all templates →
                </span>
              </span>
            </Link>
          </div>
        </motion.div>

        <div className="mx-auto mt-10 w-full max-w-7xl px-5">
          <div className="h-px w-full bg-cream/10">
            <motion.div style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-rose" />
          </div>
        </div>
      </div>
    </section>
  );
}
