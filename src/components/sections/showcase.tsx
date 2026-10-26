"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, Lock, PenLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { boardStickerIds, drawnStickerIds, Sticker, type AnyStickerId } from "@/components/story/stickers";
import { StoryPlayer } from "@/components/story/story-player";
import { TemplatePreview } from "@/components/templates/template-preview";
import { occasions } from "@/config/site";
import { EASE_OUT } from "@/lib/motion";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

/** How long each gift plays before the next one slides in (unless someone's playing with it). */
const SLIDE_MS = 7000;
/** The gift is laid out at a real phone size, then scaled down to fit the frame. */
const PHONE_W = 390;
const PHONE_H = 844;

const perks = {
  left: [
    { icon: PenLine, label: "Make it in your browser, no app" },
    { icon: Check, label: "One price, no subscription" },
  ],
  right: [
    { icon: Lock, label: "A private link only they can open" },
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
  const n = templates.length;
  const current = templates[i];
  const prev = templates[(i - 1 + n) % n];
  const next = templates[(i + 1) % n];

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setI((x) => (x + 1) % n), SLIDE_MS);
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
            { strong: String(boardStickerIds.length + drawnStickerIds.length), rest: "stickers" },
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
              <b className="font-semibold text-ink">{c.strong}</b> {c.rest}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
        <Perks items={perks.left} align="end" className="order-2 lg:order-1" />

        {/* The phones */}
        <div className="relative order-1 mx-auto h-[620px] w-[340px] sm:w-[420px] lg:order-2">
          <FloatingSticker id="heart" className="-left-6 top-2 size-16 sm:-left-10" delay={0} />
          <FloatingSticker id="pin-151" className="-right-4 top-24 size-20 sm:-right-12" delay={0.6} />
          <FloatingSticker id="cat" className="-left-2 bottom-24 size-20 sm:-left-14" delay={1.2} />
          <FloatingSticker id="b-flowers" className="-right-2 bottom-6 size-16 sm:-right-8" delay={1.8} />
          <SidePhone template={prev} side="left" onClick={() => setI((i - 1 + n) % n)} />
          <SidePhone template={next} side="right" onClick={() => setI((i + 1) % n)} />

          <div
            className="absolute left-1/2 top-0 z-20 h-[600px] w-[278px] -translate-x-1/2 overflow-hidden rounded-[2.6rem] border-[7px] border-[#2a2326] bg-[#2a2326] shadow-[0_40px_70px_-30px_rgba(27,18,21,0.65)]"
            onPointerDown={() => setPaused(true)}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={current.slug}
                className="absolute inset-0"
                initial={{ x: 60, opacity: 0, scale: 0.96 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -60, opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              >
                <LivePhone template={current} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <Perks items={perks.right} align="start" className="order-3" />
      </div>

      {/* Which gift is playing, and where we are in the loop */}
      <div className="relative mt-2 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {templates.map((t, j) => (
            <button
              key={t.slug}
              type="button"
              aria-label={`Show ${t.name}`}
              onClick={() => setI(j)}
              className={cn("h-1.5 rounded-full transition-all duration-500", j === i ? "w-8 bg-rose" : "w-4 bg-ink/15 hover:bg-ink/30")}
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
    <div ref={box} className="relative size-full overflow-hidden rounded-[2rem]" style={{ backgroundColor: template.palette.bg }}>
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

function SidePhone({ template, side, onClick }: { template: Template; side: "left" | "right"; onClick: () => void }) {
  const left = side === "left";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Show ${template.name}`}
      key={template.slug}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "absolute top-10 z-10 h-[520px] w-[240px] overflow-hidden rounded-[2.3rem] border-[6px] border-[#2a2326] bg-[#2a2326] shadow-[0_30px_50px_-30px_rgba(27,18,21,0.55)] transition-transform duration-500 hover:scale-[1.02]",
        left ? "left-0 origin-bottom-right -rotate-[9deg]" : "right-0 origin-bottom-left rotate-[9deg]",
      )}
    >
      <div className="grid size-full place-items-center rounded-[1.9rem]" style={{ backgroundColor: template.palette.bg }}>
        <TemplatePreview template={template} className="w-[88%] rounded-2xl" />
      </div>
    </motion.button>
  );
}

function Perks({ items, align, className }: { items: { icon: typeof Check; label: string }[]; align: "start" | "end"; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap justify-center gap-3 lg:flex-col", align === "end" ? "lg:items-end" : "lg:items-start", className)}>
      {items.map(({ icon: Icon, label }, k) => (
        <motion.li
          key={label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 * k }}
          style={{ rotate: `${k % 2 ? 1.5 : -1.5}deg` }}
          className="relative flex max-w-[16rem] items-center gap-3 rounded-md bg-paper px-4 py-3.5 text-[15px] shadow-[0_12px_28px_-16px_rgba(27,18,21,0.4)]"
        >
          <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-[-3deg] bg-blush/80" />
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blush text-rose-deep">
            <Icon className="size-3.5" />
          </span>
          {label}
        </motion.li>
      ))}
    </ul>
  );
}

/** One of our stickers, bobbing gently beside the phones. */
function FloatingSticker({ id, className, delay }: { id: AnyStickerId; className: string; delay: number }) {
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute z-30 hidden sm:block", className)}
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
