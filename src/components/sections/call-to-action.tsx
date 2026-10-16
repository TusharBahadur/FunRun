"use client";

import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitText } from "@/components/motion/split-text";
import { ButtonLink } from "@/components/ui/button";

// Deterministic so server and client render identically.
const hearts = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  size: 10 + ((i * 7) % 20),
  duration: 7 + ((i * 3) % 6),
  delay: (i * 0.85) % 7,
}));

export function CallToAction() {
  return (
    <section className="px-3 pb-3 sm:px-5">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-rose-deep px-6 py-28 text-center text-paper md:py-40">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {hearts.map((h, i) => (
            <motion.span
              key={i}
              className="absolute -bottom-10 text-paper/30"
              style={{ left: `${h.left}%` }}
              animate={{ y: [0, -760], opacity: [0, 1, 0], rotate: [0, i % 2 ? 25 : -25] }}
              transition={{ duration: h.duration, repeat: Infinity, delay: h.delay, ease: "easeOut" }}
            >
              <Heart className="fill-current" style={{ width: h.size, height: h.size }} />
            </motion.span>
          ))}
        </div>

        <div className="relative">
          <p className="type-label text-paper/70">
            Ready when you are
          </p>
          <h2 className="mx-auto mt-6 max-w-4xl text-[clamp(2.8rem,8vw,7.5rem)] type-display">
            <SplitText text="Someone’s waiting" />{" "}
            <SplitText
              text="to hear it."
              className="type-accent text-ink"
              delay={0.2}
            />
          </h2>
          <p className="type-copy mx-auto mt-8 max-w-md text-paper/80">
            Pick a template, pour your heart in, and send it in the next ten minutes.
          </p>
          <div className="mt-10">
            <Magnetic>
              <ButtonLink href="/templates" variant="light" size="lg">
                Start gifting
              </ButtonLink>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
