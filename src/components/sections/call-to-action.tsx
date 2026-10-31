"use client";

import type { CSSProperties } from "react";
import { Heart } from "lucide-react";
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
    <section className="px-3 pb-3 pt-14 sm:px-5 md:pt-20">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-rose-deep px-6 py-28 text-center text-paper md:py-40">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {hearts.map((h, i) => (
            <span
              key={i}
              className="tt-loop absolute -bottom-10 text-paper/30 opacity-0"
              style={{ left: `${h.left}%`, "--turn": `${i % 2 ? 25 : -25}deg`, animation: `tt-heart-rise ${h.duration}s ease-out ${h.delay}s infinite` } as CSSProperties}
            >
              <Heart className="fill-current" style={{ width: h.size, height: h.size }} />
            </span>
          ))}
        </div>

        <div className="relative">
          <p className="type-label text-paper/90">
            Ready when you are
          </p>
          <h2 className="mx-auto mt-5 max-w-4xl text-[clamp(2.8rem,8vw,7.5rem)] type-display">
            <SplitText text="Someone’s waiting" />{" "}
            <SplitText
              text="to hear it."
              className="type-accent text-ink"
              delay={0.2}
            />
          </h2>
          <p className="type-copy mx-auto mt-4 max-w-md text-paper/80 md:mt-6">
            Pick a template, pour your heart in, and send it in the next ten minutes.
          </p>
          <div className="mt-8 md:mt-10">
            <ButtonLink href="/templates" variant="light" size="lg">
              Start gifting
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
