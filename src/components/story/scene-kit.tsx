"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Accented } from "@/components/experiences/birthday/accented";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { StoryPalette } from "./types";

export type StoryApi = {
  palette: StoryPalette;
  to: string;
  from: string;
  /** Replaces {to} and {from} in copy. */
  fill: (text: string) => string;
  /** Confetti for a payoff moment (candles out, a "yes"), from an element or the screen. Use sparingly. */
  celebrate: (from?: Element | null) => void;
  playSong: () => void;
  /** Back to the first scene, everything locked again. */
  restart: () => void;
  /** Template slug, for "make one for someone" links. */
  slug: string;
};

export const StoryContext = createContext<StoryApi | null>(null);

export function useStory() {
  const api = useContext(StoryContext);
  if (!api) throw new Error("Scenes must render inside <StoryPlayer>");
  return api;
}

/** Every scene gets its config, whether it's finished, and a way to finish it. */
export type SceneProps<S> = { scene: S; done: boolean; onDone: () => void };

/** Standard scene layout: eyebrow pill, headline, the playfield, then the hint. */
export function SceneShell({
  eyebrow,
  title,
  hint,
  doneText,
  done,
  children,
  className,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
  doneText?: string;
  done: boolean;
  children: ReactNode;
  className?: string;
  /** "dark" for scenes that paint their own dark backdrop. */
  tone?: "light" | "dark";
}) {
  const { palette, fill } = useStory();
  const accent = tone === "dark" ? palette.pink : palette.accent;
  return (
    <section
      className={cn(
        "relative mx-auto flex min-h-svh w-full max-w-2xl flex-col items-center px-5 pb-36 pt-24 text-center",
        className,
      )}
    >
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="type-label rounded-full border px-3 py-1 text-[10px]"
          style={{ borderColor: "currentColor", opacity: 0.75 }}
        >
          {fill(eyebrow)}
        </motion.span>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.08 }}
        className="type-display mt-4 text-balance text-[clamp(2.3rem,9vw,4.2rem)]"
      >
        <Accented text={fill(title)} color={accent} />
      </motion.h1>

      <div className="relative mt-8 flex w-full flex-1 flex-col items-center justify-center">{children}</div>

      <div className="mt-6 min-h-12">
        <AnimatePresence mode="wait">
          {done && doneText ? (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="type-accent text-2xl"
              style={{ color: accent }}
            >
              {fill(doneText)}
            </motion.p>
          ) : hint && !done ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
              className="type-label"
            >
              {fill(hint)}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

/** A full-bleed backdrop behind a scene (dark rooms, night skies). */
export function Backdrop({ color, children }: { color: string; children?: ReactNode }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

/** Pill button in the story's colours. */
export function StoryButton({
  children,
  onClick,
  variant = "solid",
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const { palette } = useStory();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 rounded-full px-6 text-[15px] font-medium transition-transform active:scale-95",
        variant === "outline" && "border",
        className,
      )}
      style={
        variant === "solid"
          ? { backgroundColor: palette.accent, color: palette.cream }
          : { borderColor: `${palette.fg}40`, color: palette.fg }
      }
    >
      {children}
    </button>
  );
}

/** Small "paper" card used by many scenes. */
export function Paper({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const { palette } = useStory();
  return (
    <div
      className={cn("rounded-[1.4rem] shadow-[0_24px_50px_-28px_rgba(27,18,21,0.5)]", className)}
      style={{ backgroundColor: palette.cream, color: palette.ink, ...style }}
    >
      {children}
    </div>
  );
}

/** Keeps a drag or hold on its element; harmless if the browser refuses. */
export function capturePointer(e: React.PointerEvent<Element>) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // Some browsers (and synthetic events) reject capture; the gesture still works.
  }
}

/**
 * Press-and-hold gesture. `progress` runs 0→1 while held and falls back when
 * released early; `onComplete` fires once when it reaches 1.
 */
export function useHold(durationMs: number, onComplete: () => void, disabled = false) {
  const [progress, setProgress] = useState(0);
  const holding = useRef(false);
  const value = useRef(0);
  const frame = useRef<number | null>(null);
  const fired = useRef(false);
  const complete = useRef(onComplete);
  useEffect(() => {
    complete.current = onComplete;
  }, [onComplete]);

  const loop = useCallback(() => {
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      value.current = Math.min(1, Math.max(0, value.current + (holding.current ? dt / durationMs : -dt / 400)));
      setProgress(value.current);
      if (value.current >= 1 && !fired.current) {
        fired.current = true;
        holding.current = false;
        complete.current();
        frame.current = null;
        return;
      }
      if (holding.current || value.current > 0) frame.current = requestAnimationFrame(step);
      else frame.current = null;
    };
    frame.current ??= requestAnimationFrame(step);
  }, [durationMs]);

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current);
  }, []);

  const start = () => {
    if (disabled || fired.current) return;
    holding.current = true;
    loop();
  };
  const stop = () => {
    holding.current = false;
  };

  return {
    progress,
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        capturePointer(e);
        start();
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onPointerLeave: stop,
      onKeyDown: (e: React.KeyboardEvent) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      },
      onKeyUp: stop,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
  };
}

/** A ring that fills with `progress` (0–1), drawn around its children. */
export function HoldRing({ progress, size, color, track }: { progress: number; size: number; color: string; track: string }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="pointer-events-none absolute inset-0 -rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - progress)}
      />
    </svg>
  );
}

/** A strip of washi tape, for sticking photos and notes to the page. */
export function Tape({ className, color, style }: { className?: string; color?: string; style?: React.CSSProperties }) {
  const { palette } = useStory();
  const c = color ?? palette.pink;
  return (
    <span
      aria-hidden
      className={cn("absolute h-6 w-20 opacity-85 shadow-[0_1px_2px_rgba(27,18,21,.12)]", className)}
      style={{
        backgroundColor: `${c}d9`,
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.35) 0 6px, transparent 6px 12px)",
        clipPath: "polygon(3% 0, 97% 4%, 100% 50%, 96% 100%, 2% 96%, 0 50%)",
        ...style,
      }}
    />
  );
}
