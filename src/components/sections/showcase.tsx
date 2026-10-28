"use client";

import { motion } from "motion/react";
import { Check, Clock, Lock, PenLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { boardStickerCount, drawnStickerIds, Sticker, type AnyStickerId } from "@/components/story/stickers";
import { StoryPlayer } from "@/components/story/story-player";
import { occasions } from "@/config/site";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EASE_OUT } from "@/lib/motion";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

/** How long each gift plays before the stack turns to the next (unless someone's playing with it). */
const SLIDE_MS = 4000;
/** How long one turn of the stack takes. */
const TURN_S = 1;
/** The gift is laid out at a real phone size, then scaled down to fit the frame. */
const PHONE_W = 390;
const PHONE_H = 844;

const perks = {
  left: [
    { icon: PenLine, label: "Make it in your browser, no app" },
    { icon: Check, label: "Pay once, yours forever" },
  ],
  right: [
    { icon: Lock, label: "Private link, optional password" },
    { icon: Clock, label: "Opens at the exact moment you pick" },
  ],
};

/**
 * Real gifts, playing in a fanned stack of phones. The front one is live:
 * tap around inside it. Every few seconds the next gift slides to the front.
 */
export function Showcase({ templates, total }: { templates: Template[]; total: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // Counts every turn without wrapping, so the notes keep taking turns in order
  // even though there are more gifts than notes.
  const [turn, setTurn] = useState(0);
  const go = (next: number) => {
    setI(next);
    setTurn((t) => t + 1);
  };
  const n = templates.length;
  const current = templates[i];

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go((i + 1) % n), SLIDE_MS);
    return () => clearTimeout(id);
  }, [i, paused, n]);

  return (
    <section className="relative overflow-hidden px-5 py-14 md:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(27_18_21/0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] type-display">
          Made of little <span className="type-accent text-rose">things.</span>
        </h2>
        <p className="type-copy mx-auto mt-4 max-w-md text-muted">
          Your photos and words, tiny games, and hundreds of stickers. All in one gift they’ll keep opening.
        </p>
        <ul className="mt-7 flex flex-wrap justify-center gap-2 text-sm">
          {[
            { strong: String(total), rest: "templates", live: true },
            { strong: String(boardStickerCount + drawnStickerIds.length), rest: "stickers" },
            { strong: String(occasions.length), rest: "occasions" },
            { strong: "5 min", rest: "to make one" },
          ].map((c) => (
            <li key={c.rest} className="flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-ink/70">
              {c.live && (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-rose" />
                </span>
              )}
              <b className="font-semibold text-rose-deep">{c.strong}</b> {c.rest}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto mt-8 grid max-w-7xl items-center gap-x-10 gap-y-5 md:mt-12 lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        <Perks items={perks.left} align="end" beat={turn} tint={current.palette} className="order-2 lg:order-1" />

        {/* The phones */}
        <div className="relative order-1 mx-auto h-[470px] w-[300px] sm:h-[620px] sm:w-[440px] lg:order-2 lg:w-[600px]">
          <FloatingSticker id="b-capy-kiss" className="-left-7 -top-6 size-14 sm:-left-10 sm:top-2 sm:size-16" delay={0} />
          <FloatingSticker id="b-frog-kiss" className="-right-7 top-16 size-16 sm:-right-12 sm:top-24 sm:size-20" delay={0.6} />
          <FloatingSticker id="m-flower-kitten" className="-left-7 bottom-16 size-16 sm:-left-14 sm:bottom-24 sm:size-20" delay={1.2} />
          <FloatingSticker id="b-love-duck" className="-right-6 -bottom-2 size-14 sm:-right-8 sm:bottom-6 sm:size-16" delay={1.8} />
          <Revolver templates={templates} index={i} onPick={go} onPause={setPaused} />
        </div>

        <Perks items={perks.right} align="start" beat={turn} tint={current.palette} className="order-3" />
      </div>

      {/* Which gift is playing, and where we are in the loop */}
      <div className="relative mt-9 flex flex-col items-center gap-3 lg:mt-4">
        <div className="flex gap-3">
          {templates.map((t, j) => (
            <button
              key={t.slug}
              type="button"
              aria-label={`Show ${t.name}`}
              onClick={() => go(j)}
              className={cn("relative h-1.5 rounded-full transition-all duration-500 after:absolute after:-inset-x-1 after:-inset-y-[9px] after:content-['']", j === i ? "w-8 bg-rose" : "w-4 bg-ink/15 hover:bg-ink/30")}
            />
          ))}
        </div>
        <p className="text-sm">
          <Link href={`/templates/${current.slug}`} className="font-medium hover:underline">
            {occasions.find((o) => o.id === current.occasion)?.label ?? current.name}
          </Link>{" "}
          <span className="type-accent text-muted">· tap to explore</span>
        </p>
      </div>
    </section>
  );
}

/** The real gift, laid out at phone size and scaled into the frame. */
function LivePhone({ template }: { template: Template }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(264 / PHONE_W);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / PHONE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="relative size-full overflow-hidden rounded-[1.65rem] sm:rounded-[2.2rem]" style={{ backgroundColor: template.palette.bg }}>
      {/* transform makes this the box that the gift's "fixed" buttons stick to */}
      <div
        className="absolute left-0 top-0 origin-top-left overflow-y-auto overflow-x-hidden [scrollbar-width:none]"
        style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${scale})` }}
        data-lenis-prevent
      >
        {template.story && <StoryPlayer story={template.story} slug={template.slug} embedded />}
      </div>
    </div>
  );
}

type Slot = "center" | "left" | "right" | "back";

/**
 * The phones sit on a little turntable: on each turn the right phone swings
 * to the front, the front one to the left, the left one round the back, and
 * the one at the back comes out on the right.
 */
function Revolver({
  templates,
  index,
  onPick,
  onPause,
}: {
  templates: Template[];
  index: number;
  onPick: (i: number) => void;
  onPause: (p: boolean) => void;
}) {
  const n = templates.length;
  const narrow = useMediaQuery("(max-width: 639px)");
  const reach = narrow ? 64 : 150;
  // Flat transforms only (no 3D): far smoother with a whole gift inside the phone.
  const slots: Record<Slot, { x: number; y: number; rotate: number; scale: number; opacity: number; zIndex: number }> = {
    center: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 30 },
    right: { x: reach, y: narrow ? 22 : 34, rotate: 8, scale: 0.86, opacity: 1, zIndex: 10 },
    left: { x: -reach, y: narrow ? 22 : 34, rotate: -8, scale: 0.86, opacity: 1, zIndex: 10 },
    back: { x: 0, y: 40, rotate: 0, scale: 0.72, opacity: 0, zIndex: 0 },
  };


  return (
    <div className="absolute inset-0">
      {templates.map((t, j) => {
        const off = (j - index + n) % n;
        const slot: Slot = off === 0 ? "center" : off === 1 ? "right" : off === n - 1 ? "left" : "back";
        const front = slot === "center";
        return (
          <motion.div
            key={t.slug}
            className="absolute left-1/2 top-0 -ml-[105px] h-[452px] w-[210px] will-change-transform sm:-ml-[139px] sm:h-[600px] sm:w-[278px]"
            initial={false}
            animate={slots[slot]}
            // Stacking order changes instantly, so the incoming phone glides over the outgoing one.
            transition={{ duration: TURN_S, ease: [0.22, 1, 0.36, 1], zIndex: { duration: 0 } }}
            onPointerDown={front ? () => onPause(true) : undefined}
            onMouseEnter={front ? () => onPause(true) : undefined}
            onMouseLeave={front ? () => onPause(false) : undefined}
          >
            <div
              className={cn(
                "relative size-full overflow-hidden rounded-[2rem] border-[5px] border-[#fdfbf8] bg-[#fdfbf8] ring-1 ring-ink/10 transition-shadow duration-700 sm:rounded-[2.6rem] sm:border-[6px]",
                front
                  ? "shadow-[0_34px_60px_-26px_rgba(27,18,21,0.38),0_6px_16px_-6px_rgba(27,18,21,0.14)]"
                  : "shadow-[0_24px_44px_-26px_rgba(27,18,21,0.3)]",
              )}
            >
              {/* The three phones you can see all play their real first page; the hidden one rests. */}
              {slot !== "back" && (
                <div className={cn("size-full", !front && "pointer-events-none")} inert={!front}>
                  <LivePhone template={t} />
                </div>
              )}
              {!front && slot !== "back" && (
                <button
                  type="button"
                  onClick={() => onPick(j)}
                  aria-label={`Show ${t.name}`}
                  className="absolute inset-0 rounded-[1.65rem] sm:rounded-[2.2rem]"
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * The notes pinned beside the phones. Each time the stack turns, the next note
 * springs forward in the colour of the gift that just landed: 1, 2, 3, 4, 1, …
 */
function Perks({
  items,
  align,
  beat,
  tint,
  className,
}: {
  items: { icon: typeof Check; label: string }[];
  align: "start" | "end";
  beat: number;
  tint: { bg: string; accent: string };
  className?: string;
}) {
  const side = align === "end" ? 0 : items.length;
  return (
    <ul className={cn("relative z-30 mx-auto grid w-full max-w-[340px] grid-cols-2 gap-x-2 gap-y-3.5 lg:mx-0 lg:flex lg:max-w-none lg:flex-col lg:gap-6", align === "end" ? "lg:items-end" : "lg:items-start", className)}>
      {items.map(({ icon: Icon, label }, k) => {
        const on = (side + k) % 4 === beat % 4;
        const tilt = k % 2 ? 2 : -2;
        return (
          <motion.li
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 * k }}
            className="relative w-full lg:max-w-[15rem]"
          >
            <motion.div
              animate={
                on
                  ? { y: -10, scale: 1.08, rotate: -tilt * 1.5, backgroundColor: tint.bg }
                  : { y: 0, scale: 1, rotate: tilt, backgroundColor: "#fffdf9" }
              }
              transition={
                on
                  ? { type: "spring", stiffness: 420, damping: 11, mass: 0.9, delay: TURN_S * 0.5, backgroundColor: { duration: 0.4, delay: TURN_S * 0.5 } }
                  : { type: "spring", stiffness: 260, damping: 24 }
              }
              className={cn(
                "relative flex h-full items-center gap-2 rounded-lg border border-ink/5 px-2.5 py-2.5 text-[12px] font-medium leading-snug text-ink transition-shadow duration-500 lg:gap-3 lg:px-4 lg:py-4 lg:text-[15px]",
                on ? "shadow-[0_22px_40px_-18px_rgba(27,18,21,0.55)]" : "shadow-[0_10px_24px_-14px_rgba(27,18,21,0.35)]",
              )}
            >
              <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 rotate-[-4deg] bg-blush/90 lg:-top-2.5 lg:h-5 lg:w-16" />
              <motion.span
                animate={on ? { rotate: [0, -18, 14, -8, 0], scale: [1, 1.25, 1] } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: TURN_S * 0.55 }}
                className="grid size-6 shrink-0 place-items-center rounded-full text-white lg:size-8"
                style={{ backgroundColor: on ? tint.accent : "#e7a3b1" }}
              >
                <Icon className="size-3.5 lg:size-4" />
              </motion.span>
              {label}
              {/* a little burst of hearts as it pops */}
              {on && (
                <span key={`burst-${beat}`} aria-hidden className="pointer-events-none absolute inset-0">
                  {[-50, -15, 20, 55].map((dx, m) => (
                    <motion.span
                      key={m}
                      className="absolute left-1/2 top-0 text-sm"
                      style={{ color: tint.accent }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                      animate={{ x: dx * 1.6, y: [-4, -38 - (m % 2) * 14], opacity: [0, 1, 0], scale: [0.4, 1.1, 0.8] }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: TURN_S * 0.5 + m * 0.05 }}
                    >
                      {m % 2 ? "✦" : "♥"}
                    </motion.span>
                  ))}
                </span>
              )}
            </motion.div>
          </motion.li>
        );
      })}
    </ul>
  );
}

/** One of our stickers, bobbing gently beside the phones. */
function FloatingSticker({ id, className, delay }: { id: AnyStickerId; className: string; delay: number }) {
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute z-30", className)}
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", bounce: 0.5, delay: 0.3 + delay * 0.3 }}
    >
      <motion.div className="size-full" animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }} transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}>
        <Sticker id={id} className="size-full" />
      </motion.div>
    </motion.div>
  );
}
