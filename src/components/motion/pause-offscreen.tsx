"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * CSS loops are paused by a stylesheet rule (see `[data-offscreen]` in
 * globals.css), so hover-pauses and the like keep working. Motion's loops run
 * on the Web Animations API, and those we pause and resume by hand: only the
 * endless ones, and only the ones we paused ourselves.
 */
function motionLoops(root: Element | Document) {
  const all = root instanceof Document ? root.getAnimations() : root.getAnimations({ subtree: true });
  return all.filter(
    (a) =>
      !(typeof CSSAnimation !== "undefined" && a instanceof CSSAnimation) &&
      !(typeof CSSTransition !== "undefined" && a instanceof CSSTransition) &&
      a.effect?.getComputedTiming().iterations === Infinity &&
      a.playState === "running",
  );
}

/** Pauses every looping animation inside while the section is off screen, so only what you can see moves. */
export function PauseOffscreen({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined" || !el.getAnimations) return;
    let paused: Animation[] = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        const off = !entry.isIntersecting;
        el.toggleAttribute("data-offscreen", off);
        if (off) {
          paused = motionLoops(el);
          for (const a of paused) a.pause();
        } else {
          for (const a of paused) a.play();
          paused = [];
        }
      },
      // A little margin, so things are already moving as they arrive.
      { rootMargin: "150px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Pauses every looping animation on the page while the tab is hidden or minimised. */
export function usePauseWhenHidden() {
  useEffect(() => {
    if (typeof document === "undefined" || !document.getAnimations) return;
    let paused: Animation[] = [];
    const onChange = () => {
      const hidden = document.hidden;
      document.documentElement.toggleAttribute("data-tab-hidden", hidden);
      if (hidden) {
        paused = motionLoops(document);
        for (const a of paused) a.pause();
      } else {
        for (const a of paused) a.play();
        paused = [];
      }
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
}
