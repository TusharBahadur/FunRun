"use client";

import "lenis/dist/lenis.css";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { trackNavigations } from "@/lib/nav-history";

/**
 * App-wide client providers. Future auth/session, query-cache and toast
 * providers slot in here.
 */
export function Providers({ children }: { children: ReactNode }) {
  // Lets "Back" buttons know whether there's somewhere in the site to go back to.
  useEffect(() => trackNavigations(), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Phones and tablets scroll natively (Lenis doesn't smooth touch anyway);
    // skipping it there saves a never-ending animation loop on every page.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -24 } });
    let frame = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
