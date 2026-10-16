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

/** Cycles through phrases with a per-letter rise-in. */
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
    const start = setTimeout(() => {
      setStarted(true);
      id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    }, startDelay * 1000);
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
      {!started && (
        <span aria-hidden className="invisible">
          {words[0]}
        </span>
      )}
      <AnimatePresence mode="wait">
        {started && (
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
            {Array.from(word).map((char, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ y: "70%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.75, ease: EASE_OUT, delay: i * 0.035 }}
              >
                {char === " " ? " " : char}
              </motion.span>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
