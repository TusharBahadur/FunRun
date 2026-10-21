"use client";

import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useStory } from "./scene-kit";
import type { StoryPalette } from "./types";

/**
 * Illustrated front door used in knock scenes and gallery peeks.
 * One drawing, so every gift that opens a door looks the same kind of cute.
 */
export function DoorArt({ palette, className }: { palette: StoryPalette; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 240 360" className={cn("h-auto w-full overflow-visible", className)} aria-hidden>
      <ellipse cx="120" cy="346" rx="78" ry="8" fill={palette.ink} opacity={0.12} />
      <rect x="52" y="332" width="136" height="14" rx="4" fill={palette.pink} />
      <rect x="58" y="335" width="124" height="8" rx="2" fill={palette.accent} opacity={0.28} />
      <path d="M18 320 V108 C18 42 68 16 120 16 C172 16 222 42 222 108 V320 Z" fill={palette.cream} />
      <g clipPath={`url(#${uid}-open)`}>
        <g transform="translate(28 28)">
          <DoorLeaf palette={palette} uid={uid} />
        </g>
      </g>
      <path
        d="M28 320 V112 C28 52 72 28 120 28 C168 28 212 52 212 112 V320"
        fill="none"
        stroke={palette.ink}
        strokeOpacity={0.08}
        strokeWidth={2}
      />
      <circle cx="120" cy="22" r="5" fill={palette.gold} />
      <defs>
        <clipPath id={`${uid}-open`}>
          <path d="M28 320 V112 C28 52 72 28 120 28 C168 28 212 52 212 112 V320 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function GiftDoor({
  open,
  shake,
  onKnock,
  knocks,
  total,
  reveal,
}: {
  open: boolean;
  shake: number;
  onKnock: () => void;
  knocks: number;
  total: number;
  reveal: ReactNode;
}) {
  const { palette } = useStory();
  const uid = useId().replace(/:/g, "");

  return (
    <div className="relative mx-auto w-[min(68vw,230px)]">
      <div
        className="relative rounded-t-[48%] px-[11px] pb-3 pt-[11px]"
        style={{
          backgroundColor: palette.cream,
          boxShadow: "0 28px 48px -28px rgba(27,18,21,0.5), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-[8px] size-2.5 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: palette.gold, boxShadow: "inset 0 1px 0 rgba(255,255,255,.55)" }}
        />

        <div
          className="relative h-[min(56vw,310px)] overflow-hidden rounded-t-[46%] [perspective:980px]"
          style={{
            background: `radial-gradient(circle at 50% 36%, #fff8e4 0%, ${palette.gold} 46%, ${palette.pink} 100%)`,
          }}
        >
          <span aria-hidden className="absolute left-[18%] top-[16%] size-1.5 rounded-full bg-white/80" />
          <span aria-hidden className="absolute right-[22%] top-[28%] size-1 rounded-full bg-white/70" />
          <span aria-hidden className="absolute left-[28%] top-[42%] size-1 rounded-full bg-white/60" />

          <div className="absolute inset-x-4 top-[26%] grid place-items-center px-1 text-center" style={{ color: palette.ink }}>
            {reveal}
          </div>

          <motion.button
            type="button"
            onClick={onKnock}
            aria-label={`Knock (${knocks} of ${total})`}
            className="absolute inset-0 origin-left outline-none"
            style={{ transformStyle: "preserve-3d", pointerEvents: open ? "none" : undefined }}
            animate={open ? { rotateY: -108 } : { rotateY: 0, x: shake ? [0, -6, 6, -3, 0] : 0 }}
            transition={open ? { duration: 1.05, ease: EASE_OUT } : { duration: 0.28 }}
            key={open ? "open" : `k${shake}`}
          >
            <span
              className="absolute inset-0 rounded-t-[46%] [backface-visibility:hidden] [transform:rotateY(180deg)]"
              style={{ background: `linear-gradient(90deg, ${palette.ink}33, ${palette.accent})` }}
            />
            <span
              className="absolute inset-0 overflow-hidden rounded-t-[46%] [backface-visibility:hidden]"
              style={{ backgroundColor: palette.accent }}
            >
              <svg viewBox="0 0 184 292" preserveAspectRatio="none" className="size-full" aria-hidden>
                <DoorLeaf palette={palette} uid={uid} />
              </svg>
            </span>
            {!open && (
              <motion.span
                aria-hidden
                className="absolute left-1/2 top-[58%] size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{ borderColor: `${palette.gold}99` }}
                animate={{ scale: [0.7, 1.35], opacity: [0.55, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </motion.button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="block size-2.5"
            style={{
              clipPath: "path('M5 9 C5 9 0.5 5.6 0.5 3 C0.5 1.3 1.8 0.3 3.2 0.3 C4 0.3 4.7 0.7 5 1.4 C5.3 0.7 6 0.3 6.8 0.3 C8.2 0.3 9.5 1.3 9.5 3 C9.5 5.6 5 9 5 9 Z')",
              backgroundColor: i < knocks ? palette.accent : `${palette.fg}28`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DoorLeaf({ palette, uid }: { palette: StoryPalette; uid: string }) {
  const shine = `door-shine-${uid}`;
  const glass = `door-glass-${uid}`;
  return (
    <>
      <defs>
        <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
        <radialGradient id={glass} cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#fff8ee" />
          <stop offset="1" stopColor={palette.pink} />
        </radialGradient>
      </defs>
      <rect width="184" height="292" fill={palette.accent} />
      <rect width="184" height="292" fill={`url(#${shine})`} />

      <circle cx="92" cy="72" r="34" fill={palette.cream} />
      <circle cx="92" cy="72" r="27" fill={`url(#${glass})`} />
      <path d="M92 45 V99 M65 72 H119" stroke={palette.cream} strokeWidth="3.5" strokeLinecap="round" />
      <path
        d="M92 78 C92 78 82 70 82 64 C82 60 85 58 88 58 C90 58 91.4 59 92 61 C92.6 59 94 58 96 58 C99 58 102 60 102 64 C102 70 92 78 92 78 Z"
        fill={palette.accent}
        opacity={0.85}
      />

      <rect x="28" y="118" width="128" height="70" rx="14" fill="none" stroke={palette.cream} strokeOpacity={0.42} strokeWidth="3" />
      <circle cx="92" cy="148" r="5" fill={palette.gold} />
      <circle cx="92" cy="162" r="14" fill="none" stroke={palette.gold} strokeWidth="4.5" />
      <path
        d="M92 176 C92 176 84 170 84 165 C84 162 86.2 160.5 88.4 160.5 C90 160.5 91.2 161.4 92 163 C92.8 161.4 94 160.5 95.6 160.5 C97.8 160.5 100 162 100 165 C100 170 92 176 92 176 Z"
        fill={palette.gold}
      />

      <rect x="28" y="204" width="128" height="58" rx="12" fill="none" stroke={palette.cream} strokeOpacity={0.42} strokeWidth="3" />
      <rect x="68" y="226" width="48" height="9" rx="4" fill={palette.ink} opacity={0.22} />

      <circle cx="156" cy="168" r="10" fill={palette.gold} />
      <circle cx="153.5" cy="165.5" r="3.2" fill="#fff" opacity={0.55} />
    </>
  );
}
