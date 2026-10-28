"use client";

import { AnimatePresence, motion } from "motion/react";
import { Lock } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { SplitText } from "@/components/motion/split-text";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:py-20">
      <div className="mb-8 grid gap-4 md:mb-16 md:grid-cols-12 md:items-end md:gap-6">
        <div className="md:col-span-7">
          <Eyebrow>Details</Eyebrow>
          <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.5rem)] type-display">
            <SplitText text="Every detail," />{" "}
            <SplitText
              text="considered."
              className="type-accent text-rose"
              delay={0.12}
            />
          </h2>
        </div>
        <p className="type-copy text-muted md:col-span-4 md:col-start-9">
          Little touches that turn a message into a moment they’ll come back to again and again.
        </p>
      </div>

      {/* Phones: the headline feature full width, then the rest as a 2×2 grid of small cards. Wider: a bento grid. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
        <BentoCard
          index={0}
          wide
          className="col-span-2 md:col-span-4"
          title="Opens at the perfect moment"
          body="Schedule your gift to unlock at midnight on their birthday — or the second your flight lands."
          short="Set it to unlock at midnight on their birthday."
        >
          <Countdown />
        </BentoCard>
        <BentoCard index={1} className="md:col-span-2" title="Your song, on cue" body="Add the track that starts playing as they open it." short="Plays as they open it.">
          <Equalizer />
        </BentoCard>
        <BentoCard index={2} className="md:col-span-2" title="Photos & voice notes" body="Your memories, spilling out of the envelope." short="Your memories, all in.">
          <Polaroids />
        </BentoCard>
        <BentoCard index={3} className="md:col-span-2" title="Private by design" body="Only the person with the link can open it. Add a password if you like." short="Private link, optional password.">
          <LockPulse />
        </BentoCard>
        <BentoCard
          index={4}
          className="md:col-span-2"
          title="Yours forever"
          body="Pay once and the link never expires. They can open it again and again, for years."
          short="Pay once. Never expires."
        >
          <InfinityDraw />
        </BentoCard>
      </div>
    </section>
  );
}

function BentoCard({
  index,
  className,
  title,
  body,
  short,
  wide = false,
  children,
}: {
  index: number;
  className?: string;
  title: string;
  body: string;
  /** A shorter line for the small cards on phones. */
  short: string;
  /** Full width on phones too. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: (index % 3) * 0.08 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.4rem] border border-line bg-paper p-4 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(27,18,21,0.3)] md:rounded-[2rem] md:p-8",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden md:mb-8 md:h-44 md:overflow-visible",
          wide ? "mb-4 h-auto" : "mb-3 h-24",
        )}
      >
        {/* The little animations, shrunk to fit the small phone cards. */}
        <div className={cn("flex w-full items-center justify-center md:scale-100", !wide && "scale-[0.6]")}>{children}</div>
      </div>
      <h3 className="mt-auto type-heading text-[15px] leading-tight md:text-xl">{title}</h3>
      <p className="type-copy mt-1 text-[13px] leading-snug text-muted md:hidden">{short}</p>
      <p className="type-copy mt-2 hidden text-[15px] text-muted md:block">{body}</p>
    </motion.div>
  );
}

function nextValentines(from: number) {
  const now = new Date(from);
  const target = new Date(now.getFullYear(), 1, 14, 9, 0, 0);
  if (target.getTime() <= from) target.setFullYear(now.getFullYear() + 1);
  return target.getTime();
}

function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const diff = now === null ? null : Math.max(0, nextValentines(now) - now);
  const units = [
    { label: "Days", value: diff === null ? null : Math.floor(diff / 86_400_000) },
    { label: "Hours", value: diff === null ? null : Math.floor(diff / 3_600_000) % 24 },
    { label: "Min", value: diff === null ? null : Math.floor(diff / 60_000) % 60 },
    { label: "Sec", value: diff === null ? null : Math.floor(diff / 1000) % 60 },
  ];

  return (
    <div className="w-full">
      <p className="type-label mb-3 flex items-center gap-2 text-[11px] text-muted md:mb-4 md:text-xs">
        <span className="size-1.5 animate-pulse rounded-full bg-rose" />
        <span className="md:hidden">Unlocks Feb 14, 9:00 AM</span>
        <span className="hidden md:inline">Unlocks on Valentine’s Day, 9:00 AM</span>
      </p>
      <div className="mx-auto grid w-full max-w-[16rem] grid-cols-4 gap-1.5 md:max-w-[30rem] md:gap-3">
        {units.map((u) => (
          <div key={u.label} className="flex aspect-square flex-col items-center justify-center rounded-xl bg-cream px-1 md:rounded-2xl">
            <div className="relative h-7 w-full overflow-hidden font-mono text-xl font-medium leading-none tabular-nums tracking-tight md:h-12 md:text-[2.6rem]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={u.value ?? "x"}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                >
                  {u.value === null ? "--" : String(u.value).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="mt-2 type-label text-[11px] text-muted md:mt-3">{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const bars = [0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.3, 0.7, 0.95, 0.45, 0.75, 0.55, 0.85, 0.35, 0.65, 0.9];

function Equalizer() {
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex h-24 items-end gap-1">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="h-full w-1.5 origin-bottom rounded-full bg-rose"
            animate={{ scaleY: [h * 0.3, h, h * 0.5, h * 0.9, h * 0.3] }}
            transition={{ duration: 1.2 + (i % 5) * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
          />
        ))}
      </div>
      <p className="type-label text-ink/70">“our song” — now playing</p>
    </div>
  );
}

const photos = [
  { bg: "linear-gradient(135deg,#f6d3cf,#e23b54)", base: "-translate-x-5 -rotate-12", hover: "group-hover:-translate-x-20 group-hover:-rotate-[18deg]" },
  { bg: "linear-gradient(135deg,#f8dc8c,#e2683b)", base: "translate-x-5 rotate-[10deg]", hover: "group-hover:translate-x-20 group-hover:rotate-[18deg]" },
  { bg: "linear-gradient(135deg,#cfdfd6,#1d1b33)", base: "-rotate-2", hover: "group-hover:-translate-y-4 group-hover:rotate-0 group-hover:scale-105" },
];

function Polaroids() {
  return (
    <div className="relative h-36 w-28">
      {photos.map((p, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 rounded-sm bg-white p-2 pb-7 shadow-[0_12px_30px_-12px_rgba(27,18,21,0.4)] transition-transform duration-700 ease-out-expo",
            p.base,
            p.hover,
          )}
        >
          <div className="size-full rounded-[2px]" style={{ background: p.bg }} />
        </div>
      ))}
    </div>
  );
}

function LockPulse() {
  return (
    <div className="relative grid place-items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute size-20 rounded-full border border-rose"
          animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
        />
      ))}
      <span className="relative grid size-20 place-items-center rounded-full bg-[linear-gradient(180deg,#e2546c,#c3304a)] text-paper shadow-[inset_0_2px_2px_rgba(255,255,255,0.35),0_12px_24px_-10px_rgba(191,40,64,0.55)]">
        <Lock className="size-7" strokeWidth={1.6} />
      </span>
    </div>
  );
}

const infinityPath =
  "M75 50 C 60 30, 30 30, 30 50 C 30 70, 60 70, 75 50 C 90 30, 120 30, 120 50 C 120 70, 90 70, 75 50 Z";

function InfinityDraw() {
  return (
    <svg viewBox="15 20 120 60" className="w-48 overflow-visible" aria-hidden>
      <path d={infinityPath} fill="none" stroke="currentColor" strokeWidth={3} className="text-ink/8" />
      <motion.path
        d={infinityPath}
        fill="none"
        stroke="var(--color-rose)"
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.4, ease: "easeInOut", delay: 0.4 }}
      />
    </svg>
  );
}
