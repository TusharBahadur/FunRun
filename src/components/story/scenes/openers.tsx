"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Accented } from "@/components/experiences/birthday/accented";
import { EASE_OUT } from "@/lib/motion";
import { Backdrop, capturePointer, HoldRing, SceneShell, StudioAlso, StudioHit, useHold, useStory, useStudioEdit, type SceneProps } from "../scene-kit";
import type { Scene } from "../types";

type S<T extends Scene["type"]> = Extract<Scene, { type: T }>;

/* ───────────── Wax seal: hold to break it, the letter slides out ───────────── */

export function SealScene({ scene, done, onDone }: SceneProps<S<"seal">>) {
  const { palette, fill } = useStory();
  const box = useRef<HTMLDivElement>(null);
  const hold = useHold(1300, () => {
    onDone();
  }, done);
  const p = done ? 1 : hold.progress;

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div ref={box} className="relative h-[280px] w-[min(86vw,340px)] [perspective:900px]">
        {/* Letter rises out once the seal breaks */}
        <motion.div
          className="absolute inset-x-6 top-8 grid h-[200px] place-items-center rounded-xl px-5 text-center shadow-nav"
          style={{ backgroundColor: palette.cream, color: palette.ink }}
          initial={false}
          animate={done ? { y: -120, zIndex: 3 } : { y: 0, zIndex: 0 }}
          transition={{ delay: done ? 0.45 : 0, duration: 0.9, ease: EASE_OUT }}
        >
          <StudioHit field="note">
            <p className="type-hand text-[1.65rem] leading-tight" style={{ color: palette.accent }}>
              {fill(scene.note)}
            </p>
          </StudioHit>
        </motion.div>
        {/* Envelope body */}
        <div
          className="absolute inset-x-0 bottom-0 z-[2] h-[190px] rounded-2xl"
          style={{ backgroundColor: palette.pink, boxShadow: "0 30px 50px -30px rgba(27,18,21,.5)" }}
        >
          <svg viewBox="0 0 340 190" className="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden>
            <path d="M0 190 L170 95 L340 190" fill="none" stroke={palette.fg} strokeOpacity={0.15} strokeWidth={2} />
          </svg>
        </div>
        {/* Flap folds open */}
        <motion.div
          className="absolute inset-x-0 bottom-[94px] z-[4] h-[96px] origin-top"
          style={{ transformStyle: "preserve-3d", top: 90 }}
          animate={done ? { rotateX: 180, zIndex: 1 } : { rotateX: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <svg viewBox="0 0 340 100" className="size-full" preserveAspectRatio="none" aria-hidden>
            <path d="M0 0 H340 L170 100 Z" fill={palette.accent} opacity={0.9} />
          </svg>
        </motion.div>
        {/* The seal */}
        {!done && (
          <button
            type="button"
            {...hold.handlers}
            aria-label="Press and hold to break the seal"
            className="absolute left-1/2 top-[160px] z-[5] grid size-[92px] -translate-x-1/2 -translate-y-1/2 touch-none select-none place-items-center rounded-full outline-none"
          >
            <HoldRing progress={p} size={92} color={palette.gold} track={`${palette.cream}66`} />
            <motion.span
              className="grid size-[70px] place-items-center rounded-full font-serif text-3xl italic"
              style={{ backgroundColor: palette.accent, color: palette.cream, boxShadow: `inset 0 -6px 0 ${palette.fg}33` }}
              animate={{ scale: 1 - p * 0.12, rotate: p * 8 }}
            >
              ♥
            </motion.span>
          </button>
        )}
      </div>
    </SceneShell>
  );
}

/* ───────────── Scratch card ───────────── */

export function ScratchScene({ scene, done, onDone }: SceneProps<S<"scratch">>) {
  const { palette, fill } = useStory();
  const canvas = useRef<HTMLCanvasElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const moves = useRef(0);

  useEffect(() => {
    const c = canvas.current;
    if (!c || done) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const { width, height } = c.getBoundingClientRect();
    c.width = width * dpr;
    c.height = height * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, palette.gold);
    g.addColorStop(0.5, palette.pink);
    g.addColorStop(1, palette.accent);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.font = "500 12px ui-monospace, monospace";
    for (let y = 22; y < height; y += 30)
      for (let x = (y / 30) % 2 ? 6 : 40; x < width; x += 92) ctx.fillText("SCRATCH ✦", x, y);
  }, [palette, done]);

  function scratch(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || done) return;
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    // The eraser must be fully opaque, or scratched foil only fades.
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(e.clientX - r.left, e.clientY - r.top, 24, 0, Math.PI * 2);
    ctx.fill();
    if (++moves.current % 10 === 0) {
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let clear = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 32) {
        total++;
        if (data[i] < 40) clear++;
      }
      if (clear / total > 0.5) {
        onDone();
      }
    }
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div
        ref={card}
        className="relative grid h-[220px] w-[min(86vw,340px)] place-items-center overflow-hidden rounded-[1.4rem] px-6 text-center"
        style={{ backgroundColor: palette.cream, color: palette.ink }}
      >
        <div>
          <StudioHit field="reveal">
            <p className="type-hand text-[2rem] leading-tight" style={{ color: palette.accent }}>
              {fill(scene.reveal)}
            </p>
          </StudioHit>
          {scene.sub && (
            <StudioHit field="sub">
              <p className="type-label mt-3 opacity-60">{fill(scene.sub)}</p>
            </StudioHit>
          )}
        </div>
        <motion.canvas
          ref={canvas}
          aria-label="Scratch to reveal"
          className="absolute inset-0 size-full cursor-grab touch-none"
          animate={{ opacity: done ? 0 : 1 }}
          transition={{ duration: 0.6 }}
          style={{ pointerEvents: done ? "none" : "auto" }}
          onPointerDown={(e) => {
            drawing.current = true;
            capturePointer(e);
            scratch(e);
          }}
          onPointerMove={scratch}
          onPointerUp={() => (drawing.current = false)}
          onPointerCancel={() => (drawing.current = false)}
        />
      </div>
      {!done && (
        <button type="button" onClick={onDone} className="type-label mt-4 underline-offset-4 opacity-50 hover:underline">
          Reveal it for me
        </button>
      )}
    </SceneShell>
  );
}

/* ───────────── A dark room: light every candle ───────────── */

export function LightsScene({ scene, done, onDone }: SceneProps<S<"lights">>) {
  const { palette, fill } = useStory();
  const studio = useStudioEdit();
  const [lit, setLit] = useState<boolean[]>(() => Array(scene.candles).fill(done));
  const row = useRef<HTMLDivElement>(null);
  const count = lit.filter(Boolean).length;
  const warmth = done ? 1 : count / scene.candles;

  function light(i: number) {
    if (lit[i]) return;
    const next = lit.map((v, j) => v || j === i);
    setLit(next);
    if (next.every(Boolean)) {
      onDone();
    }
  }

  return (
    <div style={{ color: warmth > 0.6 ? palette.fg : "#f7ecdf", transition: "color .8s" }}>
      <Backdrop color="#120c14">
        <motion.div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 55%, ${palette.gold}, ${palette.bg} 45%)` }}
          animate={{ opacity: warmth * 0.95 }}
          transition={{ duration: 0.8 }}
        />
      </Backdrop>
      <SceneShell
        eyebrow={scene.eyebrow}
        title={done && !studio ? scene.reveal : scene.title}
        hint={scene.hint}
        doneText={scene.done}
        done={done}
        tone={warmth > 0.6 ? "light" : "dark"}
      >
        <StudioHit field="candles">
        <div ref={row} className="flex items-end gap-5">
          {lit.map((on, i) => (
            <button
              key={i}
              type="button"
              onClick={() => light(i)}
              aria-label={on ? "Candle lit" : "Light this candle"}
              className="relative flex flex-col items-center"
            >
              <motion.span
                className="mb-1 block h-9 w-5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
                style={{ background: `radial-gradient(circle at 50% 70%, #fff6c9, ${palette.gold} 60%, #ff7a2f)`, boxShadow: `0 0 30px 8px ${palette.gold}88` }}
                initial={false}
                animate={on ? { opacity: 1, scaleY: [1, 1.12, 0.94, 1], scale: 1 } : { opacity: 0, scale: 0.3 }}
                transition={on ? { scaleY: { duration: 1, repeat: Infinity }, opacity: { duration: 0.3 } } : { duration: 0.3 }}
              />
              <span className="mb-0.5 block h-2 w-0.5 bg-current opacity-70" />
              <span
                className="block w-7 rounded-t-md"
                style={{ height: 70 + (i % 2) * 22, background: `repeating-linear-gradient(-35deg, ${palette.cream} 0 8px, ${palette.accent} 8px 14px)` }}
              />
            </button>
          ))}
        </div>
        </StudioHit>
        <StudioAlso label="Headline once every candle is lit" field="reveal">
          <p className="type-display text-balance text-3xl">
            <Accented text={fill(scene.reveal)} color={palette.accent} />
          </p>
        </StudioAlso>
      </SceneShell>
    </div>
  );
}

/* ───────────── Knock on the door ───────────── */

export function KnockScene({ scene, done, onDone }: SceneProps<S<"knock">>) {
  const { palette, fill } = useStory();
  const [knocks, setKnocks] = useState(done ? scene.knocks : 0);
  const [shake, setShake] = useState(0);
  const door = useRef<HTMLDivElement>(null);

  function knock() {
    if (done) return;
    const n = knocks + 1;
    setKnocks(n);
    setShake((s) => s + 1);
    if (n >= scene.knocks) {
      setTimeout(() => {
        onDone();
      }, 350);
    }
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div ref={door} className="relative h-[300px] w-[200px] [perspective:800px]">
        {/* What's behind the door */}
        <div
          className="absolute inset-0 grid place-items-center rounded-t-[100px] px-4 text-center"
          style={{ background: `radial-gradient(circle at 50% 40%, #fff6dc, ${palette.gold})`, color: palette.ink }}
        >
          <StudioHit field="reveal">
            <p className="type-hand text-2xl leading-tight">{fill(scene.reveal)}</p>
          </StudioHit>
        </div>
        <motion.button
          type="button"
          onClick={knock}
          aria-label={`Knock (${knocks} of ${scene.knocks})`}
          className="absolute inset-0 origin-left rounded-t-[100px] outline-none"
          style={{ backgroundColor: palette.accent, transformStyle: "preserve-3d", boxShadow: "inset 0 0 0 10px rgba(27,18,21,.08)", pointerEvents: done ? "none" : undefined }}
          animate={done ? { rotateY: -105 } : { rotateY: 0, x: shake ? [0, -6, 6, -3, 0] : 0 }}
          transition={done ? { duration: 1, ease: EASE_OUT } : { duration: 0.3 }}
          key={done ? "open" : `k${shake}`}
        >
          <span className="absolute inset-x-6 top-10 h-24 rounded-t-[60px] border-2 opacity-25" style={{ borderColor: palette.cream }} />
          <span className="absolute inset-x-6 bottom-10 h-20 rounded-md border-2 opacity-25" style={{ borderColor: palette.cream }} />
          <span className="absolute right-5 top-1/2 size-4 rounded-full" style={{ backgroundColor: palette.gold }} />
        </motion.button>
        {!done && knocks > 0 && (
          <motion.span
            key={`t${knocks}`}
            className="type-display pointer-events-none absolute -right-10 top-6 text-2xl"
            style={{ color: palette.accent }}
            initial={{ opacity: 0, y: 10, rotate: -8 }}
            animate={{ opacity: [0, 1, 0], y: -20 }}
            transition={{ duration: 0.9 }}
          >
            knock!
          </motion.span>
        )}
      </div>
      <div className="mt-6 flex gap-2 p-1.5" aria-hidden>
        {Array.from({ length: scene.knocks }).map((_, i) => (
          <span key={i} className="size-2.5 rounded-full" style={{ backgroundColor: i < knocks ? palette.accent : `${palette.fg}25` }} />
        ))}
      </div>
    </SceneShell>
  );
}

/* ───────────── Gift box: tap until it bursts open ───────────── */

export function UnwrapScene({ scene, done, onDone }: SceneProps<S<"unwrap">>) {
  const { palette, fill } = useStory();
  const [taps, setTaps] = useState(done ? scene.taps : 0);
  const box = useRef<HTMLDivElement>(null);

  function tap() {
    if (done) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= scene.taps) {
      onDone();
    }
  }

  const wobble = 4 + taps * 4;
  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div ref={box} className="relative grid h-[300px] w-[min(80vw,300px)] place-items-center">
        {/* Surprise card rises as the box leaves */}
        <motion.div
          className="w-[250px] rounded-2xl border-2 border-dashed px-5 py-5 text-center"
          style={{ backgroundColor: palette.cream, color: palette.ink, borderColor: `${palette.accent}66` }}
          initial={false}
          animate={done ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 80, scale: 0.6 }}
          transition={{ delay: done ? 0.2 : 0, type: "spring", bounce: 0.4 }}
        >
          <p className="type-label text-[10px] opacity-60">Inside</p>
          <StudioHit field="inside">
            <p className="type-hand mt-1 text-[1.7rem] leading-tight" style={{ color: palette.accent }}>
              {fill(scene.inside)}
            </p>
          </StudioHit>
          {scene.insideSub && (
            <StudioHit field="insideSub">
              <p className="type-label mt-2 text-[10px] opacity-60">{fill(scene.insideSub)}</p>
            </StudioHit>
          )}
        </motion.div>
        <AnimatePresence>
          {!done && (
            <motion.button
              key="gift"
              type="button"
              onClick={tap}
              aria-label={`Tap the gift (${taps} of ${scene.taps})`}
              className="absolute bottom-0 w-[200px] outline-none"
              initial={false}
              animate={{ rotate: taps ? [0, -wobble, wobble, -wobble / 2, 0] : 0 }}
              exit={{ y: 36, opacity: 0, scale: 0.82 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              <svg viewBox="0 0 200 190" className="h-auto w-full overflow-visible" aria-hidden>
                <rect x="20" y="70" width="160" height="115" rx="10" fill={palette.accent} />
                <rect x="88" y="70" width="24" height="115" fill={palette.gold} />
                <g>
                  <rect x="10" y="44" width="180" height="34" rx="8" fill={palette.accent} />
                  <rect x="10" y="44" width="180" height="34" rx="8" fill="#fff" opacity=".14" />
                  <rect x="88" y="44" width="24" height="34" fill={palette.gold} />
                  <path d="M100 44 C70 6, 40 26, 62 42 C72 48, 90 46, 100 44Z M100 44 C130 6, 160 26, 138 42 C128 48, 110 46, 100 44Z" fill={palette.gold} />
                </g>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {!done && (
        <div className="mt-4 flex gap-2" aria-hidden>
          {Array.from({ length: scene.taps }).map((_, i) => (
            <span key={i} className="size-2.5 rounded-full" style={{ backgroundColor: i < taps ? palette.accent : `${palette.fg}25` }} />
          ))}
        </div>
      )}
    </SceneShell>
  );
}
