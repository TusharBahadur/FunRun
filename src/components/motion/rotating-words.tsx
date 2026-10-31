"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    // The first phrase plays with CSS straight away (see below), from the very
    // first paint; JavaScript takes over from the second phrase onwards.
    const start = setTimeout(() => {
      setStarted(true);
      setIndex(1 % words.length);
      id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    }, startDelay * 1000 + interval);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [interval, startDelay, words.length]);

  const word = words[index];

  return (
    <span
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
            className="inline-flex"
            exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_IN } }}
          >
            {/* The phrase cross-fades in place. Sliding it up made it overlap the
                line below for a moment, so the headline looked like it was shifting. */}
            {started ? (
              <motion.span
                className="inline-block whitespace-pre"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                {word}
              </motion.span>
            ) : (
              <span className="inline-block whitespace-pre">
                {word}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
