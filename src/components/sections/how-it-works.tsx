"use client";

import { motion } from "motion/react";
import { ImagePlus, LayoutGrid, Send, Wallet, type LucideIcon } from "lucide-react";
import { SplitText } from "@/components/motion/split-text";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { giftPricing } from "@/config/site";
import { EASE_OUT } from "@/lib/motion";
import { cn, formatInr } from "@/lib/utils";

type Hang = "peg" | "tape" | "tag" | "clip";

const steps: { icon: LucideIcon; title: string; body: string; tint: string; tilt: number; hang: Hang }[] = [
  { icon: LayoutGrid, title: "Pick a design", body: "Birthday, anniversary, sorry, or just because.", tint: "#fbe3e6", tilt: -3, hang: "peg" },
  { icon: ImagePlus, title: "Make it yours", body: "Your words, photos and a song. It changes as you type.", tint: "#fdf0dc", tilt: 2, hang: "tape" },
  { icon: Wallet, title: "Pay once", body: `${formatInr(giftPricing.pricePaise)}, one time. No subscription. Never expires.`, tint: "#efe7fb", tilt: -2, hang: "tag" },
  { icon: Send, title: "Share the link", body: "WhatsApp it or print the QR. Add a password if you like.", tint: "#e6f2ea", tilt: 3, hang: "clip" },
];

/* The string: pinned at five points, drooping between them. A card hangs from each dip. */
const PINS = [0, 250, 500, 750, 1000];
const SAG = 64;
const STRING = PINS.slice(1).reduce((d, x, i) => `${d} Q${PINS[i] + 125} ${18 + SAG * 2} ${x} 18`, `M${PINS[0]} 18`);
/** Where the string dips lowest between two pins (the middle of each droop). */
const DIP_Y = 18 + SAG;
/** Bulbs along the string: [x, y] in the same 1000-wide box, leaving the dip free for the note. */
const LIGHTS = PINS.slice(1).flatMap((x, i) => {
  const x0 = PINS[i];
  return [0.14, 0.3, 0.7, 0.86].map((t) => {
    const cx = x0 + 125;
    const px = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x;
    const py = (1 - t) ** 2 * 18 + 2 * (1 - t) * t * (18 + SAG * 2) + t ** 2 * 18;
    return [px, py] as const;
  });
});

/** How it works: four paper cards clipped to a string of fairy lights. */
export function HowItWorks() {
  return (
    <section id="how" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow className="justify-center">How it works</Eyebrow>
        <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.5rem)] type-display">
          <SplitText text="Ready in" /> <SplitText text="five minutes." className="type-accent text-rose" delay={0.15} />
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-ink/70">No app, no design skills. Everything works on your phone.</p>
      </div>

      {/* ── Wider screens: one long garland ── */}
      <div className="relative mx-auto mt-12 hidden max-w-6xl md:block">
        <div className="relative aspect-[1000/150]">
          <Garland />
        </div>
        {/* Pulled up so each card's peg sits right on the lowest point of its droop. */}
        <ol className="relative grid grid-cols-4" style={{ marginTop: `${-((150 - DIP_Y - 6) / 1000) * 100}%` }}>
          {steps.map((_, i) => (
            <li key={i} className="flex justify-center px-3">
              <Card step={i} />
            </li>
          ))}
        </ol>
      </div>

      {/* ── Phones: each card hangs from its own little string ── */}
      <ol className="mx-auto mt-8 max-w-sm space-y-3 md:hidden">
        {steps.map((_, i) => (
          <li key={i} className="relative pt-9">
            <svg viewBox="0 0 300 40" className="absolute inset-x-6 top-0 h-10 w-[calc(100%-3rem)] overflow-visible" aria-hidden>
              <BulbDefs />
              <motion.path
                d="M0 6 Q150 62 300 6"
                fill="none"
                stroke="#d9b8ae"
                strokeWidth={1.5}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE_OUT }}
              />
              {[
                [45, 18],
                [95, 28],
                [205, 28],
                [255, 18],
              ].map(([x, y], k) => (
                <Bulb key={k} x={x} y={y} r={4.2} color={i + k} tilt={k % 2 ? 10 : -10} delay={0.2 + k * 0.12} />
              ))}
            </svg>
            <div className="flex justify-center">
              <Card step={i} wide />
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex justify-center md:mt-16">
        <ButtonLink href="/templates" variant="rose" size="lg">
          Pick a design
        </ButtonLink>
      </div>
    </section>
  );
}

/** The string and its twinkling lights, drawn in from left to right. */
function Garland() {
  return (
    <svg viewBox="0 0 1000 150" className="absolute inset-0 size-full overflow-visible" aria-hidden>
      <BulbDefs />
      <motion.path
        d={STRING}
        fill="none"
        stroke="#d9b8ae"
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.6, ease: EASE_OUT }}
      />
      {/* little nails the string is pinned to */}
      {PINS.map((x) => (
        <circle key={x} cx={x} cy={18} r={4} fill="#e9c9bf" stroke="#d2a99c" strokeWidth={1} />
      ))}
      {LIGHTS.map(([x, y], i) => (
        <Bulb key={i} x={x} y={y} r={5.5} color={i} tilt={[-12, 9, -8, 11][i % 4]} delay={0.4 + i * 0.09} />
      ))}
    </svg>
  );
}

/** Warm yellows, from soft butter to deeper honey. */
const BULBS = ["#ffd66b", "#ffe08a", "#ffc94d", "#ffdb7a"];

/** Bulb shading, one per colour: bright at the top-left, deeper at the edge. */
function BulbDefs() {
  return (
    <defs>
      {BULBS.map((c, i) => (
        <radialGradient key={c} id={`tt-bulb-${i}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fffdf5" />
          <stop offset="40%" stopColor={c} />
          <stop offset="100%" stopColor={c} stopOpacity={0.9} />
        </radialGradient>
      ))}
    </defs>
  );
}

/** One fairy light: a short wire, a little cap, and a glass bulb with a warm glow that flickers on its own rhythm. */
function Bulb({ x, y, r, color, tilt, delay }: { x: number; y: number; r: number; color: number; tilt: number; delay: number }) {
  const c = BULBS[color % BULBS.length];
  const top = y + 1;
  const bulbY = top + r * 2.1;
  const flicker = 2 + ((x * 7) % 13) / 10;
  return (
    <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay }}>
      <g transform={`rotate(${tilt} ${x} ${top})`}>
        <motion.circle
          cx={x}
          cy={bulbY}
          r={r * 3}
          fill={c}
          style={{ filter: "blur(5px)" }}
          animate={{ opacity: [0.25, 0.6, 0.35, 0.55, 0.25] }}
          transition={{ duration: flicker, repeat: Infinity, ease: "easeInOut", delay: delay % flicker }}
        />
        <line x1={x} y1={top - 1} x2={x} y2={top + r * 0.5} stroke="#c9a090" strokeWidth={1.1} />
        <rect x={x - r * 0.5} y={top + r * 0.45} width={r} height={r * 0.8} rx={r * 0.2} fill="#d9bfa8" stroke="#c49a86" strokeWidth={0.6} />
        <ellipse cx={x} cy={bulbY} rx={r * 0.78} ry={r * 1.12} fill={`url(#tt-bulb-${color % BULBS.length})`} />
        <ellipse cx={x - r * 0.26} cy={bulbY - r * 0.42} rx={r * 0.17} ry={r * 0.3} fill="#fff" opacity={0.85} />
      </g>
    </motion.g>
  );
}

/** How each note holds on to the string: a peg, washi tape, a twine loop, or a little clip. */
function Hanger({ kind }: { kind: Hang }) {
  if (kind === "tape") {
    return (
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 z-10 h-7 w-16 -translate-x-1/2 rotate-[-4deg] bg-[#f3b7c2]/75 shadow-[0_1px_2px_rgb(27_18_21/0.12)] [clip-path:polygon(3%_0,97%_4%,100%_30%,97%_55%,100%_80%,96%_100%,4%_96%,0_70%,3%_45%,0_20%)]"
      >
        <span className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent_0_5px,rgb(255_255_255/0.35)_5px_7px)]" />
      </span>
    );
  }
  if (kind === "tag") {
    // A loop of twine from the string down through the tag's hole.
    return (
      <svg aria-hidden viewBox="0 0 30 34" className="absolute -top-6 left-1/2 z-10 h-[34px] w-[30px] -translate-x-1/2 overflow-visible">
        <path d="M15 0 C6 6 7 22 15 32 C23 22 24 6 15 0" fill="none" stroke="#c9a585" strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "clip") {
    return (
      <span aria-hidden className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2">
        {/* the two wire handles */}
        <span className="absolute -top-2.5 left-1 h-3.5 w-2.5 rounded-t-full border-2 border-b-0 border-[#c9b3b0]" />
        <span className="absolute -top-2.5 right-1 h-3.5 w-2.5 rounded-t-full border-2 border-b-0 border-[#c9b3b0]" />
        <span className="relative block h-4 w-9 rounded-[3px] bg-[linear-gradient(180deg,#e9788e,#c9405b)] shadow-[inset_0_1px_1px_rgb(255_255_255/0.4),0_2px_4px_rgb(120_30_50/0.3)]" />
      </span>
    );
  }
  return (
    <span aria-hidden className="absolute -top-4 left-1/2 z-10 h-8 w-3.5 -translate-x-1/2 rounded-[4px] bg-[linear-gradient(90deg,#e8c39e,#f3dabc,#e2b88f)] shadow-[0_2px_4px_rgb(120_80_40/0.25)]">
      <span className="absolute inset-x-0 top-1/2 h-px bg-[#c99a6c]/70" />
    </span>
  );
}

/** A paper note hanging from the string (see Hanger for how). It sways a little, like it's hanging in a breeze. */
function Card({ step, wide = false }: { step: number; wide?: boolean }) {
  const s = steps[step];
  const Icon = s.icon;
  // On phones the cards are wider, so a smaller tilt keeps them tidy.
  const tilt = wide ? s.tilt / 2.5 : s.tilt;
  return (
    <motion.div
      className={cn("relative origin-top", wide ? "w-full max-w-[19rem]" : "w-[min(100%,15rem)]")}
      initial={{ opacity: 0, y: -24, rotate: tilt * 3 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ type: "spring", stiffness: 140, damping: 11, delay: 0.5 + step * 0.25 }}
    >
      <motion.div
        className="origin-top"
        animate={{ rotate: [0, 1.6, 0, -1.6, 0] }}
        transition={{ duration: 5 + step * 0.6, repeat: Infinity, ease: "easeInOut", delay: step * 0.4 }}
        whileHover={{ rotate: 0, y: -4 }}
      >
        <Hanger kind={s.hang} />
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.1rem] border border-white/80 shadow-[0_22px_40px_-24px_rgba(27,18,21,0.45),0_2px_6px_-2px_rgba(27,18,21,0.08)]",
            wide ? "px-4 pb-4 pt-5" : "px-5 pb-5 pt-6",
          )}
          style={{
            backgroundColor: s.tint,
            // The gift tag has its two top corners snipped off.
            clipPath: s.hang === "tag" ? "polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%, 0 14px)" : undefined,
          }}
        >
          {/* paper grain + a corner fold */}
          <span aria-hidden className="absolute inset-0 bg-[radial-gradient(rgb(27_18_21/0.05)_1px,transparent_1px)] [background-size:10px_10px]" />
          {(s.hang === "peg" || s.hang === "clip") && (
            <span aria-hidden className="absolute right-0 top-0 size-6 bg-[linear-gradient(225deg,#fbf8f3_50%,rgb(27_18_21/0.08)_50%)]" />
          )}
          {s.hang === "tag" && (
            <span aria-hidden className="absolute left-1/2 top-2.5 size-3 -translate-x-1/2 rounded-full bg-cream shadow-[inset_0_1px_2px_rgb(27_18_21/0.25)] ring-1 ring-[#d9b8ae]" />
          )}

          <div className="relative flex items-center justify-between">
            <span className={cn("type-accent leading-none text-rose", wide ? "text-2xl" : "text-3xl")}>{String(step + 1).padStart(2, "0")}</span>
            <span className="grid size-10 place-items-center rounded-full bg-white/80 text-rose-deep shadow-[inset_0_1px_1px_#fff,0_4px_10px_-4px_rgb(191_40_64/0.35)]">
              <Icon className="size-[18px]" />
            </span>
          </div>
          <h3 className={cn("type-heading relative text-xl leading-tight", wide ? "mt-2" : "mt-4")}>{s.title}</h3>
          <p className="relative mt-1.5 text-[15px] leading-relaxed text-ink/70">{s.body}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
