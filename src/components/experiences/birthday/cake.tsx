"use client";

import { AnimatePresence, motion } from "motion/react";
import type { BirthdayPalette } from "./types";

const DIGIT_GAP = 58;
const CANDLE_TOP = 52;

/** Two-tier cake with number candles; flames go out when `lit` turns false. */
export function Cake({ age, lit, palette }: { age: number; lit: boolean; palette: BirthdayPalette }) {
  const digits = String(age).split("");
  const startX = 150 - ((digits.length - 1) * DIGIT_GAP) / 2;

  return (
    <svg viewBox="0 0 300 290" className="h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <pattern id="candle-stripes" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="14" height="14" fill={palette.cream} />
          <rect width="6" height="14" fill={palette.accent} />
        </pattern>
        <radialGradient id="flame-glow">
          <stop offset="0%" stopColor={palette.gold} stopOpacity="0.55" />
          <stop offset="100%" stopColor={palette.gold} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff7a2f" />
          <stop offset="55%" stopColor={palette.gold} />
          <stop offset="100%" stopColor="#fff6c9" />
        </linearGradient>
      </defs>

      {/* Plate */}
      <ellipse cx={150} cy={270} rx={138} ry={13} fill={palette.fg} opacity={0.14} />
      <ellipse cx={150} cy={264} rx={126} ry={9} fill={palette.cream} />

      {/* Bottom tier */}
      <rect x={34} y={168} width={232} height={96} rx={16} fill={palette.accent} />
      <path
        d="M34 186 V182 a14 14 0 0 1 14 -14 H252 a14 14 0 0 1 14 14 V190 q-7 14 -14 0 t-14 2 t-14 -4 t-14 8 t-14 -6 t-14 2 t-14 6 t-14 -6 t-14 4 t-14 -2 t-14 8 t-14 -8 t-14 2 t-14 6 t-14 -6 t-14 0 t-12 -2z"
        fill={palette.cream}
      />
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={52 + i * 24.5} cy={236} r={4.5} fill={palette.cream} opacity={0.9} />
      ))}

      {/* Top tier */}
      <rect x={70} y={112} width={160} height={64} rx={14} fill={palette.cream} />
      <path
        d="M70 128 V126 a14 14 0 0 1 14 -14 H216 a14 14 0 0 1 14 14 V132 q-6 12 -12 0 t-12 4 t-12 -6 t-12 6 t-12 -2 t-12 6 t-12 -6 t-12 2 t-12 4 t-12 -6 t-12 2 t-12 4 t-16 -4z"
        fill={palette.pink}
      />
      {[
        [92, 152, 20],
        [118, 160, -30],
        [146, 148, 60],
        [172, 158, 10],
        [200, 150, -50],
        [212, 164, 30],
        [104, 166, 80],
      ].map(([x, y, r], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={9}
          height={3}
          rx={1.5}
          fill={i % 2 ? palette.gold : palette.accent}
          transform={`rotate(${r} ${x + 4.5} ${y + 1.5})`}
        />
      ))}

      {/* Number candles */}
      {digits.map((d, i) => {
        const x = startX + i * DIGIT_GAP;
        return (
          <g key={i}>
            <text
              x={x}
              y={120}
              textAnchor="middle"
              fontSize={86}
              fontWeight={800}
              fill="url(#candle-stripes)"
              stroke={palette.fg}
              strokeWidth={2.5}
              paintOrder="stroke"
              style={{ fontFamily: "var(--font-sans)", letterSpacing: 0 }}
            >
              {d}
            </text>
            <line x1={x} y1={CANDLE_TOP} x2={x} y2={CANDLE_TOP - 9} stroke={palette.fg} strokeWidth={2} strokeLinecap="round" />
            <Flame x={x} lit={lit} delay={i * 0.17} />
          </g>
        );
      })}
    </svg>
  );
}

function Flame({ x, lit, delay }: { x: number; lit: boolean; delay: number }) {
  const y = CANDLE_TOP - 10;
  return (
    <AnimatePresence>
      {lit ? (
        <motion.g
          key="flame"
          style={{ originX: `${x}px`, originY: `${y}px` }}
          exit={{ scaleY: 0, scaleX: 0.3, opacity: 0, transition: { duration: 0.25 } }}
        >
          <circle cx={x} cy={y - 10} r={30} fill="url(#flame-glow)" />
          <motion.path
            d={`M${x} ${y - 26} C ${x + 10} ${y - 14}, ${x + 9} ${y}, ${x} ${y} C ${x - 9} ${y}, ${x - 10} ${y - 14}, ${x} ${y - 26}Z`}
            fill="url(#flame)"
            style={{ originX: `${x}px`, originY: `${y}px` }}
            animate={{ scaleY: [1, 1.14, 0.94, 1.08, 1], skewX: [0, 4, -3, 2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay }}
          />
        </motion.g>
      ) : (
        <Smoke key="smoke" x={x} y={y} />
      )}
    </AnimatePresence>
  );
}

function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[-4, 0, 4].map((dx, i) => (
        <motion.path
          key={i}
          d={`M${x + dx} ${y} q -7 -10 0 -20 t 0 -20 t 0 -20`}
          fill="none"
          stroke="#9a8f93"
          strokeWidth={2.2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.8, y: 0 }}
          animate={{ pathLength: 1, opacity: 0, y: -24 }}
          transition={{ duration: 2.2, ease: "easeOut", delay: i * 0.12 }}
        />
      ))}
    </g>
  );
}
