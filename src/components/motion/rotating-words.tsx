"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE_IN, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RotatingWordsProps = {
  words: string[];
  interval?: number;
  /** Seconds before the first word appears. */
  startDelay?: number;
  className?: string;
};

/** Cycles through phrases, cross-fading each one in place. */
export function RotatingWords({
  words,
  interval = 2600,
  startDelay = 0,
  className,
}: RotatingWordsProps) {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const seen = useRef(true);

  // No point swapping phrases nobody can see (scrolled past, or another tab).
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      seen.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    // The first phrase plays with CSS straight away (see below), from the very
    // first paint; JavaScript takes over from the second phrase onwards.
    const start = setTimeout(() => {
      setStarted(true);
      setIndex(1 % words.length);
      id = setInterval(() => {
        if (document.hidden || !seen.current) return;
        setIndex((i) => (i + 1) % words.length);
      }, interval);
    }, startDelay * 1000 + interval);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [interval, startDelay, words.length]);

  const word = words[index];

  return (
    <span
      ref={box}
      className={cn(
        "relative -mb-[0.14em] inline-flex justify-center overflow-y-clip pb-[0.14em]",
        className,
      )}
    >
      <span className="sr-only">{words[0]}</span>
      <AnimatePresence mode="wait">
        {(
          <motion.span
            key={word}
            aria-hidden
            className="-mx-[0.15em] inline-flex px-[0.15em]"
            exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_IN } }}
          >
            {/* The phrase cross-fades in place. Sliding it up made it overlap the
                line below for a moment, so the headline looked like it was shifting. */}
            {started ? (
              // Padding (cancelled by the negative margin) gives the italic overhang
              // room: while fading, the phrase is its own layer cut to its box, so
              // the tip of a slanted "?" was clipped until the fade finished.
              <motion.span
                className="-mx-[0.15em] inline-block whitespace-pre px-[0.15em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                {word}
              </motion.span>
            ) : (
              <span className="-mx-[0.15em] inline-block whitespace-pre px-[0.15em]">
                {word}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
