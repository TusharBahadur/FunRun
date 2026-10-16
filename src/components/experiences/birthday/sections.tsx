"use client";

import { animate, motion, useInView, useMotionValue, useTransform, type PanInfo } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { KeepsakeButton } from "./party";
import type { BirthdayFeatures } from "./tiers";
import { Accented } from "./accented";
import { PhotoFill } from "./photo-fill";
import type { BirthdayGift, BirthdayPalette } from "./types";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -12% 0px" },
  transition: { duration: 0.9, ease: EASE_OUT },
} as const;

/* ───────────── The letter ───────────── */

export function Letter({ gift, palette }: { gift: BirthdayGift; palette: BirthdayPalette }) {
  return (
    <section className="px-5 py-24 md:py-36">
      <motion.article
        {...reveal}
        className="mx-auto max-w-xl rounded-[2rem] p-8 shadow-[0_40px_80px_-40px_rgba(67,17,31,0.45)] md:p-12"
        style={{ backgroundColor: palette.cream, color: palette.ink }}
      >
        <p className="type-label opacity-60">A note from {gift.sender}</p>
        <h2 className="type-display mt-5 text-[clamp(2.2rem,7vw,3.4rem)]">
          Dear{" "}
          <span className="type-accent" style={{ color: palette.accent }}>
            {gift.recipient},
          </span>
        </h2>
        <div className="mt-8 space-y-5 text-[1.05rem] leading-relaxed md:text-lg">
          {gift.message.map((p, i) => (
            <motion.p key={i} {...reveal} transition={{ ...reveal.transition, delay: 0.1 + i * 0.08 }}>
              {p}
            </motion.p>
          ))}
        </div>
        <motion.p
          {...reveal}
          className="type-accent mt-10 text-4xl"
          style={{ color: palette.accent }}
        >
          — {gift.sender}
        </motion.p>
      </motion.article>
    </section>
  );
}

/** The ₹99 tier's message: one short note, shown right under the cake. */
export function ShortNote({ gift, palette }: { gift: BirthdayGift; palette: BirthdayPalette }) {
  return (
    <section className="px-5 pb-24 pt-8">
      <motion.article
        {...reveal}
        className="mx-auto max-w-md rounded-[2rem] p-8 text-center"
        style={{ backgroundColor: palette.cream, color: palette.ink }}
      >
        <p className="type-label opacity-60">A note from {gift.sender}</p>
        <p className="mt-5 text-xl leading-snug">{gift.shortNote}</p>
        <p className="type-accent mt-6 text-3xl" style={{ color: palette.accent }}>
          — {gift.sender}
        </p>
      </motion.article>
    </section>
  );
}

/* ───────────── Memories: a stack of polaroids to flick through ───────────── */

export function Memories({ gift }: { gift: BirthdayGift }) {
  const [order, setOrder] = useState(() => gift.memories.map((_, i) => i));
  const next = () => setOrder((o) => [...o.slice(1), o[0]]);

  return (
    <section className="overflow-hidden px-5 py-24 text-center md:py-36">
      <motion.p {...reveal} className="type-label opacity-60">
        Remember these?
      </motion.p>
      <motion.h2 {...reveal} className="type-display mx-auto mt-4 max-w-lg text-[clamp(2.2rem,7vw,3.6rem)]">
        A few of our <span className="type-accent">favorite</span> days.
      </motion.h2>

      <div className="relative mx-auto mt-16 aspect-[4/5] w-[min(72vw,300px)]">
        {order
          .map((memoryIndex, depth) => ({ memoryIndex, depth }))
          .reverse()
          .map(({ memoryIndex, depth }) => (
            <Polaroid
              key={memoryIndex}
              memory={gift.memories[memoryIndex]}
              depth={depth}
              onDismiss={next}
            />
          ))}
      </div>
      <p className="type-label mt-12 opacity-60">Swipe or tap the photo</p>
    </section>
  );
}

function Polaroid({
  memory,
  depth,
  onDismiss,
}: {
  memory: BirthdayGift["memories"][number];
  depth: number;
  onDismiss: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const isTop = depth === 0;
  const tilt = [-3, 4, -6, 2][depth % 4];

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) onDismiss();
  }

  return (
    <motion.button
      type="button"
      drag={isTop ? "x" : false}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      onClick={isTop ? onDismiss : undefined}
      style={{ x, rotate: isTop ? rotate : undefined, zIndex: 10 - depth }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, rotate: isTop ? 0 : tilt, opacity: depth > 3 ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="absolute inset-0 cursor-grab touch-pan-y rounded-md bg-white p-3 pb-16 text-left text-[#2a1f23] shadow-[0_24px_50px_-24px_rgba(27,18,21,0.5)] active:cursor-grabbing"
      aria-label={isTop ? `${memory.caption}. Next photo` : undefined}
      tabIndex={isTop ? 0 : -1}
    >
      <PhotoFill
        src={memory.src}
        tone={memory.tone}
        alt={memory.caption}
        iconClassName="size-16"
        className="h-full w-full rounded-sm"
      />
      <div className="absolute inset-x-4 bottom-3">
        <p className="type-accent text-xl leading-tight">{memory.caption}</p>
        <p className="type-label text-[10px] opacity-50">{memory.date}</p>
      </div>
    </motion.button>
  );
}

/* ───────────── By the numbers ───────────── */

export function Numbers({ gift, palette }: { gift: BirthdayGift; palette: BirthdayPalette }) {
  const days = Math.round(gift.age * 365.25);
  const stats = [
    { value: gift.age, label: "years of you" },
    { value: days, label: "days on this planet" },
    { value: Math.round((days * 24 * 60 * 72) / 1_000_000), label: "heartbeats, give or take", suffix: "M" },
  ];

  return (
    <section className="px-5 py-24 md:py-36">
      <motion.h2
        {...reveal}
        className="type-display mx-auto max-w-2xl text-center text-[clamp(2.2rem,7vw,3.6rem)]"
      >
        You, <span className="type-accent" style={{ color: palette.accent }}>by the numbers.</span>
      </motion.h2>
      <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            {...reveal}
            transition={{ ...reveal.transition, delay: i * 0.1 }}
            className="rounded-[1.5rem] px-6 py-8 text-center"
            style={{ backgroundColor: palette.cream, color: palette.ink }}
          >
            <CountUp to={s.value} suffix={s.suffix} className="type-display block text-[clamp(2.8rem,9vw,4rem)] font-semibold" />
            <span className="type-label mt-3 block opacity-60">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CountUp({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.8, ease: EASE_OUT, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ───────────── Finale ───────────── */

export function Finale({
  gift,
  palette,
  templateSlug,
  features,
  onPlaySong,
  onReplay,
}: {
  gift: BirthdayGift;
  palette: BirthdayPalette;
  templateSlug: string;
  features: Pick<BirthdayFeatures, "thankYou" | "keepsake" | "unwrap">;
  onPlaySong: () => void;
  onReplay: () => void;
}) {
  const [thanked, setThanked] = useState(false);
  // The finale inverts the theme, so on dark themes the pink would wash out.
  const highlight = isLight(palette.fg) ? palette.accent : palette.pink;

  return (
    <section
      className="relative mx-3 mb-3 overflow-hidden rounded-[2rem] px-6 py-24 text-center md:py-36"
      style={{ backgroundColor: palette.fg, color: palette.bg }}
    >
      <motion.p {...reveal} className="type-label opacity-60">
        One more thing
      </motion.p>
      <motion.h2 {...reveal} className="type-display mx-auto mt-5 max-w-3xl text-[clamp(2.8rem,11vw,6.5rem)]">
        <Accented text={gift.copy?.finale || `Here’s to *year ${gift.age + 1}.*`} color={highlight} />
      </motion.h2>

      <motion.div {...reveal} className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        {features.thankYou && (
          <button
            type="button"
            onClick={() => setThanked(true)}
            disabled={thanked}
            className="h-14 rounded-full px-7 font-medium transition-transform active:scale-95 disabled:opacity-80"
            style={{ backgroundColor: palette.accent, color: palette.cream }}
          >
            {thanked ? `Sent with love to ${gift.sender}` : `Send ${gift.sender} a thank-you`}
          </button>
        )}
        {features.keepsake && <KeepsakeButton gift={gift} palette={palette} />}
        <button
          type="button"
          onClick={onPlaySong}
          className="h-14 rounded-full border px-7 font-medium transition-colors hover:bg-white/10"
          style={{ borderColor: `${palette.bg}40` }}
        >
          Play the song again
        </button>
      </motion.div>
      {thanked && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.6, y: 0 }}
          className="type-label mt-5"
        >
          Preview only. In a real gift this sends {gift.sender} your reply.
        </motion.p>
      )}

      <button type="button" onClick={onReplay} className="type-label mt-14 underline-offset-4 opacity-60 hover:underline">
        {features.unwrap ? "Unwrap it again" : "Light the candles again"}
      </button>

      <div className="mt-20 border-t pt-8" style={{ borderColor: `${palette.bg}22` }}>
        <Link href={`/templates/${templateSlug}`} className="type-label opacity-60 hover:opacity-100">
          Made with <span className="type-wordmark text-base normal-case">TyniTales.</span> Make one for someone →
        </Link>
      </div>
    </section>
  );
}

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}
