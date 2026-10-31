"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: ReactNode;
  reverse?: boolean;
  /** Seconds for one full loop (phones go about 40% slower, see --marquee-pace). */
  duration?: number;
  className?: string;
  /** Fade the left and right edges into the page. On by default. */
  fade?: boolean;
};

/**
 * Pure-CSS infinite marquee with edge fade; pauses on hover, and whenever
 * it's off screen so phones don't keep animating it while you read elsewhere.
 */
export function Marquee({ children, reverse, duration = 40, className, fade = true }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "group flex overflow-hidden",
        fade && "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
      style={{ "--duration": `${duration}s` } as CSSProperties}
    >
      <div
        className={cn(
          // Its own GPU layer: moving it never repaints the cards.
          "flex w-max shrink-0 animate-marquee will-change-transform group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
          !onScreen && "marquee-paused",
        )}
      >
        <div className="flex shrink-0 gap-5 pr-5">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-5 pr-5">
          {children}
        </div>
      </div>
    </div>
  );
}
