"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { RotatingWords } from "@/components/motion/rotating-words";
import { SplitText } from "@/components/motion/split-text";
import { TemplatePreview } from "@/components/templates/template-preview";
import { ButtonLink } from "@/components/ui/button";
import { EASE_OUT, INTRO_DELAY } from "@/lib/motion";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

const phrases = [
  "I love you",
  "I miss you",
  "thank you",
  "happy birthday",
  "I’m sorry",
  "marry me?",
];

const placements = [
  {
    className: "left-[3%] top-[18%] w-[clamp(120px,11vw,180px)]",
    rotate: -9,
    depth: 40,
  },
  {
    className: "left-[7%] bottom-[8%] w-[clamp(110px,9.5vw,155px)]",
    rotate: 7,
    depth: 70,
  },
  {
    className: "right-[3%] top-[15%] w-[clamp(120px,11.5vw,185px)]",
    rotate: 8,
    depth: 55,
  },
  {
    className: "right-[8%] bottom-[7%] w-[clamp(110px,9.5vw,155px)]",
    rotate: -6,
    depth: 30,
  },
];

export function Hero({ featured }: { featured: Template[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });

  return (
    <section
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-5 pb-10 pt-28 lg:pb-6 lg:pt-32"
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

      {featured.slice(0, placements.length).map((template, i) => (
        <FloatingCard
          key={template.slug}
          template={template}
          index={i}
          mx={smx}
          my={smy}
          progress={scrollYProgress}
          {...placements[i]}
        />
      ))}

      <motion.div
        style={{ y: titleY, opacity: titleOpacity, scale: titleScale }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <h1 className="text-[clamp(2.6rem,min(8vw,11svh),7.5rem)] type-display">
          <span className="block font-semibold">
            <SplitText text="Say" delay={INTRO_DELAY + 0.05} />
          </span>
          <span className="type-accent block text-[1.08em] leading-[1.02] text-rose">
            <RotatingWords words={phrases} startDelay={INTRO_DELAY + 0.2} />
          </span>
          <span className="block font-bold italic">
            <SplitText text="beautifully." delay={INTRO_DELAY + 0.35} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: INTRO_DELAY + 0.6,
            duration: 0.9,
            ease: EASE_OUT,
          }}
          className="type-copy mt-8 max-w-xl text-balance text-muted"
        >
          A little gift page, made for one person.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: INTRO_DELAY + 0.75,
            duration: 0.9,
            ease: EASE_OUT,
          }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Magnetic>
            <ButtonLink href="/templates" size="lg">
              Browse templates
            </ButtonLink>
          </Magnetic>
          <ButtonLink href="#how" variant="ghost" size="lg" icon={false}>
            See how it works
          </ButtonLink>
        </motion.div>

        {/* Phones and tablets: the floating cards become a little fanned hand of gifts under the buttons. */}
        <MobileFan templates={featured.slice(0, 3)} />
      </motion.div>

      <motion.div
        aria-hidden
        style={{ opacity: cueOpacity }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 [@media(min-height:960px)]:lg:block"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: INTRO_DELAY + 1.2 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="type-label text-[10px] text-muted">Scroll</span>
          <span className="relative h-10 w-px overflow-hidden bg-ink/10">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-rose"
              animate={{ y: ["-100%", "200%"] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

function FloatingCard({
  template,
  className,
  rotate,
  depth,
  index,
  mx,
  my,
  progress,
}: {
  template: Template;
  className: string;
  rotate: number;
  depth: number;
  index: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(() => my.get() * depth - progress.get() * depth * 5);
  const opacity = useTransform(progress, [0, 0.45], [1, 0]);

  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute hidden lg:block", className)}
      style={{ x, y, opacity }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: rotate * 2.5, y: 80 }}
        animate={{ opacity: 1, scale: 1, rotate, y: 0 }}
        transition={{
          duration: 1.3,
          ease: EASE_OUT,
          delay: INTRO_DELAY + 0.45 + index * 0.12,
        }}
      >
        <div
          className="animate-float rounded-[1.2rem] shadow-[0_30px_60px_-20px_rgba(27,18,21,0.35)]"
          style={{ animationDelay: `${index * -1.5}s` }}
        >
          <TemplatePreview template={template} className="rounded-[1.2rem]" />
        </div>
      </motion.div>
    </motion.div>
  );
}

const fan = [
  { rotate: -12, x: -86, y: 18 },
  { rotate: 0, x: 0, y: 0 },
  { rotate: 12, x: 86, y: 18 },
];

function MobileFan({ templates }: { templates: Template[] }) {
  return (
    // Tablets only: hidden on phones (kept the hero short), replaced by the
    // floating cards on desktop.
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
