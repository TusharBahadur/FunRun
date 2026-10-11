"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function Typewriter({ text, speed = 42 }: { text: string; speed?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [inView, speed, text.length]);

  return (
    <span ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{text.slice(0, count)}</span>
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.9em] w-[2px] animate-blink bg-rose align-[-0.1em]"
      />
    </span>
  );
}
