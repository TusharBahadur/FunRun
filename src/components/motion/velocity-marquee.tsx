"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

type VelocityMarqueeProps = {
  children: ReactNode;
  /** Percent of one copy's width per second. Negative flips direction. */
  baseVelocity?: number;
  /** Lean the text with scroll velocity. */
  skew?: boolean;
  className?: string;
};

/** Infinite ticker that speeds up, reverses and skews with scroll velocity. */
export function VelocityMarquee({ children, baseVelocity = 3, skew = true, className }: VelocityMarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 2.5], { clamp: false });
  const skewX = useTransform(smooth, [-3000, 0, 3000], [8, 0, -8]);
  const x = useTransform(baseX, (v) => `${wrap(-50, -25, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = direction.current * -baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    moveBy += direction.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cn("flex overflow-hidden whitespace-nowrap", className)}>
      <motion.div className="flex flex-nowrap whitespace-nowrap" style={{ x, skewX: skew ? skewX : 0 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} aria-hidden={i > 0} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
