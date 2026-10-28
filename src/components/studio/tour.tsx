"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TourStep = {
  /** Matches a `data-tour="…"` element. No target: the card sits in the middle. */
  target?: string;
  title: string;
  body: React.ReactNode;
};

const SEEN_KEY = "tt-studio-tour-1";
const PAD = 8;

export function tourSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
}

type Box = { x: number; y: number; w: number; h: number };

/** The first matching element that is actually on screen (mobile and desktop copies share a name). */
function findTarget(name: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/**
 * A short guided walk through the editor: a spotlight on one part at a time,
 * with a card that explains it. On phones the card docks to the top or bottom
 * edge, away from whatever it's pointing at.
 */
export function StudioTour({ steps, open, onClose }: { steps: TourStep[]; open: boolean; onClose: () => void }) {
  const [at, setAt] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [vw, setVw] = useState(1024);
  const [vh, setVh] = useState(768);
  const step = steps[Math.min(at, steps.length - 1)];
  const last = at >= steps.length - 1;

  const close = useCallback(() => {
    markSeen();
    onClose();
    setTimeout(() => setAt(0), 300);
  }, [onClose]);

  // Bring the part into view when the step changes.
  useEffect(() => {
    if (!open || !step.target) return;
    findTarget(step.target)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open, step.target]);

  // Follow the part as things scroll, resize or animate.
  useLayoutEffect(() => {
    if (!open) return;
    let raf = 0;
    const tick = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
      const el = step.target ? findTarget(step.target) : null;
      if (el) {
        const r = el.getBoundingClientRect();
        // Keep the spotlight inside the screen, even for tall panels.
        const x = Math.max(4, r.left - PAD);
        const y = Math.max(4, r.top - PAD);
        const w = Math.min(window.innerWidth - 4, r.right + PAD) - x;
        const h = Math.min(window.innerHeight - 4, r.bottom + PAD) - y;
        setBox((b) => (b && b.x === x && b.y === y && b.w === w && b.h === h ? b : { x, y, w, h }));
      } else setBox(null);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [open, step.target]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (last) close();
        else setAt((a) => a + 1);
      }
      else if (e.key === "ArrowLeft") setAt((a) => Math.max(0, a - 1));
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, last, close]);

  const phone = vw < 640;
  const CARD_W = phone ? vw - 24 : 340;

  // Where the card goes: phones dock it on the edge away from the spotlight;
  // bigger screens put it beside the part, wherever there's room.
  let card: React.CSSProperties;
  if (!box) {
    card = { left: (vw - CARD_W) / 2, top: Math.max(16, vh / 2 - 170), width: CARD_W };
  } else if (phone) {
    const low = box.y + box.h / 2 > vh / 2;
    card = low ? { left: 12, top: 12, width: CARD_W } : { left: 12, bottom: 12, width: CARD_W };
  } else {
    const gap = 16;
    const clampX = (x: number) => Math.min(Math.max(12, x), vw - CARD_W - 12);
    const clampY = (y: number) => Math.min(Math.max(12, y), vh - 300);
    if (box.x + box.w + gap + CARD_W < vw - 12 && box.w < vw * 0.5) card = { left: box.x + box.w + gap, top: clampY(box.y), width: CARD_W };
    else if (box.x - gap - CARD_W > 12 && box.w < vw * 0.5) card = { left: box.x - gap - CARD_W, top: clampY(box.y), width: CARD_W };
    else if (box.y + box.h + gap + 260 < vh) card = { left: clampX(box.x + box.w / 2 - CARD_W / 2), top: box.y + box.h + gap, width: CARD_W };
    else if (box.y - gap - 260 > 0) card = { left: clampX(box.x + box.w / 2 - CARD_W / 2), bottom: vh - box.y + gap, width: CARD_W };
    else card = { left: clampX(box.x + box.w / 2 - CARD_W / 2), top: clampY(box.y + 40), width: CARD_W };
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="tour"
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Studio tour"
        >
          {/* Dim everything except the spotlight. Clicks outside are swallowed so nothing changes by accident. */}
          <div className="absolute inset-0" />
          {box ? (
            <motion.div
              className="pointer-events-none absolute rounded-2xl shadow-[0_0_0_9999px_rgba(27,18,21,0.62)]"
              initial={false}
              animate={{ left: box.x, top: box.y, width: box.w, height: box.h }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              <motion.span
                className="absolute -inset-1 rounded-[1.1rem] border-2 border-rose"
                animate={{ opacity: [0.9, 0.3, 0.9], scale: [1, 1.015, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          ) : (
            <div className="pointer-events-none absolute inset-0 bg-[rgba(27,18,21,0.62)]" />
          )}

          <div className="absolute transition-[left,top,bottom] duration-300 ease-out" style={card}>
            <AnimatePresence mode="wait">
              <motion.div
                key={at}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="relative rounded-3xl bg-paper p-5 text-ink shadow-[0_30px_60px_-20px_rgba(27,18,21,0.6)] sm:p-6"
              >
                <button
                  type="button"
                  onClick={close}
                  aria-label="Skip the tour"
                  className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink"
                >
                  <X className="size-4" />
                </button>
                <div className="pr-8">
                  <p className="type-label text-[10px] text-muted">
                    {at + 1} of {steps.length}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold leading-tight">{step.title}</h3>
                </div>
                <div className="mt-3 text-[15px] leading-relaxed text-ink/80">{step.body}</div>

                <div className="mt-5 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {steps.map((_, k) => (
                      <button
                        key={k}
                        type="button"
                        aria-label={`Go to step ${k + 1}`}
                        onClick={() => setAt(k)}
                        className={cn("h-1.5 rounded-full transition-all", k === at ? "w-5 bg-rose" : "w-1.5 bg-ink/15")}
                      />
                    ))}
                  </div>
                  {at > 0 && (
                    <button
                      type="button"
                      onClick={() => setAt((a) => a - 1)}
                      aria-label="Back"
                      className="btn btn-paper grid size-11 place-items-center"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => (last ? close() : setAt((a) => a + 1))}
                    className="btn btn-rose flex h-11 items-center gap-1.5 px-5 text-sm"
                  >
                    {at === 0 ? "Show me" : last ? "Start making" : "Next"}
                    {!last && <ArrowRight className="size-4" />}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
