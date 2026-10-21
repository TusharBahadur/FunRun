"use client";

import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { useRef, useState } from "react";
import { PhotoFill } from "@/components/experiences/birthday/photo-fill";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SceneShell, StudioHit, Tape, useStory, useStudioEdit, type SceneProps } from "../scene-kit";
import { Sticker } from "../stickers";
import type { Scene } from "../types";

type S<T extends Scene["type"]> = Extract<Scene, { type: T }>;

/* ───────────── Spotlight: their photo, and sticky notes about them ───────────── */

// Where each note lands around the photo (percent of the photo box), and its tilt.
const NOTE_SPOTS = [
  { left: "-30%", top: "4%", rotate: -8 },
  { left: "72%", top: "-6%", rotate: 7 },
  { left: "76%", top: "42%", rotate: -5 },
  { left: "-34%", top: "50%", rotate: 6 },
  { left: "18%", top: "84%", rotate: -3 },
  { left: "60%", top: "82%", rotate: 5 },
];
const NOTE_COLORS = ["#fff4a8", "#ffd3da", "#cdeccf", "#d6e6ff", "#ffe0b8", "#e7dcff"];

export function SpotlightScene({ scene, done, onDone }: SceneProps<S<"spotlight">>) {
  const { palette, fill } = useStory();
  const studio = useStudioEdit();
  const tags = scene.tags.slice(0, NOTE_SPOTS.length);
  const stamp = scene.stamp === undefined ? "yay" : scene.stamp;
  const [shown, setShown] = useState(done ? tags.length : 0);

  function reveal() {
    if (shown >= tags.length) return;
    const n = shown + 1;
    setShown(n);
    if (n === tags.length) onDone();
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div className="relative mb-10 mt-2 w-[min(62vw,280px)]">
        <StudioHit field="photo" className="relative block w-full">
        <motion.button
          type="button"
          onClick={reveal}
          aria-label={shown < tags.length ? "Tap the photo for a note" : fill("{to}")}
          initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
          animate={{ rotate: -2, scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.97, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative block w-full bg-white p-3 pb-12 shadow-[0_30px_50px_-24px_rgba(27,18,21,.55)]"
        >
          <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
          <div className="relative aspect-[4/5] overflow-hidden">
            <PhotoFill src={scene.photo} tone={scene.tone ?? "rose"} alt={fill("{to}")} iconClassName="size-12" className="size-full" />
            {shown < tags.length && (
              <motion.span
                className="absolute inset-0 rounded-sm ring-4 ring-white/70"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            )}
          </div>
          <span className="type-hand absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5 text-2xl" style={{ color: palette.ink }}>
            {fill("{to}")}
            <Heart className="size-4 fill-current" style={{ color: palette.accent }} />
          </span>
        </motion.button>
        </StudioHit>

        {tags.map((t, i) => (
          <AnimatePresence key={i}>
            {i < shown && (
              <div className="absolute z-10" style={{ left: NOTE_SPOTS[i].left, top: NOTE_SPOTS[i].top }}>
                <StudioHit field="tags" item={i}>
                  <motion.p
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: NOTE_SPOTS[i].rotate }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="type-hand w-[min(36vw,150px)] px-3 py-2.5 text-left text-[15px] leading-tight shadow-[0_10px_18px_-10px_rgba(27,18,21,.45)] md:text-base"
                    style={{ backgroundColor: NOTE_COLORS[i], color: "#2a1a1f" }}
                  >
                    {fill(t)}
                  </motion.p>
                </StudioHit>
              </div>
            )}
          </AnimatePresence>
        ))}

        <AnimatePresence>
          {/* The stamp sits where the 5th and 6th notes go, so it only joins shorter lists. */}
          {stamp && (shown >= tags.length || studio) && tags.length <= 4 && (
            <motion.div
              className="pointer-events-none absolute -bottom-10 -right-12 z-20"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.6, delay: 0.3 }}
            >
              <StudioHit field="stamp">
                <Sticker id={stamp} className="size-24" />
              </StudioHit>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="type-label opacity-60" aria-live="polite">
        {Math.min(shown, tags.length)} / {tags.length} notes
      </p>
    </SceneShell>
  );
}

/* ───────────── Compliments: pop the bubbles ───────────── */

export function ComplimentsScene({ scene, done, onDone }: SceneProps<S<"compliments">>) {
  const { palette, fill } = useStory();
  const [popped, setPopped] = useState<boolean[]>(() => scene.bubbles.map(() => done));
  const count = useRef(done ? scene.bubbles.length : 0);

  function pop(i: number) {
    if (popped[i]) return;
    setPopped((p) => p.map((v, j) => v || j === i));
    count.current += 1;
    if (count.current === scene.bubbles.length) onDone();
  }

  return (
    <SceneShell eyebrow={scene.eyebrow} title={scene.title} hint={scene.hint} doneText={scene.done} done={done}>
      <div className="mx-auto grid w-fit grid-cols-2 justify-items-center gap-x-5 gap-y-5 sm:grid-cols-3">
        {scene.bubbles.map((b, i) => (
          <StudioHit
            key={i}
            field="bubbles"
            item={i}
            className={cn(
              "relative grid place-items-center",
              popped[i] ? "w-[9.75rem] rounded-2xl" : "size-28 sm:size-32",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {popped[i] ? (
                <motion.p
                  key="note"
                  initial={{ scale: 0.4, opacity: 0, rotate: i % 2 ? 6 : -6 }}
                  animate={{ scale: 1, opacity: 1, rotate: i % 2 ? 2 : -2 }}
                  transition={{ type: "spring", bounce: 0.45 }}
                  className="type-hand rounded-2xl px-3.5 py-3 text-[17px] leading-snug shadow-[0_14px_24px_-16px_rgba(27,18,21,.5)]"
                  style={{ backgroundColor: palette.cream, color: palette.ink }}
                >
                  {fill(b)}
                </motion.p>
              ) : (
                <motion.button
                  key="bubble"
                  type="button"
                  onClick={() => pop(i)}
                  aria-label="Pop this bubble"
                  exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.25 } }}
                  animate={{ y: [0, -8, 0], x: [0, i % 2 ? 3 : -3, 0] }}
                  transition={{ duration: 3 + (i % 3) * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                  whileTap={{ scale: 0.85 }}
                  className="relative grid size-24 place-items-center rounded-full md:size-28"
                  style={{
                    background: `radial-gradient(circle at 32% 28%, #ffffffee 0 8%, ${palette.pink}aa 30%, ${palette.accent}55 70%, ${palette.accent}88)`,
                    boxShadow: `inset -6px -10px 20px ${palette.accent}55, 0 14px 30px -18px ${palette.accent}`,
                  }}
                >
                  <Heart className="size-6 fill-current" style={{ color: palette.cream }} />
                </motion.button>
              )}
            </AnimatePresence>
            {/* A little burst where the bubble was */}
            {popped[i] && !done && (
              <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <motion.span
                    key={k}
                    className="absolute size-2 rounded-full"
                    style={{ backgroundColor: k % 2 ? palette.accent : palette.gold }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: Math.cos((k / 6) * Math.PI * 2) * 60, y: Math.sin((k / 6) * Math.PI * 2) * 60, opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE_OUT }}
                  />
                ))}
              </span>
            )}
          </StudioHit>
        ))}
      </div>
    </SceneShell>
  );
}
