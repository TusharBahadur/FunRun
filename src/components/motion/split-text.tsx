"use client";

import { motion, useInView } from "motion/react";
import { Fragment, useRef } from "react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SplitTextProps = {
  text: string;
  className?: string;
  /** Seconds before the first piece starts moving. */
  delay?: number;
  stagger?: number;
  /** Reveal word by word (default) or letter by letter. */
  by?: "word" | "char";
};

/** Masked "rise from below" reveal, triggered when scrolled into view. */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  by = "word",
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const words = text.split(" ");
  let index = 0;

  return (
    <span ref={ref} className={cn("inline", className)}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {(by === "char" ? Array.from(word) : [word]).map((part, p) => {
              const i = index++;
              return (
                <span
                  key={p}
                  className="-mb-[0.12em] -mr-[0.06em] inline-block overflow-y-clip pr-[0.06em] pb-[0.12em]"
                >
                  <motion.span
                    className="inline-block origin-bottom-left will-change-transform"
                    initial={{ y: "115%", rotate: 5 }}
                    animate={inView ? { y: "0%", rotate: 0 } : undefined}
                    transition={{ duration: 1, ease: EASE_OUT, delay: delay + i * stagger }}
                  >
                    {part}
                  </motion.span>
                </span>
              );
            })}
          </span>
          {w < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}
