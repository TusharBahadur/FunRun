"use client";

import { ChevronRight, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useImageLoading } from "./image-loading";
import { capturePointer, StudioHit, useStory } from "./scene-kit";
import { Sticker, stickerImage, type AnyStickerId, type StickerPlacement, type StickerSpot } from "./stickers";
import type { StoryPalette } from "./types";

const PICKUP = "#3dcf7a";
export const DEFAULT_CALLER: AnyStickerId = "m-scream-cat";
export const DEFAULT_PARTY: AnyStickerId = "m-dance-cat";

const PHONE_SPOTS: Record<StickerSpot, string> = {
  tl: "-left-8 -top-4 size-14 -rotate-12",
  tr: "-right-7 top-10 size-12 rotate-12",
  ml: "-left-9 top-[38%] size-14 -rotate-6",
  mr: "-right-9 top-[36%] size-14 rotate-8",
  bl: "-left-6 bottom-16 size-16 -rotate-6",
  br: "-right-8 bottom-8 size-[4.5rem] rotate-12",
};

function shell(palette: StoryPalette) {
  return {
    background: `linear-gradient(165deg, ${palette.cream} 8%, ${palette.pink} 92%)`,
    boxShadow: "0 28px 48px -24px rgba(27,18,21,0.5), inset 0 1px 0 rgba(255,255,255,0.75)",
  };
}

function ScreenFill({ id, fit }: { id: AnyStickerId; fit: "cover" | "contain" }) {
  const src = stickerImage(id);
  const { fetchPriority } = useImageLoading();
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        fetchPriority={fetchPriority}
        draggable={false}
        className={
          fit === "cover"
            ? "absolute inset-0 size-full object-cover"
            : "absolute left-1/2 top-[38%] h-[78%] w-[90%] -translate-x-1/2 -translate-y-1/2 object-contain"
        }
      />
    );
  }
  return (
    <span
      className={
        fit === "cover"
          ? "absolute inset-0 grid place-items-center p-6"
          : "absolute left-1/2 top-[38%] size-[70%] -translate-x-1/2 -translate-y-1/2"
      }
    >
      <Sticker id={id} className="size-full" />
    </span>
  );
}

/**
 * Incoming-call phone used in knock scenes and gallery peeks.
 * The screen is stickers and gifs — pick up, then the party’s on the line.
 */
export function CallArt({
  palette,
  className,
  caller = DEFAULT_CALLER,
}: {
  palette: StoryPalette;
  className?: string;
  caller?: AnyStickerId;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="rounded-[22%] p-[7%] pb-[9%] pt-[8%]" style={shell(palette)}>
        <span className="mx-auto mb-[8%] block h-[4%] w-[38%] rounded-full" style={{ backgroundColor: `${palette.ink}28` }} />
        <div className="relative aspect-[9/15] overflow-hidden rounded-[16%]" style={{ backgroundColor: palette.cream }}>
          <ScreenFill id={caller} fit="cover" />
        </div>
      </div>
    </div>
  );
}

export function GiftCall({
  open,
  onAnswer,
  reveal,
  caller = DEFAULT_CALLER,
  party = DEFAULT_PARTY,
  stickers,
}: {
  open: boolean;
  onAnswer: () => void;
  reveal: ReactNode;
  caller?: AnyStickerId;
  party?: AnyStickerId;
  stickers?: StickerPlacement[];
}) {
  const { palette, from } = useStory();

  return (
    <div className="relative mx-auto w-[min(72vw,260px)]">
      {stickers?.map((s, i) => (
        <PhoneSticker key={`${s.at}-${i}`} placement={s} index={i} delay={0.08 + i * 0.12} />
      ))}

      <motion.div
        className="relative"
        animate={open ? { rotate: 0, y: 0 } : { rotate: [0, -4, 4, -3, 3, 0], y: [0, -5, 0] }}
        transition={open ? { duration: 0.3 } : { duration: 0.7, repeat: Infinity, repeatDelay: 0.85 }}
      >
        <div className="rounded-[2.15rem] p-[9px] pt-[11px]" style={shell(palette)}>
          <span aria-hidden className="mx-auto mb-2 block h-1.5 w-14 rounded-full" style={{ backgroundColor: `${palette.ink}28` }} />
          <div className="relative aspect-[9/15.4] overflow-hidden rounded-[1.55rem]" style={{ backgroundColor: palette.cream }}>
            {open ? (
              <div className="absolute inset-0">
                <StudioHit field="party" className="absolute inset-0 block">
                  <ScreenFill id={party} fit="contain" />
                </StudioHit>
                <div className="absolute inset-x-2.5 bottom-3 z-[1]">
                  <div
                    className="rounded-2xl px-3 py-2.5 text-center shadow-nav"
                    style={{ backgroundColor: palette.cream, color: palette.ink, rotate: "-2deg" }}
                  >
                    {reveal}
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0">
                <StudioHit field="caller" as="span" className="absolute inset-0 block">
                  <ScreenFill id={caller} fit="cover" />
                </StudioHit>
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/50" />
                <div className="absolute inset-x-0 top-5 z-[1] px-3 text-center text-white">
                  <p className="type-label text-[10px] tracking-[0.14em] opacity-80">Incoming call</p>
                  <p className="type-display mt-1.5 text-[1.35rem] font-semibold leading-none">{from}</p>
                  <p className="type-label mt-1.5 text-[9px] opacity-60">Mobile</p>
                </div>
              </div>
            )}
          </div>
          <span aria-hidden className="mx-auto mt-2.5 block h-1 w-10 rounded-full" style={{ backgroundColor: `${palette.ink}22` }} />
        </div>
      </motion.div>

      {!open && <SlideToAnswer onAnswer={onAnswer} />}
    </div>
  );
}

const THUMB = 48;

function SlideToAnswer({ onAnswer }: { onAnswer: () => void }) {
  const { palette } = useStory();
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [x, setX] = useState(0);
  const [max, setMax] = useState(0);
  const answered = useRef(false);

  function measure() {
    const el = track.current;
    if (!el) return 0;
    const next = Math.max(0, el.clientWidth - THUMB - 8);
    setMax(next);
    return next;
  }

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function fromEvent(e: PointerEvent<HTMLDivElement>, span = max) {
    const el = track.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.min(span, Math.max(0, e.clientX - r.left - THUMB / 2 - 4));
  }

  function answer(span: number) {
    if (answered.current) return;
    answered.current = true;
    setX(span);
    onAnswer();
  }

  function release(nx: number, span: number) {
    if (answered.current) return;
    if (span > 0 && nx >= span * 0.78) {
      answer(span);
      return;
    }
    setX(0);
  }

  return (
    <div
      ref={track}
      role="slider"
      aria-label="Slide to answer"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={max ? Math.round((x / max) * 100) : 0}
      className="relative mt-5 h-14 w-full touch-none select-none overflow-hidden rounded-full border"
      style={{ backgroundColor: `${palette.cream}24`, borderColor: `${palette.cream}30` }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " " && e.key !== "ArrowRight") return;
        e.preventDefault();
        answer(measure());
      }}
      onPointerDown={(e) => {
        capturePointer(e);
        dragging.current = true;
        setX(fromEvent(e, measure()));
      }}
      onPointerMove={(e) => {
        if (!dragging.current || answered.current) return;
        setX(fromEvent(e));
      }}
      onPointerUp={(e) => {
        if (!dragging.current) return;
        dragging.current = false;
        const span = measure();
        release(fromEvent(e, span), span);
      }}
      onPointerCancel={() => {
        dragging.current = false;
        if (!answered.current) setX(0);
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-0.5"
        style={{ opacity: max ? Math.max(0, 1 - x / max) : 1 }}
      >
        <span className="type-label text-[11px] tracking-[0.12em] opacity-55">Slide to answer</span>
        <ChevronRight className="size-3.5 opacity-40" strokeWidth={2.4} aria-hidden />
        <ChevronRight className="-ml-2.5 size-3.5 opacity-25" strokeWidth={2.4} aria-hidden />
      </span>
      <motion.span
        aria-hidden
        className="absolute top-1 left-1 grid size-12 place-items-center rounded-full shadow-[0_8px_16px_-8px_rgba(27,18,21,.45)]"
        style={{ backgroundColor: PICKUP }}
        animate={{ x }}
        transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.6 }}
      >
        <Phone className="size-5 text-paper" strokeWidth={2.4} />
      </motion.span>
    </div>
  );
}

function PhoneSticker({ placement, index, delay }: { placement: StickerPlacement; index: number; delay: number }) {
  return (
    <motion.div
      className={cn("absolute z-10", PHONE_SPOTS[placement.at])}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
      transition={{
        scale: { type: "spring", bounce: 0.55, delay },
        opacity: { duration: 0.3, delay },
        y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      <StudioHit field={`sticker-${index}`}>
        <Sticker id={placement.id} className="size-full" />
      </StudioHit>
    </motion.div>
  );
}
