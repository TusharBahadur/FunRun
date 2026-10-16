"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { Accented } from "./accented";
import type { BirthdayPalette } from "./types";

/** Opening screen: a wrapped box the recipient taps to unwrap. */
export function GiftGate({
  recipient,
  sender,
  palette,
  openingLine = "sent you *something.*",
  onOpen,
}: {
  recipient: string;
  sender: string;
  openingLine?: string;
  palette: BirthdayPalette;
  /** Called with the box's centre in viewport pixels, for the confetti. */
  onOpen: (origin: { x: number; y: number }) => void;
}) {
  const [opening, setOpening] = useState(false);
  const box = useRef<HTMLButtonElement>(null);

  function open() {
    if (opening) return;
    setOpening(true);
    const r = box.current!.getBoundingClientRect();
    onOpen({ x: r.left + r.width / 2, y: r.top + r.height * 0.3 });
  }

  return (
    <motion.section
      className="relative flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center"
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.6, ease: EASE_OUT } }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: EASE_OUT }}
        className="type-label opacity-70"
      >
        A gift for {recipient}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.9, ease: EASE_OUT }}
        className="type-display mt-4 max-w-md text-[clamp(2.4rem,9vw,4.2rem)]"
      >
        <span className="font-semibold">{sender}</span>{" "}
        <Accented text={openingLine} color={palette.accent} />
      </motion.h1>

      <motion.button
        ref={box}
        type="button"
        onClick={open}
        aria-label="Unwrap your gift"
        initial={{ opacity: 0, scale: 0.6, y: 40 }}
        animate={
          opening
            ? { scale: [1, 1.12, 0.9], y: [0, -6, 30], opacity: [1, 1, 0] }
            : { opacity: 1, scale: 1, y: 0, rotate: [0, -4, 4, -3, 3, 0] }
        }
        transition={
          opening
            ? { duration: 0.8, ease: EASE_OUT, delay: 0.25 }
            : {
                opacity: { delay: 0.5, duration: 0.6 },
                scale: { delay: 0.5, type: "spring", bounce: 0.45 },
                y: { delay: 0.5, type: "spring", bounce: 0.45 },
                rotate: { delay: 1.6, duration: 0.7, repeat: Infinity, repeatDelay: 1.8 },
              }
        }
        className="relative mt-14 w-[min(58vw,240px)] cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-current/30"
      >
        <svg viewBox="0 0 200 200" className="h-auto w-full overflow-visible" aria-hidden>
          <ellipse cx={100} cy={192} rx={78} ry={7} fill={palette.fg} opacity={0.15} />
          {/* Box */}
          <rect x={30} y={80} width={140} height={110} rx={8} fill={palette.accent} />
          <rect x={88} y={80} width={24} height={110} fill={palette.cream} />
          <rect x={30} y={80} width={140} height={16} fill={palette.fg} opacity={0.12} />
          {/* Lid + bow fly off when opening */}
          <motion.g
            style={{ originX: "100px", originY: "70px" }}
            animate={opening ? { y: -140, x: 50, rotate: 28, opacity: 0 } : { y: 0 }}
            transition={{ duration: 0.75, ease: EASE_OUT }}
          >
            <rect x={22} y={58} width={156} height={30} rx={7} fill={palette.accent} />
            <rect x={22} y={58} width={156} height={30} rx={7} fill="#fff" opacity={0.12} />
            <rect x={88} y={58} width={24} height={30} fill={palette.cream} />
            <path d="M100 58 C 70 20, 40 40, 62 56 C 72 62, 90 60, 100 58Z" fill={palette.cream} />
            <path d="M100 58 C 130 20, 160 40, 138 56 C 128 62, 110 60, 100 58Z" fill={palette.cream} />
            <circle cx={100} cy={57} r={8} fill={palette.pink} />
          </motion.g>
        </svg>
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ delay: opening ? 0 : 1.4, duration: 0.6 }}
        className="type-label mt-10"
      >
        Tap the box to unwrap
      </motion.p>
    </motion.section>
  );
}
