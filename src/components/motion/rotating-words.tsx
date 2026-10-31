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

/** Cycles through phrases, each rising in as one piece. */
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
            exit={{
              y: "-35%",
              opacity: 0,
              transition: { duration: 0.35, ease: EASE_IN },
            }}
          >
            {/* The whole phrase moves as one: letter-by-letter looked like the
                text was still being built, and cost far more on phones. */}
            {started ? (
              <motion.span
                className="inline-block whitespace-pre"
                initial={{ y: "45%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              >
                {word}
              </motion.span>
            ) : (
              <span
                className="tt-css-reveal inline-block whitespace-pre"
                style={{ animation: `tt-rise-fade 0.75s cubic-bezier(0.22, 1, 0.36, 1) ${startDelay}s both` }}
              >
                {word}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
