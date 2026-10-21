"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useRef, useState } from "react";
import { PhotoFill } from "@/components/experiences/birthday/photo-fill";
import { Paper, SceneShell, StoryButton, StudioHit, StudioPager, Tape, usePickedItem, useStory, useStudioEdit, type SceneProps } from "../scene-kit";
import type { Scene } from "../types";

type S<T extends Scene["type"]> = Extract<Scene, { type: T }>;

/* ───────────── Receipt: each tap prints the next line ───────────── */

export function ReceiptScene({ scene, done, onDone }: SceneProps<S<"receipt">>) {
  const { palette, fill } = useStory();
  const [printed, setPrinted] = useState(done ? scene.items.length + 1 : 0);
  const slip = useRef<HTMLDivElement>(null);
  const totalShown = printed > scene.items.length;

  function print() {
    const n = printed + 1;
    setPrinted(n);
    if (n > scene.items.length) {
      onDone();
    }
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div className="flex w-[min(86vw,320px)] flex-col items-center">
        {/* Printer */}
        <div className="relative z-10 h-14 w-full rounded-2xl" style={{ backgroundColor: palette.fg }}>
          <span className="absolute inset-x-6 bottom-3 h-1.5 rounded-full opacity-60" style={{ backgroundColor: palette.bg }} />
          <span
            className="absolute right-4 top-3 size-2.5 rounded-full"
            style={{ backgroundColor: totalShown ? "#4ade80" : palette.gold }}
          />
        </div>
        {/* Paper slip grows downward */}
        <motion.div
          ref={slip}
          layout
          className="-mt-3 w-[88%] overflow-hidden px-5 pb-5 pt-6 font-mono text-[12px] uppercase"
          style={{
            backgroundColor: "#fffdf8",
            color: "#2b2326",
            clipPath: totalShown ? "polygon(0 0,100% 0,100% calc(100% - 8px),95% 100%,90% calc(100% - 8px),85% 100%,80% calc(100% - 8px),75% 100%,70% calc(100% - 8px),65% 100%,60% calc(100% - 8px),55% 100%,50% calc(100% - 8px),45% 100%,40% calc(100% - 8px),35% 100%,30% calc(100% - 8px),25% 100%,20% calc(100% - 8px),15% 100%,10% calc(100% - 8px),5% 100%,0 calc(100% - 8px))" : undefined,
          }}
        >
          <StudioHit field="store">
            <p className="text-center font-semibold">{fill(scene.store)}</p>
          </StudioHit>
          <p className="mb-3 text-center opacity-50">{new Date().toLocaleDateString("en-IN")} · counter 01</p>
          {scene.items.slice(0, printed).map((it, i) => (
            <StudioHit key={i} field="items" item={i}>
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 py-0.5">
                <span className="truncate">{fill(it.name)}</span>
                <span className="flex-1 border-b border-dotted border-current opacity-30" />
                <span>{fill(it.qty)}</span>
              </motion.p>
            </StudioHit>
          ))}
          {totalShown && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <StudioHit field="total">
                <p className="mt-3 flex justify-between border-t border-dashed border-current pt-2 font-semibold">
                  <span>Total</span>
                  <span>{fill(scene.total)}</span>
                </p>
              </StudioHit>
              <p className="mt-3 text-center opacity-50">No refunds. No returns. Keep forever.</p>
              <p className="mt-2 text-center tracking-[0.3em] opacity-70">||| || ||| | || |||</p>
            </motion.div>
          )}
        </motion.div>
      </div>
      {!totalShown && (
        <div className="mt-6">
          <StoryButton onClick={print}>{printed === 0 ? "Print my receipt" : "Keep printing"}</StoryButton>
        </div>
      )}
    </SceneShell>
  );
}

/* ───────────── Deck: swipe through the reasons ───────────── */

export function DeckScene({ scene, done, onDone }: SceneProps<S<"deck">>) {
  const { palette, fill } = useStory();
  const studio = useStudioEdit();
  const picked = usePickedItem(["cards"]);
  const [thrown, setThrown] = useState(done ? scene.cards.length : 0);
  // Studio: the card being edited sits on top, so changes show as you type.
  const gone = studio ? Math.min(picked ?? 0, scene.cards.length - 1) : thrown;
  const left = scene.cards.length - gone;

  function next() {
    const n = thrown + 1;
    setThrown(n);
    if (n >= scene.cards.length) onDone();
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div className="relative h-[300px] w-[min(78vw,280px)]">
        {left === 0 && (
          <div className="grid h-full place-items-center">
            <p className="type-accent text-3xl" style={{ color: palette.accent }}>
              …and counting.
            </p>
          </div>
        )}
        <AnimatePresence>
          {scene.cards.map((text, i) => {
            if (i < gone) return null;
            const depth = i - gone;
            if (depth > 3) return null;
            return (
              <StudioHit key={i} field="cards" item={i} className="absolute inset-0">
                <DeckCard index={i} total={scene.cards.length} depth={depth} onThrow={next}>
                  {fill(text)}
                </DeckCard>
              </StudioHit>
            );
          })}
        </AnimatePresence>
      </div>
      {left > 0 && !studio && (
        <p className="type-label mt-6 tabular-nums opacity-60">
          {gone + 1} / {scene.cards.length}
        </p>
      )}
      <StudioPager count={scene.cards.length} field="cards" current={gone} />
    </SceneShell>
  );
}

function DeckCard({
  children,
  index,
  total,
  depth,
  onThrow,
}: {
  children: string;
  index: number;
  total: number;
  depth: number;
  onThrow: () => void;
}) {
  const { palette } = useStory();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-16, 16]);
  const top = depth === 0;
  const tint = [palette.cream, palette.pink, palette.gold, palette.cream][index % 4];
  const dragged = useRef(false);

  return (
    <motion.button
      type="button"
      className="absolute inset-0 flex flex-col justify-between rounded-[1.6rem] p-6 text-left shadow-[0_24px_50px_-28px_rgba(27,18,21,0.6)]"
      style={{ x, rotate: top ? rotate : depth * (index % 2 ? 3 : -3), zIndex: 10 - depth, backgroundColor: tint, color: palette.ink }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.04, y: depth * 10, opacity: 1 }}
      exit={{ x: x.get() < 0 ? -420 : 420, rotate: x.get() < 0 ? -30 : 30, opacity: 0, transition: { duration: 0.4 } }}
      drag={top ? "x" : false}
      dragSnapToOrigin
      onDragStart={() => {
        dragged.current = true;
      }}
      onDragEnd={(_: unknown, info: PanInfo) => {
        window.setTimeout(() => (dragged.current = false), 0);
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) onThrow();
      }}
      onClick={() => {
        // The click that ends a swipe isn't a tap: don't throw a second card.
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        if (top) onThrow();
      }}
      tabIndex={top ? 0 : -1}
      aria-label={top ? `${children}. Next` : undefined}
    >
      <span className="type-label text-[10px] opacity-50">
        No. {index + 1} of {total}
      </span>
      <span className="type-accent text-[1.75rem] leading-tight">{children}</span>
      <span className="text-2xl" style={{ color: palette.accent }} aria-hidden>
        ♥
      </span>
    </motion.button>
  );
}

/* ───────────── Coupon: tear along the dotted line ───────────── */

export function CouponScene({ scene, done, onDone }: SceneProps<S<"coupon">>) {
  const { palette, fill } = useStory();
  const [torn, setTorn] = useState(done);
  const [pull, setPull] = useState(0);
  const ticket = useRef<HTMLDivElement>(null);

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div ref={ticket} className="relative w-[min(88vw,340px)]">
        <motion.div
          animate={torn ? { y: -30, rotate: -4 } : { y: 0, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative rounded-t-2xl px-6 pb-6 pt-5 text-center"
          style={{ backgroundColor: palette.cream, color: palette.ink }}
        >
          <p className="type-label text-[10px] opacity-60">Admit one · valid forever</p>
          <StudioHit field="offer" className="mx-auto w-fit">
            <p className="type-accent mt-2 text-[1.9rem] leading-tight" style={{ color: palette.accent }}>
              {fill(scene.offer)}
            </p>
          </StudioHit>
          <StudioHit field="terms" className="mx-auto w-fit">
            <p className="type-label mt-3 text-[10px] opacity-60">{fill(scene.terms)}</p>
          </StudioHit>
        </motion.div>
        {/* The perforation and the stub you drag */}
        <div className="relative">
          <div className="absolute inset-x-3 top-0 border-t-2 border-dashed" style={{ borderColor: `${palette.fg}40` }} />
          <motion.div
            className="flex h-16 items-center justify-between rounded-b-2xl px-4"
            style={{ backgroundColor: palette.pink, color: palette.ink }}
            animate={torn ? { y: 40, opacity: 0.4, rotate: 3 } : { y: 0 }}
          >
            <span className="type-label text-[10px] opacity-60">Keep this stub</span>
            {!torn && (
              <div className="relative h-10 w-44 rounded-full" style={{ backgroundColor: `${palette.fg}12` }}>
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 132 }}
                  dragElastic={0}
                  dragMomentum={false}
                  onDrag={(_, info) => setPull(Math.min(1, Math.max(0, info.offset.x / 132)))}
                  onDragEnd={() => {
                    if (pull > 0.85) {
                      setTorn(true);
                      onDone();
                    } else setPull(0);
                  }}
                  animate={pull === 0 ? { x: 0 } : undefined}
                  className="absolute left-1 top-1 grid size-8 cursor-grab touch-none place-items-center rounded-full active:cursor-grabbing"
                  style={{ backgroundColor: palette.accent, color: palette.cream }}
                  aria-label="Drag to tear off the coupon"
                  role="slider"
                  aria-valuenow={Math.round(pull * 100)}
                >
                  ✂
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      {!done && (
        <button
          type="button"
          onClick={() => {
            setTorn(true);
            onDone();
          }}
          className="type-label mt-6 underline-offset-4 opacity-50 hover:underline"
        >
          Tear it for me
        </button>
      )}
    </SceneShell>
  );
}

/* ───────────── Jar of notes ───────────── */

export function JarScene({ scene, done, onDone }: SceneProps<S<"jar">>) {
  const { palette, fill } = useStory();
  const studio = useStudioEdit();
  const picked = usePickedItem(["notes"]);
  const [drawn, setOpened] = useState(done ? scene.notes.length : 0);
  const [shakeKey, setShakeKey] = useState(0);
  // Studio: show the note being edited instead of the last one drawn.
  const opened = studio ? Math.min(picked ?? 0, scene.notes.length - 1) + 1 : drawn;
  const current = opened > 0 ? scene.notes[opened - 1] : null;
  const left = scene.notes.length - drawn;

  function draw() {
    if (left === 0) return;
    setShakeKey((k) => k + 1);
    const n = drawn + 1;
    setOpened(n);
    if (n >= scene.notes.length) onDone();
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div className="flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={opened}
              initial={{ opacity: 0, y: 60, scaleY: 0.2 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", bounce: 0.35 }}
            >
              <StudioHit field="notes" item={opened - 1}>
                <Paper className="w-[min(80vw,300px)] -rotate-2 px-6 py-5 text-left">
                  <p className="type-label text-[10px] opacity-50">
                    Note {opened} of {scene.notes.length}
                  </p>
                  <p className="mt-2 text-[1.1rem] leading-snug">{fill(current)}</p>
                </Paper>
              </StudioHit>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          key={shakeKey}
          type="button"
          onClick={draw}
          disabled={left === 0}
          animate={shakeKey ? { rotate: [0, -8, 8, -4, 0] } : {}}
          transition={{ duration: 0.45 }}
          aria-label={left ? `Shake the jar (${left} notes left)` : "The jar is empty"}
          className="relative h-[170px] w-[140px] outline-none"
        >
          <svg viewBox="0 0 140 170" className="size-full" aria-hidden>
            <rect x="34" y="4" width="72" height="22" rx="6" fill={palette.accent} />
            <path d="M28 30 h84 a14 14 0 0 1 14 14 v100 a22 22 0 0 1 -22 22 h-68 a22 22 0 0 1 -22 -22 v-100 a14 14 0 0 1 14 -14z" fill={palette.cream} fillOpacity={0.55} stroke={palette.fg} strokeOpacity={0.3} strokeWidth={3} />
            {Array.from({ length: left }).map((_, i) => (
              <rect
                key={i}
                x={34 + ((i * 23) % 58)}
                y={150 - Math.floor(i / 3) * 16 - 14}
                width={30}
                height={14}
                rx={3}
                fill={[palette.pink, palette.gold, palette.accent][i % 3]}
                transform={`rotate(${(i % 2 ? 12 : -10) + i * 3} ${49 + ((i * 23) % 58)} ${157 - Math.floor(i / 3) * 16})`}
              />
            ))}
          </svg>
        </motion.button>
      </div>
      <StudioPager count={scene.notes.length} field="notes" current={opened - 1} />
    </SceneShell>
  );
}

/* ───────────── Polaroids: shake each one until it develops ───────────── */

const TILTS = [-4, 3, -2, 5, -5, 2];

export function PolaroidsScene({ scene, done, onDone }: SceneProps<S<"polaroids">>) {
  const { palette, fill } = useStory();
  const [developed, setDeveloped] = useState<boolean[]>(() => scene.photos.map(() => done));
  const [shaking, setShaking] = useState<number | null>(null);
  // Several photos can be developing at once, so track progress outside render.
  const progress = useRef(developed);

  function develop(i: number) {
    if (progress.current[i]) return;
    setShaking(i);
    setTimeout(() => {
      setShaking(null);
      const next = progress.current.map((v, j) => v || j === i);
      progress.current = next;
      setDeveloped(next);
      if (next.every(Boolean)) onDone();
    }, 700);
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3">
        {scene.photos.map((ph, i) => (
          <StudioHit key={i} field="photos" item={i}>
          <motion.button
            type="button"
            onClick={() => develop(i)}
            className="relative w-[min(40vw,180px)] bg-white p-2 pb-12 text-left shadow-[0_18px_30px_-18px_rgba(27,18,21,.5)]"
            initial={{ opacity: 0, y: 20, rotate: TILTS[i % TILTS.length] * 2 }}
            animate={
              shaking === i
                ? { opacity: 1, y: 0, x: [0, -10, 10, -8, 8, 0], rotate: [0, -6, 6, -4, 4, 0] }
                : { opacity: 1, y: 0, rotate: TILTS[i % TILTS.length] }
            }
            transition={shaking === i ? { duration: 0.7 } : { delay: i * 0.08, type: "spring", bounce: 0.35 }}
            aria-label={developed[i] ? fill(ph.caption) : "Shake to develop this photo"}
          >
            <Tape
              className={i % 2 ? "-right-4 -top-2 w-16 rotate-[35deg]" : "-left-4 -top-2 w-16 -rotate-[35deg]"}
              color={[palette.pink, palette.gold, palette.accent][i % 3]}
            />
            <div className="relative aspect-square overflow-hidden">
              <PhotoFill src={ph.src} tone={ph.tone} alt={fill(ph.caption)} iconClassName="size-10" className="size-full" />
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(160deg,#3b3a3f,#1d1c20)" }}
                initial={false}
                animate={{ opacity: developed[i] ? 0 : 0.92 }}
                transition={{ duration: 1.6 }}
              />
              {!developed[i] && (
                <span className="type-hand absolute inset-0 grid place-items-center text-lg text-white/75">
                  shake me!
                </span>
              )}
            </div>
            <span
              className="absolute bottom-1.5 left-3 right-3 transition-opacity duration-700"
              style={{ opacity: developed[i] ? 1 : 0, color: palette.ink }}
            >
              <span className="type-hand block truncate text-[17px] leading-tight">{fill(ph.caption)}</span>
              {ph.date && <span className="type-hand block text-xs opacity-55">{ph.date}</span>}
            </span>
          </motion.button>
          </StudioHit>
        ))}
      </div>
    </SceneShell>
  );
}
