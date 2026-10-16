"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Cake } from "@/components/experiences/birthday/cake";
import { HoldRing, SceneShell, useHold, useStory, type SceneProps } from "../scene-kit";
import type { Scene } from "../types";

type S<T extends Scene["type"]> = Extract<Scene, { type: T }>;

/* ───────────── Dandelion: hold to make a wish, seeds drift off ───────────── */

const SEEDS = 22;

export function DandelionScene({ scene, done, onDone }: SceneProps<S<"dandelion">>) {
  const { palette } = useStory();
  const flower = useRef<HTMLDivElement>(null);
  const hold = useHold(2200, () => {
    onDone();
  }, done);
  const p = done ? 1 : hold.progress;

  // Each seed gets a fixed drift so the wish looks the same every replay.
  const seeds = useMemo(
    () =>
      Array.from({ length: SEEDS }, (_, i) => {
        const a = (i / SEEDS) * Math.PI * 2;
        return { a, dx: 120 + ((i * 37) % 90), dy: -140 - ((i * 53) % 120), spin: (i % 2 ? 1 : -1) * (40 + i * 7) };
      }),
    [],
  );

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div ref={flower} className="relative h-[230px] w-[230px]">
        <svg viewBox="0 0 230 230" className="absolute inset-0 overflow-visible" aria-hidden>
          <path d="M115 120 C 112 160, 120 190, 112 230" stroke={palette.fg} strokeOpacity={0.5} strokeWidth={3} fill="none" />
          <circle cx={115} cy={115} r={9} fill={palette.gold} />
          {seeds.map((s, i) => {
            const gone = p > (i + 1) / (SEEDS + 1);
            const x2 = 115 + Math.cos(s.a) * 58;
            const y2 = 115 + Math.sin(s.a) * 58;
            return (
              <motion.g
                key={i}
                initial={false}
                animate={gone ? { x: s.dx, y: s.dy, rotate: s.spin, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
                transition={{ duration: gone ? 2.2 : 0.4, ease: "easeOut" }}
                style={{ originX: `${x2}px`, originY: `${y2}px` }}
              >
                <line x1={115} y1={115} x2={x2} y2={y2} stroke={palette.fg} strokeOpacity={0.35} strokeWidth={1.2} />
                <circle cx={x2} cy={y2} r={5} fill={palette.cream} stroke={palette.fg} strokeOpacity={0.25} />
              </motion.g>
            );
          })}
        </svg>
      </div>
      {!done && (
        <button
          type="button"
          {...hold.handlers}
          className="relative mt-8 grid size-[96px] touch-none select-none place-items-center rounded-full outline-none"
          aria-label="Press and hold to make your wish"
        >
          <HoldRing progress={p} size={96} color={palette.accent} track={`${palette.fg}18`} />
          <span
            className="type-label grid size-[76px] place-items-center rounded-full text-[10px]"
            style={{ backgroundColor: palette.accent, color: palette.cream }}
          >
            {p > 0 ? "wishing…" : "hold"}
          </span>
        </button>
      )}
    </SceneShell>
  );
}

/* ───────────── Cake: tap each flame ───────────── */

export function CakeScene({ scene, done, onDone }: SceneProps<S<"cake">>) {
  const { palette, celebrate } = useStory();
  const digits = String(scene.age).length;
  const [lit, setLit] = useState<boolean[]>(() => Array(digits).fill(!done));
  const cake = useRef<HTMLDivElement>(null);

  function blow(i: number) {
    const next = lit.map((v, j) => (j === i ? false : v));
    setLit(next);
    if (next.every((v) => !v)) {
      onDone();
      setTimeout(() => celebrate(cake.current), 350);
    }
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div ref={cake} className="w-[min(78vw,340px)]">
        <Cake age={scene.age} lit={!done} palette={palette} litMask={done ? lit.map(() => false) : lit} onFlameTap={blow} />
      </div>
    </SceneShell>
  );
}

/* ───────────── Meter: tap fast to fill it past the top ───────────── */

export function MeterScene({ scene, done, onDone }: SceneProps<S<"meter">>) {
  const { palette, fill } = useStory();
  const [level, setLevel] = useState(done ? 1 : 0);
  const tube = useRef<HTMLDivElement>(null);
  const finished = useRef(done);

  // The meter slowly sinks unless you keep tapping.
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setLevel((l) => (finished.current ? l : Math.max(0, l - 0.012))), 60);
    return () => clearInterval(id);
  }, [done]);

  function pump() {
    if (finished.current) return;
    const next = Math.min(1, level + 0.085);
    setLevel(next);
    if (next >= 1) {
      finished.current = true;
      onDone();
    }
  }

  const label = scene.levels[Math.min(scene.levels.length - 1, Math.floor(level * scene.levels.length))];

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div className="flex items-end gap-6">
        <div ref={tube} className="relative h-[260px] w-16 overflow-hidden rounded-full border-4" style={{ borderColor: palette.fg }}>
          <motion.div
            className="absolute inset-x-0 bottom-0"
            style={{ background: `linear-gradient(to top, ${palette.accent}, ${palette.pink})` }}
            animate={{ height: `${level * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          {[0.25, 0.5, 0.75].map((t) => (
            <span key={t} className="absolute inset-x-2 h-0.5 opacity-30" style={{ bottom: `${t * 100}%`, backgroundColor: palette.fg }} />
          ))}
        </div>
        <div className="w-40 text-left">
          <p className="type-label opacity-60">{fill(scene.label)}</p>
          <motion.p key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="type-accent mt-1 text-[1.7rem] leading-tight" style={{ color: palette.accent }}>
            {fill(label)}
          </motion.p>
          <p className="type-display mt-2 text-4xl font-semibold tabular-nums">{Math.round(level * 100)}%</p>
        </div>
      </div>
      {!done && (
        <motion.button
          type="button"
          onClick={pump}
          whileTap={{ scale: 0.9 }}
          className="mt-8 h-14 rounded-full px-8 font-medium"
          style={{ backgroundColor: palette.accent, color: palette.cream }}
        >
          Tap, tap, tap
        </motion.button>
      )}
    </SceneShell>
  );
}
