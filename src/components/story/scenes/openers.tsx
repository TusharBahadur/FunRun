"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Accented } from "@/components/experiences/birthday/accented";
import { EASE_OUT } from "@/lib/motion";
import { DEFAULT_CALLER, DEFAULT_PARTY, GiftCall } from "../gift-call";
import { Backdrop, capturePointer, HoldRing, SceneShell, StudioAlso, StudioHit, useHold, useStory, useStudioEdit, type SceneProps } from "../scene-kit";
import { Sticker, stickerImage } from "../stickers";
import type { Scene } from "../types";

type S<T extends Scene["type"]> = Extract<Scene, { type: T }>;

/* ───────────── Wax seal: hold to break it, the letter slides out ───────────── */

// One smooth beat after another: the seal cracks, the flap swings open and
// tucks behind, the letter rises out of the pocket and settles in front.
const SEAL_EASE = [0.65, 0, 0.35, 1] as const;
const ENV_H = 200; // envelope height
const FLAP_H = 112; // flap depth (the V)
const LETTER_H = 160;

export function SealScene({ scene, done, onDone }: SceneProps<S<"seal">>) {
  const { palette, fill } = useStory();
  // Already opened when we got here (going back a page)? Show it open, no replay.
  const [cracked, setCracked] = useState(false);
  const hold = useHold(1300, () => {
    setCracked(true);
    onDone();
  }, done);
  const p = done ? 1 : hold.progress;
  const open = done;

  // Layering changes at set moments (z-index can't tween): the flap drops
  // behind the letter halfway through its swing, and the letter comes in
  // front of the pocket once it's fully out. Opened earlier? Already final.
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (!cracked) return;
    const a = setTimeout(() => setStage(1), 600);
    const b = setTimeout(() => setStage(2), 1650);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [cracked]);
  const flapBehind = open && (!cracked || stage >= 1);
  const letterFront = open && (!cracked || stage >= 2);

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div className="relative h-[340px] w-[min(86vw,340px)] [perspective:1100px]">
        {/* Inside of the envelope (the back wall) */}
        <div
          className="absolute inset-x-0 bottom-0 overflow-hidden rounded-2xl"
          style={{ height: ENV_H, backgroundColor: palette.pink, boxShadow: "0 34px 50px -30px rgba(27,18,21,.5)" }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: palette.fg, opacity: 0.1 }} />
        </div>

        {/* The letter: tucked in, then up and out, then forward */}
        <motion.div
          className="absolute inset-x-[18px] grid place-items-center rounded-xl px-5 text-center"
          style={{
            bottom: 14,
            height: LETTER_H,
            backgroundColor: palette.cream,
            color: palette.ink,
            boxShadow: "0 18px 34px -18px rgba(27,18,21,.45)",
            zIndex: letterFront ? 5 : 1,
          }}
          initial={false}
          animate={open ? { y: [0, -186, -150], scale: [1, 1, 1.04] } : { y: 0, scale: 1 }}
          transition={open ? { delay: 0.75, duration: 1.5, times: [0, 0.6, 1], ease: SEAL_EASE } : { duration: 0 }}
        >
          <StudioHit field="note">
            <p className="type-display text-[1.5rem] font-semibold leading-snug" style={{ color: palette.accent }}>
              {fill(scene.note)}
            </p>
          </StudioHit>
        </motion.div>

        {/* Front pocket, with the V cut out at the top */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] overflow-hidden rounded-2xl" style={{ height: ENV_H }}>
          <svg viewBox={`0 0 340 ${ENV_H}`} className="size-full" preserveAspectRatio="none" aria-hidden>
            <path d={`M0 0 L170 ${FLAP_H - 4} L340 0 V${ENV_H} H0 Z`} fill={palette.pink} />
            <path d={`M0 ${ENV_H} L150 ${ENV_H * 0.52} M340 ${ENV_H} L190 ${ENV_H * 0.52}`} stroke={palette.fg} strokeOpacity={0.12} strokeWidth={1.5} fill="none" />
            <path d={`M0 0 L170 ${FLAP_H - 4} L340 0`} stroke={palette.fg} strokeOpacity={0.1} strokeWidth={1.5} fill="none" />
          </svg>
        </div>

        {/* The flap: swings up and over, then drops behind the letter */}
        <motion.div
          className="absolute inset-x-0 origin-top"
          style={{ top: 340 - ENV_H, height: FLAP_H, transformStyle: "preserve-3d", zIndex: flapBehind ? 0 : 4 }}
          initial={false}
          animate={{ rotateX: open ? 180 : 0 }}
          transition={open ? { delay: 0.2, duration: 0.8, ease: SEAL_EASE } : { duration: 0 }}
        >
          {/* Outside of the flap */}
          <svg viewBox={`0 0 340 ${FLAP_H}`} className="absolute inset-0 size-full [backface-visibility:hidden]" preserveAspectRatio="none" aria-hidden>
            <path d={`M0 0 H340 L170 ${FLAP_H} Z`} fill={palette.accent} />
            <path d={`M0 0 H340 L170 ${FLAP_H} Z`} fill="url(#seal-sheen)" />
            <defs>
              <linearGradient id="seal-sheen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
                <stop offset="1" stopColor="#000" stopOpacity="0.08" />
              </linearGradient>
            </defs>
          </svg>
          {/* Inside of the flap, seen once it's open */}
          <svg
            viewBox={`0 0 340 ${FLAP_H}`}
            className="absolute inset-0 size-full [backface-visibility:hidden] [transform:rotateX(180deg)]"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d={`M0 0 H340 L170 ${FLAP_H} Z`} fill={palette.pink} />
            <path d={`M0 0 H340 L170 ${FLAP_H} Z`} fill={palette.fg} fillOpacity={0.06} />
          </svg>
        </motion.div>

        {/* The seal: hold it, it cracks in two */}
        {!done && (
          <button
            type="button"
            {...hold.handlers}
            aria-label="Press and hold to break the seal"
            className="absolute left-1/2 z-[6] grid size-[92px] -translate-x-1/2 -translate-y-1/2 touch-none select-none place-items-center rounded-full outline-none"
            style={{ top: 340 - ENV_H + FLAP_H - 18 }}
          >
            <HoldRing progress={p} size={92} color={palette.gold} track={`${palette.cream}66`} />
            <motion.span
              className="grid size-[70px] place-items-center rounded-full type-display text-3xl font-semibold"
              style={{ backgroundColor: palette.accent, color: palette.cream, boxShadow: `inset 0 -6px 0 ${palette.fg}33, 0 6px 14px -6px rgba(0,0,0,.4)` }}
              animate={{ scale: 1 - p * 0.1, rotate: p * 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              ♥
            </motion.span>
          </button>
        )}
        {cracked &&
          [-1, 1].map((side) => (
            <motion.span
              key={side}
              aria-hidden
              className="pointer-events-none absolute left-1/2 z-[6] grid size-[70px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full type-display text-3xl font-semibold"
              style={{
                top: 340 - ENV_H + FLAP_H - 18,
                backgroundColor: palette.accent,
                color: palette.cream,
                clipPath: side < 0 ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)",
              }}
              initial={{ x: 0, y: 0, rotate: 6, opacity: 1 }}
              animate={{ x: side * 46, y: 26, rotate: 6 + side * 28, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              ♥
            </motion.span>
          ))}
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
            <p className="type-display text-[1.7rem] font-semibold leading-snug" style={{ color: palette.accent }}>
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
            <Accented text={fill(scene.reveal)} color={palette.accent} face="sans" />
          </p>
        </StudioAlso>
      </SceneShell>
    </div>
  );
}

/* ───────────── Incoming call: slide to answer, then it connects ───────────── */

export function KnockScene({ scene, done, onDone }: SceneProps<S<"knock">>) {
  const { fill, palette } = useStory();
  const caller = scene.caller ?? DEFAULT_CALLER;
  const party = scene.party ?? DEFAULT_PARTY;
  const callerSrc = stickerImage(caller);

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done} layout="stack">
      <div className="relative">
        <GiftCall
          open={done}
          onAnswer={() => {
            if (!done) onDone();
          }}
          caller={caller}
          party={party}
          stickers={scene.stickers}
          reveal={
            <StudioHit field="reveal">
              <p className="type-display text-[1.15rem] font-semibold leading-snug">{fill(scene.reveal)}</p>
            </StudioHit>
          }
        />
      </div>
      <StudioAlso label="Who’s calling — before they pick up" field="caller">
        <div className="relative w-24 overflow-hidden rounded-[1.6rem]" style={{ backgroundColor: palette.cream }}>
          <span className="relative block aspect-[9/15] w-full">
            {callerSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={callerSrc} alt="" className="size-full object-cover" />
            ) : (
              <Sticker id={caller} className="size-full shadow-none" />
            )}
          </span>
        </div>
      </StudioAlso>
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
            <p className="type-display mt-1 text-[1.5rem] font-semibold leading-snug" style={{ color: palette.accent }}>
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
