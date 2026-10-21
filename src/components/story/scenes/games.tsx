"use client";

import { AnimatePresence, motion } from "motion/react";
import { Cake, Flower2, Gem, Heart, Star, Sun, type LucideIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Accented } from "@/components/experiences/birthday/accented";
import { EASE_OUT } from "@/lib/motion";
import { Backdrop, Paper, SceneShell, StoryButton, StudioAlso, StudioHit, StudioPager, usePickedItem, useStory, useStudioEdit, type SceneProps } from "../scene-kit";
import type { Scene } from "../types";

type S<T extends Scene["type"]> = Extract<Scene, { type: T }>;

/* ───────────── Quiz: every answer is right, every reply is cheeky ───────────── */

export function QuizScene({ scene, done, onDone }: SceneProps<S<"quiz">>) {
  const { palette, fill } = useStory();
  const studio = useStudioEdit();
  const pickedQuestion = usePickedItem(["questions", "q", "options", "reply"]);
  const [played, setIndex] = useState(done ? scene.questions.length - 1 : 0);
  const [answer, setPicked] = useState<number | null>(done ? 0 : null);
  // Studio: the question being edited, with its reply showing and no answer chosen.
  const index = studio ? Math.min(pickedQuestion ?? 0, scene.questions.length - 1) : played;
  const picked = studio ? null : answer;
  const q = scene.questions[index];
  const last = index === scene.questions.length - 1;

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (last) onDone();
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="w-[min(90vw,380px)]"
        >
          <p className="type-label opacity-60">
            Question {index + 1} of {scene.questions.length}
          </p>
          <StudioHit field="q" item={index}>
            <p className="mt-2 text-xl font-medium leading-snug">{fill(q.q)}</p>
          </StudioHit>
          <StudioHit field="options" item={index} className="mt-5">
          <div className="grid gap-2.5">
            {q.options.map((opt, i) => {
              const chosen = picked === i;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-colors"
                  style={{
                    borderColor: chosen ? palette.accent : `${palette.fg}25`,
                    backgroundColor: chosen ? palette.accent : "transparent",
                    color: chosen ? palette.cream : palette.fg,
                    opacity: picked !== null && !chosen ? 0.45 : 1,
                  }}
                >
                  {fill(opt)}
                </motion.button>
              );
            })}
          </div>
          </StudioHit>
          {(picked !== null || studio) && (
            <StudioHit field="reply" item={index} className="mt-5">
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="type-accent text-2xl" style={{ color: palette.accent }}>
                {fill(q.reply)}
              </motion.p>
            </StudioHit>
          )}
          {picked !== null && !last && (
            <div className="mt-5">
              <StoryButton
                onClick={() => {
                  setIndex(index + 1);
                  setPicked(null);
                }}
              >
                Next question
              </StoryButton>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <StudioPager count={scene.questions.length} field="questions" current={index} />
    </SceneShell>
  );
}

/* ───────────── Memory match ───────────── */

const ICONS: Record<S<"match">["symbols"][number], LucideIcon> = {
  heart: Heart,
  star: Star,
  cake: Cake,
  sun: Sun,
  ring: Gem,
  flower: Flower2,
};

export function MatchScene({ scene, done, onDone }: SceneProps<S<"match">>) {
  const { palette } = useStory();
  const board = useRef<HTMLDivElement>(null);
  // A fixed shuffle, so the board is the same for everyone.
  const cards = useMemo(() => {
    const pairs = scene.symbols.flatMap((s) => [s, s]);
    return pairs.map((s, i) => ({ s, k: (i * 7 + 3) % pairs.length })).sort((a, b) => a.k - b.k).map((c) => c.s);
  }, [scene.symbols]);
  const [matched, setMatched] = useState<boolean[]>(() => cards.map(() => done));
  const [open, setOpen] = useState<number[]>([]);

  function flip(i: number) {
    if (matched[i] || open.includes(i) || open.length === 2) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      const [a, b] = next;
      if (cards[a] === cards[b]) {
        const m = matched.map((v, j) => v || j === a || j === b);
        setTimeout(() => {
          setMatched(m);
          setOpen([]);
          if (m.every(Boolean)) {
            onDone();
          }
        }, 350);
      } else setTimeout(() => setOpen([]), 800);
    }
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <StudioHit field="symbols">
      <div ref={board} className="grid grid-cols-3 gap-3 [perspective:800px]">
        {cards.map((s, i) => {
          const Icon = ICONS[s];
          const up = matched[i] || open.includes(i);
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => flip(i)}
              className="relative size-[min(26vw,96px)] rounded-2xl"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: up ? 180 : 0, scale: matched[i] ? 0.94 : 1 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              aria-label={up ? s : "Hidden card"}
            >
              <span
                className="absolute inset-0 grid place-items-center rounded-2xl [backface-visibility:hidden]"
                style={{ backgroundColor: palette.accent, color: palette.cream }}
              >
                ✦
              </span>
              <span
                className="absolute inset-0 grid place-items-center rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
                style={{ backgroundColor: palette.cream, color: palette.accent }}
              >
                <Icon className="size-9" strokeWidth={1.8} />
              </span>
            </motion.button>
          );
        })}
      </div>
      </StudioHit>
    </SceneShell>
  );
}

/* ───────────── Connect the stars into a heart ───────────── */

const HEART_STARS: [number, number][] = [
  [150, 250], [92, 196], [58, 138], [70, 82], [116, 62], [150, 98], [184, 62], [230, 82], [242, 138], [208, 196],
];

export function StarsScene({ scene, done, onDone }: SceneProps<S<"stars">>) {
  const { palette, fill } = useStory();
  const studio = useStudioEdit();
  const [count, setCount] = useState(done ? HEART_STARS.length : 0);
  const sky = useRef<HTMLDivElement>(null);
  const complete = count >= HEART_STARS.length;

  function tap(i: number) {
    if (i !== count) return;
    const n = count + 1;
    setCount(n);
    if (n === HEART_STARS.length) {
      onDone();
    }
  }

  const points = HEART_STARS.slice(0, count);
  const path = points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ") + (complete ? " Z" : "");

  return (
    <div style={{ color: "#f4ecff" }}>
      <Backdrop color="radial-gradient(circle at 50% 30%, #2a1f4d, #0d0a1a 70%)">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="absolute size-0.5 rounded-full bg-white"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, opacity: 0.3 + ((i * 7) % 5) / 10 }}
          />
        ))}
      </Backdrop>
      <SceneShell eyebrow={scene.eyebrow} title={complete && !studio ? scene.reveal : scene.title} hint={scene.hint} doneText={scene.done} done={done} tone="dark">
        <div ref={sky} className="relative w-[min(86vw,300px)]">
          <svg viewBox="0 0 300 300" className="h-auto w-full overflow-visible">
            <motion.path
              d={path}
              fill={complete ? palette.accent : "none"}
              fillOpacity={complete ? 0.35 : 0}
              stroke={palette.gold}
              strokeWidth={2}
              strokeLinejoin="round"
              transition={{ duration: 0.6 }}
            />
            {HEART_STARS.map(([x, y], i) => {
              const lit = i < count;
              const next = i === count;
              return (
                <g key={i} onClick={() => tap(i)} className={next ? "cursor-pointer" : ""} role={next ? "button" : undefined} aria-label={next ? `Star ${i + 1}` : undefined}>
                  <circle cx={x} cy={y} r={22} fill="transparent" />
                  {next && (
                    <motion.circle cx={x} cy={y} r={14} fill="none" stroke={palette.gold} strokeWidth={1.5} animate={{ r: [10, 18, 10], opacity: [0.8, 0, 0.8] }} transition={{ duration: 1.4, repeat: Infinity }} />
                  )}
                  <path
                    d="M0 -1 C0.1 -0.3 0.3 -0.1 1 0 C0.3 0.1 0.1 0.3 0 1 C-0.1 0.3 -0.3 0.1 -1 0 C-0.3 -0.1 -0.1 -0.3 0 -1Z"
                    transform={`translate(${x} ${y}) scale(${lit ? 9 : 6})`}
                    fill={lit ? palette.gold : "#ffffff"}
                    opacity={lit || next ? 1 : 0.55}
                  />
                </g>
              );
            })}
          </svg>
        </div>
        <StudioAlso label="Headline once the heart is drawn" field="reveal">
          <p className="type-display text-balance text-3xl">
            <Accented text={fill(scene.reveal)} color={palette.pink} />
          </p>
        </StudioAlso>
      </SceneShell>
    </div>
  );
}

/* ───────────── "Will you…?": the No button runs away ───────────── */

export function QuestionScene({ scene, done, onDone }: SceneProps<S<"question">>) {
  const { palette, fill, celebrate } = useStory();
  const studio = useStudioEdit();
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ x: 70, y: 0 });
  const yes = useRef<HTMLButtonElement>(null);

  function dodge() {
    const n = dodges + 1;
    setDodges(n);
    const angle = n * 2.4;
    setPos({ x: Math.round(Math.cos(angle) * 110), y: Math.round(Math.sin(angle) * 90) });
  }

  const noLabels = [scene.no, "Are you sure?", "Really sure?", "Think again", "Okay, try Yes", "Yes is right there"];

  if (studio) {
    return (
      <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
        <StudioHit field="question">
          <p className="max-w-sm text-2xl font-medium leading-snug">{fill(scene.question)}</p>
        </StudioHit>
        <div className="mt-10 flex items-center justify-center gap-4">
          <StudioHit field="yes">
            <span className="flex h-14 items-center rounded-full px-10 text-lg font-semibold" style={{ backgroundColor: palette.accent, color: palette.cream }}>
              {fill(scene.yes)}
            </span>
          </StudioHit>
          <StudioHit field="no">
            <span className="flex h-11 items-center rounded-full border px-5 text-sm" style={{ borderColor: `${palette.fg}40` }}>
              {fill(scene.no)}
            </span>
          </StudioHit>
        </div>
        <StudioAlso label="After they say yes" field="after">
          <p className="type-accent text-[2rem] leading-tight" style={{ color: palette.accent }}>
            {fill(scene.after)}
          </p>
        </StudioAlso>
      </SceneShell>
    );
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      {done ? (
        <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="type-accent text-[2.4rem] leading-tight" style={{ color: palette.accent }}>
          {fill(scene.after)}
        </motion.p>
      ) : (
        <>
          <p className="max-w-sm text-2xl font-medium leading-snug">{fill(scene.question)}</p>
          <div className="relative mt-12 grid h-40 w-full max-w-sm place-items-center">
            <motion.button
              ref={yes}
              type="button"
              onClick={() => {
                onDone();
                celebrate(yes.current);
              }}
              animate={{ scale: 1 + Math.min(dodges, 6) * 0.12 }}
              className="z-10 h-14 rounded-full px-10 text-lg font-semibold"
              style={{ backgroundColor: palette.accent, color: palette.cream }}
            >
              {fill(scene.yes)}
            </motion.button>
            <motion.button
              type="button"
              onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
              onPointerDown={dodge}
              onClick={(e) => e.preventDefault()}
              animate={{ x: pos.x, y: pos.y }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute h-11 rounded-full border px-5 text-sm"
              style={{ borderColor: `${palette.fg}40` }}
            >
              {noLabels[Math.min(dodges, noLabels.length - 1)]}
            </motion.button>
          </div>
        </>
      )}
    </SceneShell>
  );
}

/* ───────────── Ring box ───────────── */

export function RingboxScene({ scene, done, onDone }: SceneProps<S<"ringbox">>) {
  const { palette, fill, celebrate } = useStory();
  const box = useRef<HTMLButtonElement>(null);

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <motion.button
        ref={box}
        type="button"
        onClick={() => {
          if (done) return;
          onDone();
          setTimeout(() => celebrate(box.current), 500);
        }}
        className="relative h-[200px] w-[200px] [perspective:700px]"
        aria-label="Open the box"
        animate={done ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 1.6, repeat: done ? 0 : Infinity }}
      >
        {/* Base */}
        <div className="absolute inset-x-6 bottom-6 h-24 rounded-2xl" style={{ backgroundColor: palette.accent, boxShadow: "inset 0 -10px 0 rgba(27,18,21,.18)" }}>
          <div className="absolute inset-x-5 top-3 h-12 rounded-xl" style={{ backgroundColor: palette.fg, opacity: 0.85 }} />
          {/* Ring */}
          <motion.div
            className="absolute left-1/2 top-0 -translate-x-1/2"
            initial={false}
            animate={done ? { y: -46, opacity: 1 } : { y: 6, opacity: 0 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
          >
            <svg width="70" height="70" viewBox="0 0 70 70" aria-hidden>
              <circle cx="35" cy="44" r="18" fill="none" stroke={palette.gold} strokeWidth="6" />
              <path d="M35 8 l10 10 -10 10 -10 -10z" fill="#e8f6ff" stroke="#9bd7ff" strokeWidth="2" />
              <motion.path d="M54 10 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" animate={{ scale: [0.6, 1.2, 0.6] }} transition={{ duration: 1.2, repeat: Infinity }} />
            </svg>
          </motion.div>
        </div>
        {/* Lid */}
        <motion.div
          className="absolute inset-x-5 top-[54px] h-14 origin-bottom rounded-2xl"
          style={{ backgroundColor: palette.accent, transformStyle: "preserve-3d", boxShadow: "inset 0 -8px 0 rgba(255,255,255,.12)" }}
          animate={done ? { rotateX: 110, y: -10 } : { rotateX: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        />
      </motion.button>
      {done && (
        <StudioHit field="question" className="mt-6">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="type-accent text-[2rem] leading-tight" style={{ color: palette.accent }}>
            {fill(scene.question)}
          </motion.p>
        </StudioHit>
      )}
    </SceneShell>
  );
}

/* ───────────── Bouquet: add flowers to the vase ───────────── */

const FLOWER_SPOTS: [number, number, number][] = [
  [120, 70, -4], [80, 92, -18], [160, 90, 16], [100, 48, -8], [142, 46, 10], [60, 120, -26], [182, 118, 24],
];

export function BouquetScene({ scene, done, onDone }: SceneProps<S<"bouquet">>) {
  const { palette, fill } = useStory();
  const total = Math.min(scene.flowers, FLOWER_SPOTS.length);
  const [count, setCount] = useState(done ? total : 0);
  const vase = useRef<HTMLDivElement>(null);
  const colors = [palette.accent, palette.pink, palette.gold, palette.cream];

  function add() {
    const n = count + 1;
    setCount(n);
    if (n >= total) {
      onDone();
    }
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div ref={vase} className="relative w-[240px]">
        <StudioHit field="flowers">
        <svg viewBox="0 0 240 280" className="h-auto w-full overflow-visible" aria-hidden>
          {FLOWER_SPOTS.slice(0, count).map(([x, y, r], i) => (
            <motion.g key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} style={{ originX: `${x}px`, originY: `${y}px` }}>
              <path d={`M${x} ${y + 6} Q ${x + r * 0.3} ${y + 70}, 120 190`} stroke="#3f7a4a" strokeWidth={3} fill="none" />
              {Array.from({ length: 6 }).map((_, p) => (
                <ellipse key={p} cx={x} cy={y - 12} rx={7} ry={13} fill={colors[i % colors.length]} transform={`rotate(${p * 60 + r} ${x} ${y})`} />
              ))}
              <circle cx={x} cy={y} r={7} fill={i % 2 ? palette.gold : palette.fg} />
            </motion.g>
          ))}
          <path d="M80 180 h80 l-10 90 h-60z" fill={palette.cream} stroke={palette.fg} strokeOpacity={0.2} strokeWidth={2} />
          <path d="M84 206 h72" stroke={palette.accent} strokeWidth={4} opacity={0.6} />
        </svg>
        </StudioHit>
        {done && (
          <motion.div initial={{ opacity: 0, rotate: 0, y: 10 }} animate={{ opacity: 1, rotate: -6, y: 0 }} className="absolute -right-10 bottom-10">
            <StudioHit field="card">
              <Paper className="px-3 py-2">
                <p className="type-accent text-lg leading-tight" style={{ color: palette.accent }}>
                  {fill(scene.card)}
                </p>
              </Paper>
            </StudioHit>
          </motion.div>
        )}
      </div>
      {count < total && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <StoryButton onClick={add}>Add a flower</StoryButton>
          <span className="type-label opacity-60 tabular-nums">
            {count} / {total}
          </span>
        </div>
      )}
    </SceneShell>
  );
}

/* ───────────── Award: polish it until the engraving shows ───────────── */

const POLISH = 6;

export function AwardScene({ scene, done, onDone }: SceneProps<S<"award">>) {
  const { palette, fill } = useStory();
  const [rubs, setRubs] = useState(done ? POLISH : 0);
  const prize = useRef<HTMLButtonElement>(null);
  const shine = rubs / POLISH;

  function rub() {
    if (rubs >= POLISH) return;
    const n = rubs + 1;
    setRubs(n);
    if (n === POLISH) {
      onDone();
    }
  }

  const metal = `linear-gradient(135deg, #8a6a1f, ${palette.gold} 45%, #fff3c4 55%, ${palette.gold} 65%, #8a6a1f)`;
  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <StudioHit field="trophy">
      <motion.button
        ref={prize}
        type="button"
        onClick={rub}
        whileTap={{ scale: 0.96, rotate: -2 }}
        className="relative flex flex-col items-center outline-none"
        aria-label={shine < 1 ? "Polish the award" : "Polished"}
      >
        {scene.trophy === "cup" ? (
          <>
            <div className="relative h-36 w-40 rounded-b-[80px] rounded-t-xl" style={{ background: metal, filter: `grayscale(${1 - shine}) brightness(${0.7 + shine * 0.3})` }}>
              <span className="absolute -left-8 top-4 h-16 w-10 rounded-l-full border-[7px] border-r-0" style={{ borderColor: palette.gold, opacity: 0.4 + shine * 0.6 }} />
              <span className="absolute -right-8 top-4 h-16 w-10 rounded-r-full border-[7px] border-l-0" style={{ borderColor: palette.gold, opacity: 0.4 + shine * 0.6 }} />
            </div>
            <div className="h-6 w-8" style={{ background: metal, filter: `grayscale(${1 - shine})` }} />
            <div className="h-6 w-28 rounded-md" style={{ backgroundColor: palette.fg }} />
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <span className="h-20 w-8 skew-x-12" style={{ backgroundColor: palette.accent }} />
              <span className="h-20 w-8 -skew-x-12" style={{ backgroundColor: palette.pink }} />
            </div>
            <div className="-mt-3 grid size-36 place-items-center rounded-full" style={{ background: metal, filter: `grayscale(${1 - shine}) brightness(${0.7 + shine * 0.3})` }}>
              <span className="grid size-24 place-items-center rounded-full border-4 border-white/40 text-4xl">★</span>
            </div>
          </>
        )}
        {shine > 0 && shine < 1 && (
          <motion.span key={rubs} className="absolute left-1/2 top-8 text-2xl" initial={{ opacity: 1, scale: 0.4 }} animate={{ opacity: 0, scale: 1.6, x: (rubs % 2 ? 1 : -1) * 40 }}>
            ✦
          </motion.span>
        )}
      </motion.button>
      </StudioHit>
      <StudioHit field="engraving" className="mt-6">
        <motion.p
          className="type-accent text-[1.8rem] leading-tight"
          style={{ color: palette.accent }}
          initial={false}
          animate={{ opacity: shine >= 1 ? 1 : 0, y: shine >= 1 ? 0 : 10 }}
        >
          {fill(scene.engraving)}
        </motion.p>
      </StudioHit>
      {shine < 1 && (
        <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full" style={{ backgroundColor: `${palette.fg}18` }}>
          <motion.div className="h-full" style={{ backgroundColor: palette.accent }} animate={{ width: `${shine * 100}%` }} />
        </div>
      )}
    </SceneShell>
  );
}

/* ───────────── Map: tap each pin along the way ───────────── */

export function MapScene({ scene, done, onDone }: SceneProps<S<"map">>) {
  const { palette, fill } = useStory();
  const studio = useStudioEdit();
  const pickedPin = usePickedItem(["pins", "place", "when", "memory"]);
  const n = scene.pins.length;
  const [visited, setVisited] = useState(done ? n : 0);
  const [opened, setActive] = useState<number | null>(done ? n - 1 : null);
  // Studio: the place being edited is the one open.
  const active = studio ? Math.min(pickedPin ?? 0, n - 1) : opened;

  const spots = scene.pins.map((_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    return { x: 40 + t * 240, y: 150 + Math.sin(t * Math.PI * 2.2) * 70 };
  });
  const d = spots.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");

  function visit(i: number) {
    if (i > visited) return;
    setActive(i);
    if (i === visited) {
      const v = visited + 1;
      setVisited(v);
      if (v === n) onDone();
    }
  }

  const pin = active !== null ? scene.pins[active] : null;
  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div className="relative w-[min(92vw,340px)]">
        <svg viewBox="0 0 320 300" className="h-auto w-full overflow-visible rounded-[1.4rem]" style={{ backgroundColor: palette.cream }}>
          <path d={d} fill="none" stroke={palette.fg} strokeOpacity={0.25} strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" />
          {spots.map((p, i) => {
            const seen = i < visited;
            const next = i === visited;
            return (
              <g
                key={i}
                onClick={() => visit(i)}
                className={seen || next || studio ? "cursor-pointer" : ""}
                role="button"
                aria-label={seen || next ? scene.pins[i].place : "Locked"}
                data-studio-field={studio ? "pins" : undefined}
                data-studio-item={studio ? i : undefined}
              >
                <circle cx={p.x} cy={p.y} r={22} fill="transparent" />
                {next && <motion.circle cx={p.x} cy={p.y} r={16} fill={palette.accent} opacity={0.25} animate={{ r: [10, 20, 10] }} transition={{ duration: 1.4, repeat: Infinity }} />}
                <path
                  d={`M${p.x} ${p.y + 2} c-10 -12 -12 -18 -12 -22 a12 12 0 0 1 24 0 c0 4 -2 10 -12 22z`}
                  fill={seen ? palette.accent : next ? palette.gold : `${palette.fg}30`}
                />
                <circle cx={p.x} cy={p.y - 20} r={4} fill={palette.cream} />
              </g>
            );
          })}
        </svg>
        <AnimatePresence mode="wait">
          {pin && (
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
              <Paper className="px-5 py-4 text-left">
                <p className="type-label flex flex-wrap gap-1 text-[10px] opacity-60">
                  <StudioHit as="span" field="when" item={active ?? undefined}>{fill(pin.when)}</StudioHit>
                  <span>·</span>
                  <StudioHit as="span" field="place" item={active ?? undefined}>{fill(pin.place)}</StudioHit>
                </p>
                <StudioHit field="memory" item={active ?? undefined} className="mt-1.5">
                  <p className="text-[1.05rem] leading-snug">{fill(pin.memory)}</p>
                </StudioHit>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  );
}
