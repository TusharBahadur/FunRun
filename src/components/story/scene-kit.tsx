"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Accented } from "@/components/experiences/birthday/accented";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { catalogFont, type FontId } from "./font-catalog";
import type { LayerPosition, StoryPalette } from "./types";

/** Fonts the sender picked for this page, keyed by field or `field:item`. */
export const SceneFontsContext = createContext<Partial<Record<string, FontId>> | undefined>(undefined);

/** Positions and lock states for child layers on this page, keyed by field or field:item. */
export const ScenePositionsContext = createContext<Record<string, LayerPosition> | undefined>(undefined);

export function fontKey(field: string, item?: number | null) {
  return item == null ? field : `${field}:${item}`;
}

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

/** Studio edit-mode: tapping copy in the preview selects the matching field. */
export type StudioPick = { field?: string | null; item?: number | null; index?: number };
export type StudioEdit = {
  pick: { field?: string | null; item?: number | null };
  onPick: (next: StudioPick) => void;
  onPositionChange?: (key: string, pos: { x: number; y: number }) => void;
};
export const StudioEditContext = createContext<StudioEdit | null>(null);

export function useStudioEdit() {
  return useContext(StudioEditContext);
}

/** Page-by-page gifts: the in-scene button that turns to the next page. */
export type TurnApi = {
  label: string | null;
  ready: boolean;
  onContinue: () => void;
  /** Last page: replay instead of turning forward. */
  again?: boolean;
};
export const TurnContext = createContext<TurnApi | null>(null);

export function TurnButton({ className }: { className?: string }) {
  const turn = useContext(TurnContext);
  const studio = useStudioEdit();
  const { palette } = useStory();
  if (studio || !turn?.label || !turn.ready) return null;
  return (
    <motion.button
      type="button"
      onClick={turn.onContinue}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.15 }}
      className={cn(
        "mt-8 inline-flex h-14 items-center gap-2.5 rounded-full px-8 text-[13px] font-semibold uppercase tracking-[0.16em] shadow-[0_16px_32px_-16px_rgba(27,18,21,.5)] transition-transform active:scale-95",
        className,
      )}
      style={{ backgroundColor: palette.accent, color: palette.cream }}
    >
      {turn.again && <RotateCcw className="size-4" strokeWidth={2.5} aria-hidden />}
      {turn.label}
      {!turn.again && <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />}
    </motion.button>
  );
}

/**
 * Studio: the gift is a picture to edit, not a game to play. Every tap selects
 * the part under it, and never reaches the scene, so nothing pops, opens or
 * swipes away. Pass-through outside the studio.
 */
export function StudioSurface({ children }: { children: ReactNode }) {
  const studio = useStudioEdit();
  if (!studio) return children;
  return (
    <div
      onPointerDownCapture={(e) => {
        const target = e.target as Element;
        if (target.closest("[data-studio-unlocked]")) {
          return;
        }
        e.stopPropagation();
      }}
      onPointerUpCapture={(e) => {
        const target = e.target as Element;
        if (target.closest("[data-studio-unlocked]")) {
          return;
        }
        e.stopPropagation();
      }}
      onKeyDownCapture={(e) => {
        if (e.key === " " || e.key === "Enter") e.stopPropagation();
      }}
      onClickCapture={(e) => {
        const target = e.target as Element;
        const hit = target.closest("[data-studio-field]");
        const sceneEl = target.closest("[data-studio-scene]");
        const index = sceneEl ? Number(sceneEl.getAttribute("data-studio-scene")) : NaN;
        const item = hit?.getAttribute("data-studio-item");
        if (hit) {
          e.preventDefault();
          e.stopPropagation();
          studio.onPick({
            field: hit.getAttribute("data-studio-field") ?? null,
            item: item ? Number(item) : null,
            index: Number.isFinite(index) ? index : undefined,
          });
        }
      }}
    >
      {children}
    </div>
  );
}

/** Studio: which item of a list is selected, if the selection is one of `fields`. */
export function usePickedItem(fields: string[]) {
  const studio = useStudioEdit();
  const { field, item } = studio?.pick ?? {};
  return field && fields.includes(field) && typeof item === "number" ? item : null;
}

/** Studio only: numbered tabs for scenes that show one item at a time. */
export function StudioPager({ count, field, current }: { count: number; field: string; current: number }) {
  const studio = useStudioEdit();
  const { palette } = useStory();
  if (!studio || count < 2) return null;
  return (
    <div className="mt-5 flex flex-wrap justify-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          data-studio-field={field}
          data-studio-item={i}
          className="grid size-8 cursor-pointer place-items-center rounded-full text-xs font-semibold tabular-nums"
          style={
            i === current
              ? { backgroundColor: palette.accent, color: palette.cream }
              : { boxShadow: `inset 0 0 0 1.5px ${palette.fg}40`, color: palette.fg }
          }
        >
          {i + 1}
        </span>
      ))}
    </div>
  );
}

/** Studio only: copy the gift shows in another moment (after a "yes", once lit), shown alongside. */
export function StudioAlso({ label, field, item, children }: { label: string; field: string; item?: number; children: ReactNode }) {
  const studio = useStudioEdit();
  if (!studio) return null;
  return (
    <div className="mt-6 w-full max-w-sm">
      <p className="type-label mb-1.5 text-[10px] opacity-50">{label}</p>
      <StudioHit field={field} item={item} className="mx-auto w-fit">
        {children}
      </StudioHit>
    </div>
  );
}

/** Marks a piece of the gift as tappable in the studio preview. No-op outside the studio. */
export function StudioHit({
  field,
  item,
  children,
  className,
  as: Tag = "div",
}: {
  field: string;
  item?: number;
  children: ReactNode;
  className?: string;
  as?: "span" | "div";
}) {
  const studio = useStudioEdit();
  const fonts = useContext(SceneFontsContext);
  const positions = useContext(ScenePositionsContext);
  const posKey = item != null ? `${field}:${item}` : field;
  const pos = positions?.[posKey];
  const isUnlocked = pos?.locked === false;

  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  const curX = dragOffset ? dragOffset.x : (pos?.x ?? 0);
  const curY = dragOffset ? dragOffset.y : (pos?.y ?? 0);
  const transformStyle = curX !== 0 || curY !== 0 ? `translate3d(${curX}px, ${curY}px, 0)` : undefined;

  const face = catalogFont((item != null && fonts?.[fontKey(field, item)]) || fonts?.[field]);
  const fontStyle: CSSProperties = {
    ...(face ? { "--field-face": face.stack, fontFamily: face.stack, fontVariationSettings: "normal" } : {}),
    ...(transformStyle ? { transform: transformStyle } : {}),
    ...(isUnlocked ? { touchAction: "none", userSelect: "none" } : {}),
  };

  const on = !!studio && studio.pick.field === field && (item === undefined ? studio.pick.item == null : studio.pick.item === item);
  // Nothing to edit or restyle: skip the wrapper, but keep any spacing or
  // layout classes it was given (a gap above the options, say).
  if (!studio && !face && !transformStyle) return className ? <Tag className={className}>{children}</Tag> : children;

  const onPointerDown = isUnlocked && studio ? (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    studio.onPick({ field, item });

    const elem = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    try {
      elem.setPointerCapture(pointerId);
    } catch {}

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = pos?.x ?? 0;
    const startY = pos?.y ?? 0;
    let latestX = startX;
    let latestY = startY;

    const onPointerMove = (ev: PointerEvent) => {
      ev.preventDefault();
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;
      latestX = Math.round(Math.max(-250, Math.min(250, startX + dx)));
      latestY = Math.round(Math.max(-250, Math.min(250, startY + dy)));
      setDragOffset({ x: latestX, y: latestY });
    };

    const onPointerUp = (ev: PointerEvent) => {
      ev.preventDefault();
      try {
        elem.releasePointerCapture(pointerId);
      } catch {}
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      setDragOffset(null);
      studio.onPositionChange?.(posKey, { x: latestX, y: latestY });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  } : undefined;

  return (
    <Tag
      data-studio-field={studio ? field : undefined}
      data-studio-item={studio ? item : undefined}
      data-field-font={face ? "" : undefined}
      data-studio-unlocked={isUnlocked ? "" : undefined}
      onPointerDown={onPointerDown}
      style={fontStyle}
      className={cn(
        "max-w-full",
        Tag === "span" && "inline-block",
        studio && "pointer-events-auto cursor-pointer rounded-[0.65rem] transition-[box-shadow,background-color]",
        on && "bg-white/15 shadow-[0_0_0_2px_#e23b54,0_0_0_6px_rgba(226,59,84,.35)]",
        studio && !on && "hover:shadow-[0_0_0_1.5px_rgba(255,255,255,.7)]",
        studio && isUnlocked && "ring-2 ring-amber-500 ring-offset-2 ring-offset-paper/60 cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

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
  titleField = "title",
  layout = "stage",
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
  /** Studio: which field the headline maps to (e.g. "reveal" after a game). */
  titleField?: string;
  /** "stack" sits the playfield under a smaller title — quizzes, calls. */
  layout?: "stage" | "stack";
}) {
  const { palette, fill } = useStory();
  const studio = useStudioEdit();
  const accent = tone === "dark" ? palette.pink : palette.accent;
  const stacked = layout === "stack";
  return (
    <section
      className={cn(
        "relative mx-auto flex min-h-svh w-full max-w-2xl flex-col items-center px-5 text-center",
        stacked ? "pb-28 pt-16" : "pb-24 pt-24",
        className,
      )}
    >
      <div className={cn("flex flex-col items-center", stacked ? "gap-3" : "gap-7")}>
        {eyebrow && (
          <StudioHit field="eyebrow" className="mx-auto w-fit">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="type-label inline-block rounded-full border px-3.5 py-1.5"
              style={{ borderColor: "currentColor", opacity: 0.7 }}
            >
              {fill(eyebrow)}
            </motion.span>
          </StudioHit>
        )}
        <StudioHit field={titleField} className="mx-auto w-fit">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.08 }}
            className={cn(
              "type-display text-balance",
              stacked ? "max-w-[18rem] text-[clamp(1.7rem,7vw,2.7rem)] leading-[1.12]" : "text-[clamp(2.3rem,9vw,4.2rem)]",
            )}
          >
            <Accented text={fill(title)} color={accent} face="sans" />
          </motion.h1>
        </StudioHit>
      </div>

      <div
        className={cn(
          "relative flex w-full flex-col items-center",
          stacked ? "mt-6" : "mt-8 flex-1 justify-center",
        )}
      >
        {children}
      </div>

      {studio ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          {hint && (
            <StudioHit field="hint" className="mx-auto w-fit">
              <p className="type-label opacity-70">{fill(hint)}</p>
            </StudioHit>
          )}
          {doneText && (
            <StudioHit field="done" className="mx-auto w-fit">
              <p className="type-display text-2xl font-semibold" style={{ color: accent }}>
                {fill(doneText)}
              </p>
            </StudioHit>
          )}
        </div>
      ) : (
      <div className="mt-6 flex min-h-12 flex-col items-center">
        <AnimatePresence mode="wait">
          {done && doneText ? (
            <StudioHit key="done" field="done" className="mx-auto w-fit">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="type-display text-2xl font-semibold"
                style={{ color: accent }}
              >
                {fill(doneText)}
              </motion.p>
            </StudioHit>
          ) : hint && !done ? (
            <StudioHit key="hint" field="hint" className="mx-auto w-fit">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6 }}
                className="type-label"
              >
                {fill(hint)}
              </motion.p>
            </StudioHit>
          ) : null}
        </AnimatePresence>
        <TurnButton />
      </div>
      )}
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
