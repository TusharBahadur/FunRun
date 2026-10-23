"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StudioHit, useStudioEdit } from "./scene-kit";

/**
 * Original animated stickers: little characters and doodles with a white
 * die-cut border, like stickers on a scrapbook page. Each one has a small idle
 * animation so the page feels alive, the way a GIF would.
 */

export type StickerId =
  | "cat"
  | "bear"
  | "bunny"
  | "balloons"
  | "popper"
  | "gift"
  | "cupcake"
  | "crown"
  | "chai"
  | "heart"
  | "sparkles"
  | "yay";

export const stickerNames: Record<StickerId, string> = {
  cat: "Party cat",
  bear: "Bear hug",
  bunny: "Balloon bunny",
  balloons: "Balloons",
  popper: "Party popper",
  gift: "Gift box",
  cupcake: "Cupcake",
  crown: "Crown",
  chai: "Kulhad chai",
  heart: "Doodle heart",
  sparkles: "Sparkles",
  yay: "Yay! stamp",
};

const C = {
  rose: "#e23b54",
  pink: "#ffb3c1",
  blush: "#ffd3da",
  gold: "#f6b73c",
  ink: "#2a1a1f",
  cream: "#fffaf2",
  mint: "#bfe6d0",
  sky: "#bfe0ff",
  lilac: "#d9ccff",
  brown: "#c9875a",
  tan: "#f1c9a3",
  clay: "#c2683c",
};

/** White die-cut border + soft shadow around any sticker art. */
function Frame({ children, className }: { children: ReactNode; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 120" className={cn("h-full w-full overflow-visible drop-shadow-[0_6px_10px_rgba(42,26,31,0.22)]", className)} aria-hidden>
      <defs>
        <filter id={`cut-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology operator="dilate" radius="4" in="SourceAlpha" result="grow" />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="grow" operator="in" result="border" />
          <feMerge>
            <feMergeNode in="border" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#cut-${id})`}>{children}</g>
    </svg>
  );
}

/** Two dot eyes that blink every few seconds. */
function Eyes({ x1, x2, y, r = 3.2, delay = 0 }: { x1: number; x2: number; y: number; r?: number; delay?: number }) {
  return (
    <motion.g
      style={{ originY: `${y}px` }}
      animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
      transition={{ duration: 4, times: [0, 0.9, 0.93, 0.96, 1], repeat: Infinity, delay }}
    >
      <circle cx={x1} cy={y} r={r} fill={C.ink} />
      <circle cx={x2} cy={y} r={r} fill={C.ink} />
      <circle cx={x1 + 1} cy={y - 1} r={r * 0.32} fill="#fff" />
      <circle cx={x2 + 1} cy={y - 1} r={r * 0.32} fill="#fff" />
    </motion.g>
  );
}

function Cheeks({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <>
      <ellipse cx={x1} cy={y} rx={5} ry={3} fill={C.pink} opacity={0.9} />
      <ellipse cx={x2} cy={y} rx={5} ry={3} fill={C.pink} opacity={0.9} />
    </>
  );
}

const art: Record<StickerId, () => ReactNode> = {
  cat: () => (
    <Frame>
      {/* party hat */}
      <path d="M48 30 L60 2 L72 30 Z" fill={C.rose} />
      <path d="M52 21 L68 21 M55 13 L65 13" stroke={C.gold} strokeWidth={3} />
      <circle cx={60} cy={4} r={5} fill={C.gold} />
      {/* ears + head */}
      <path d="M30 40 L34 18 L50 32 Z M90 40 L86 18 L70 32 Z" fill={C.cream} />
      <path d="M35 34 L36 24 L45 32 Z M85 34 L84 24 L75 32 Z" fill={C.pink} />
      <ellipse cx={60} cy={52} rx={33} ry={27} fill={C.cream} />
      <path d="M38 36 q6 4 4 10 M82 36 q-6 4 -4 10" stroke={C.gold} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Eyes x1={48} x2={72} y={52} />
      <Cheeks x1={41} x2={79} y={60} />
      <path d="M56 60 q2 3 4 0 q2 3 4 0" stroke={C.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {/* body holding a cupcake */}
      <ellipse cx={60} cy={92} rx={24} ry={20} fill={C.cream} />
      <path d="M46 92 h28 l-4 18 h-20 z" fill={C.lilac} />
      <path d="M44 92 q4 -12 16 -12 q12 0 16 12 z" fill={C.blush} />
      <circle cx={60} cy={78} r={4} fill={C.rose} />
      <circle cx={42} cy={96} r={7} fill={C.cream} />
      <circle cx={78} cy={96} r={7} fill={C.cream} />
    </Frame>
  ),
  bear: () => (
    <Frame>
      <circle cx={34} cy={26} r={12} fill={C.brown} />
      <circle cx={86} cy={26} r={12} fill={C.brown} />
      <circle cx={34} cy={26} r={6} fill={C.tan} />
      <circle cx={86} cy={26} r={6} fill={C.tan} />
      <ellipse cx={60} cy={48} rx={32} ry={28} fill={C.brown} />
      <ellipse cx={60} cy={58} rx={14} ry={10} fill={C.tan} />
      <ellipse cx={60} cy={53} rx={4} ry={3} fill={C.ink} />
      <Eyes x1={47} x2={73} y={44} delay={1.2} />
      <Cheeks x1={40} x2={80} y={56} />
      <ellipse cx={60} cy={96} rx={30} ry={22} fill={C.brown} />
      <motion.path
        d="M60 112 C40 98 36 86 46 80 C52 76 58 80 60 84 C62 80 68 76 74 80 C84 86 80 98 60 112Z"
        fill={C.rose}
        style={{ originX: "60px", originY: "96px" }}
        animate={{ scale: [1, 1.12, 1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
      <ellipse cx={34} cy={92} rx={9} ry={11} fill={C.brown} />
      <ellipse cx={86} cy={92} rx={9} ry={11} fill={C.brown} />
    </Frame>
  ),
  bunny: () => (
    <Frame>
      <motion.g style={{ originX: "88px", originY: "62px" }} animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M88 62 Q84 40 96 22" stroke={C.ink} strokeWidth={1.5} fill="none" />
        <ellipse cx={98} cy={16} rx={13} ry={15} fill={C.sky} />
        <path d="M94 8 q3 -3 6 0" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </motion.g>
      <ellipse cx={42} cy={26} rx={8} ry={22} fill={C.cream} />
      <ellipse cx={62} cy={24} rx={8} ry={22} fill={C.cream} />
      <ellipse cx={42} cy={28} rx={4} ry={15} fill={C.pink} />
      <ellipse cx={62} cy={26} rx={4} ry={15} fill={C.pink} />
      <ellipse cx={52} cy={62} rx={30} ry={24} fill={C.cream} />
      <Eyes x1={42} x2={62} y={60} delay={0.6} />
      <Cheeks x1={35} x2={69} y={68} />
      <path d="M49 67 q3 3 6 0" stroke={C.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <ellipse cx={52} cy={98} rx={24} ry={18} fill={C.cream} />
      <circle cx={84} cy={64} r={6} fill={C.cream} />
    </Frame>
  ),
  balloons: () => (
    <Frame>
      {[
        { x: 38, y: 34, c: C.rose, d: 0 },
        { x: 64, y: 22, c: C.gold, d: 0.5 },
        { x: 86, y: 40, c: C.sky, d: 1 },
      ].map((b) => (
        <motion.g key={b.x} animate={{ y: [0, -5, 0] }} transition={{ duration: 2.6, repeat: Infinity, delay: b.d, ease: "easeInOut" }}>
          <path d={`M${b.x} ${b.y + 22} Q${b.x + 4} ${b.y + 50} 62 112`} stroke={C.ink} strokeWidth={1.4} fill="none" />
          <ellipse cx={b.x} cy={b.y} rx={17} ry={21} fill={b.c} />
          <path d={`M${b.x - 4} ${b.y + 20} l4 5 l4 -5 z`} fill={b.c} />
          <path d={`M${b.x - 8} ${b.y - 10} q3 -5 8 -5`} stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />
        </motion.g>
      ))}
    </Frame>
  ),
  popper: () => (
    <Frame>
      <path d="M20 108 L52 52 L72 72 Z" fill={C.gold} />
      <path d="M30 92 L60 62 M38 104 L66 72" stroke={C.rose} strokeWidth={5} />
      <ellipse cx={62} cy={62} rx={15} ry={7} transform="rotate(45 62 62)" fill={C.clay} />
      {[
        [80, 30, C.rose],
        [96, 50, C.sky],
        [70, 14, C.gold],
        [100, 24, C.lilac],
        [88, 66, C.pink],
      ].map(([x, y, c], i) => (
        <motion.rect
          key={i}
          x={Number(x)}
          y={Number(y)}
          width={8}
          height={4}
          rx={2}
          fill={String(c)}
          animate={{ x: [-18, 0, 4], y: [18, 0, 2], opacity: [0, 1, 0], rotate: [0, 90, 180] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </Frame>
  ),
  gift: () => (
    <Frame>
      <motion.g animate={{ y: [0, -8, 0, 0] }} transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.25, 0.5, 1] }}>
        <rect x={22} y={50} width={76} height={60} rx={8} fill={C.rose} />
        <rect x={16} y={38} width={88} height={18} rx={6} fill={C.rose} />
        <rect x={54} y={38} width={12} height={72} fill={C.gold} />
        <path d="M60 38 C40 10 22 26 40 36 C46 40 54 39 60 38Z M60 38 C80 10 98 26 80 36 C74 40 66 39 60 38Z" fill={C.gold} />
        <Eyes x1={44} x2={76} y={80} r={3} delay={2} />
        <path d="M56 88 q4 4 8 0" stroke={C.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
      </motion.g>
    </Frame>
  ),
  cupcake: () => (
    <Frame>
      <motion.path
        d="M60 6 C66 14 66 22 60 24 C54 22 54 14 60 6Z"
        fill={C.gold}
        style={{ originX: "60px", originY: "24px" }}
        animate={{ scaleY: [1, 1.2, 0.9, 1.1, 1] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />
      <rect x={57} y={24} width={6} height={20} rx={2} fill={C.sky} />
      <path d="M26 66 q0 -24 34 -24 q34 0 34 24 z" fill={C.blush} />
      <path d="M30 60 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0 q8 -8 12 0" stroke="#fff" strokeWidth={3} fill="none" opacity={0.8} />
      <path d="M30 66 h60 l-8 46 h-44 z" fill={C.lilac} />
      <path d="M44 66 l3 46 M60 66 v46 M76 66 l-3 46" stroke="#fff" strokeWidth={2} opacity={0.7} />
      <Eyes x1={50} x2={70} y={84} r={2.8} delay={0.3} />
      <Cheeks x1={44} x2={76} y={92} />
    </Frame>
  ),
  crown: () => (
    <Frame>
      <motion.g style={{ originX: "60px", originY: "90px" }} animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M16 90 L22 36 L42 60 L60 26 L78 60 L98 36 L104 90 Z" fill={C.gold} />
        <rect x={16} y={88} width={88} height={14} rx={4} fill={C.gold} />
        <circle cx={60} cy={95} r={5} fill={C.rose} />
        <circle cx={36} cy={95} r={4} fill={C.sky} />
        <circle cx={84} cy={95} r={4} fill={C.sky} />
        <circle cx={22} cy={34} r={5} fill={C.rose} />
        <circle cx={60} cy={24} r={5} fill={C.rose} />
        <circle cx={98} cy={34} r={5} fill={C.rose} />
      </motion.g>
    </Frame>
  ),
  chai: () => (
    <Frame>
      {[44, 60, 76].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 40 q-6 -8 0 -16 q6 -8 0 -16`}
          stroke={C.ink}
          strokeOpacity={0.35}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          animate={{ y: [6, -6], opacity: [0, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
      <path d="M28 48 h64 l-8 58 q-1 6 -7 6 h-34 q-6 0 -7 -6 z" fill={C.clay} />
      <ellipse cx={60} cy={48} rx={32} ry={7} fill="#d9a066" />
      <ellipse cx={60} cy={48} rx={26} ry={4.5} fill="#b9773f" />
      <Eyes x1={50} x2={70} y={74} r={3} delay={0.9} />
      <Cheeks x1={42} x2={78} y={82} />
      <path d="M56 82 q4 4 8 0" stroke={C.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Frame>
  ),
  heart: () => (
    <Frame>
      <motion.g style={{ originX: "60px", originY: "60px" }} animate={{ rotate: [-8, 8, -8], scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M60 104 C24 78 10 58 20 36 C30 16 54 20 60 38 C66 20 90 16 100 36 C110 58 96 78 60 104Z" fill={C.rose} />
        <path d="M34 40 q6 -10 16 -6" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
        <path d="M40 58 l40 20 M36 70 l34 18 M50 48 l38 18" stroke={C.ink} strokeOpacity={0.12} strokeWidth={3} />
      </motion.g>
    </Frame>
  ),
  sparkles: () => (
    <Frame>
      {[
        [40, 44, 22, C.gold, 0],
        [84, 30, 14, C.pink, 0.4],
        [78, 82, 18, C.gold, 0.8],
        [30, 92, 10, C.lilac, 1.1],
      ].map(([x, y, s, c, d], i) => (
        <motion.path
          key={i}
          d="M0 -1 C0.1 -0.3 0.3 -0.1 1 0 C0.3 0.1 0.1 0.3 0 1 C-0.1 0.3 -0.3 0.1 -1 0 C-0.3 -0.1 -0.1 -0.3 0 -1Z"
          fill={String(c)}
          transform={`translate(${x} ${y}) scale(${s})`}
          animate={{ opacity: [0.4, 1, 0.4], scale: [Number(s) * 0.8, Number(s), Number(s) * 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: Number(d) }}
        />
      ))}
    </Frame>
  ),
  yay: () => (
    <Frame>
      <motion.g style={{ originX: "60px", originY: "60px" }} animate={{ rotate: [-10, 6, -10] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
        <path
          d="M60 8 l10 10 l14 -4 l3 14 l14 4 l-4 14 l10 10 l-10 10 l4 14 l-14 4 l-3 14 l-14 -4 l-10 10 l-10 -10 l-14 4 l-3 -14 l-14 -4 l4 -14 l-10 -10 l10 -10 l-4 -14 l14 -4 l3 -14 l14 4 z"
          fill={C.gold}
        />
        <text x={60} y={70} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.ink} style={{ fontFamily: "var(--font-hand)" }}>
          yay!
        </text>
      </motion.g>
    </Frame>
  ),
};

/* ───────────── The board pack: doodles and meme reactions ───────────── */

/**
 * Images from the TyniTales Pinterest board (credits in public/stickers/board/CREDITS.md).
 * "doodle" art sits on a white die-cut card; "meme" photos get a small photo frame.
 * To pull one, delete its file and its line here.
 */
const board = {
  "b-flowers": { file: "01.jpg", name: "Flowers for you", kind: "doodle", category: "love" },
  "b-ring": { file: "02.jpg", name: "Ring box", kind: "doodle", category: "love" },
  "b-hug-hearts": { file: "03.jpg", name: "Hug attack", kind: "doodle", category: "love" },
  "b-heart-peek": { file: "04.jpg", name: "Heart for you", kind: "doodle", category: "love" },
  "b-couple": { file: "09.jpg", name: "Cute couple", kind: "doodle", category: "love" },
  "b-besties": { file: "10.jpg", name: "Besties", kind: "doodle", category: "family" },
  "b-tiny-heart": { file: "11.jpg", name: "Tiny heart", kind: "doodle", category: "love" },
  "b-smooch": { file: "12.jpg", name: "Smooch", kind: "doodle", category: "love" },
  "b-cheek": { file: "14.jpg", name: "Cheek squish", kind: "doodle", category: "love" },
  "b-melting": { file: "17.jpg", name: "Melting", kind: "doodle", category: "love" },
  "b-cake": { file: "21.webp", name: "Birthday cake", kind: "doodle", category: "celebration" },
  "m-heart-eyes": { file: "05.jpg", name: "Heart-eyes cat", kind: "meme", category: "cat" },
  "m-cat-kiss": { file: "06.jpg", name: "Cat kisses", kind: "meme", category: "cat" },
  "m-cat-cuddle": { file: "07.jpg", name: "Cuddle cats", kind: "meme", category: "cat" },
  "m-pup-cuddle": { file: "08.jpg", name: "Pup cuddles", kind: "meme", category: "dog" },
  "m-bow-cat": { file: "13.jpg", name: "Cat with a bow", kind: "meme", category: "cat" },
  "m-lovesick": { file: "16.jpg", name: "Lovesick cat", kind: "meme", category: "cat" },
  "m-please-monkey": { file: "18.jpg", name: "Please monkey", kind: "meme", category: "meme" },
  "m-dance-cat": { file: "24.webp", name: "Dancing cat", kind: "meme", category: "cat" },
  "m-scream-cat": { file: "25.webp", name: "Screaming cat", kind: "meme", category: "cat" },
  "m-ahhh": { file: "30.jpg", name: "AHHH ur so cute", kind: "meme", category: "meme" },
  "m-shy-monkey": { file: "32.jpg", name: "Shy monkey", kind: "meme", category: "meme" },
  "m-heart-monkey": { file: "33.jpg", name: "Heart-hands monkey", kind: "meme", category: "meme" },
  "m-penguin": { file: "35.jpg", name: "Love you this much", kind: "meme", category: "love" },
  "m-hat-dog": { file: "36.jpg", name: "Hat dog", kind: "meme", category: "dog" },
  "m-flower-kitten": { file: "38.jpg", name: "Kitten with flowers", kind: "meme", category: "cat" },
  "m-dance-kitten": { file: "39.jpg", name: "Dancing kitten", kind: "meme", category: "cat" },
  "m-kuchu-puchu": { file: "40.jpg", name: "Kuchu puchu", kind: "meme", category: "meme" },
  "m-bow-down": { file: "41.jpg", name: "Bowing cat", kind: "meme", category: "cat" },
  "m-side-eye": { file: "42.jpg", name: "Side-eye cat", kind: "meme", category: "cat" },
  "m-pleading": { file: "43.jpg", name: "Pleading cat", kind: "meme", category: "meme" },
  "m-flower-cat": { file: "44.jpg", name: "Flower cat", kind: "meme", category: "cat" },
  "pin-001": { file: "pin-001.jpg", name: "Sticker 1", kind: "meme", category: "doodle" },
  "pin-002": { file: "pin-002.jpg", name: "Agnes", kind: "meme", category: "doodle" },
  "pin-003": { file: "pin-003.jpg", name: "A person with fake eyelashes and", kind: "meme", category: "doodle" },
  "pin-004": { file: "pin-004.jpg", name: "A cartoon cat with hearts flying", kind: "doodle", category: "love" },
  "pin-005": { file: "pin-005.gif", name: "Poor character give money � �", kind: "doodle", category: "doodle" },
  "pin-006": { file: "pin-006.jpg", name: "Drama queen sticker whatsapp Yes", kind: "meme", category: "love" },
  "pin-007": { file: "pin-007.jpg", name: "A baby with the word sorry writt", kind: "meme", category: "doodle" },
  "pin-008": { file: "pin-008.jpg", name: "Sticker 8", kind: "meme", category: "doodle" },
  "pin-009": { file: "pin-009.jpg", name: "Sticker kawaii Pegatina con la o", kind: "doodle", category: "love" },
  "pin-010": { file: "pin-010.jpg", name: "Sticker 10", kind: "meme", category: "doodle" },
  "pin-011": { file: "pin-011.jpg", name: "A white kitten with blue eyes lo", kind: "meme", category: "cat" },
  "pin-012": { file: "pin-012.jpg", name: "A brown dog holding a pink objec", kind: "meme", category: "dog" },
  "pin-013": { file: "pin-013.jpg", name: "Sticker figure 🦋", kind: "meme", category: "doodle" },
  "pin-014": { file: "pin-014.jpg", name: "Sticker 14", kind: "meme", category: "doodle" },
  "pin-015": { file: "pin-015.jpg", name: "HAA", kind: "doodle", category: "doodle" },
  "pin-016": { file: "pin-016.jpg", name: "Two cartoon characters hugging e", kind: "doodle", category: "love" },
  "pin-017": { file: "pin-017.jpg", name: "A sticker that says plz use it w", kind: "doodle", category: "meme" },
  "pin-018": { file: "pin-018.jpg", name: "A cat with the caption that read", kind: "meme", category: "cat" },
  "pin-019": { file: "pin-019.jpg", name: "Funny twitter meme sticker", kind: "meme", category: "meme" },
  "pin-020": { file: "pin-020.jpg", name: "Silly Cat Rose Cutout Cat Cute S", kind: "meme", category: "love" },
  "pin-021": { file: "pin-021.jpg", name: "Sticker face ^ sticker emoji Fun", kind: "meme", category: "love" },
  "pin-022": { file: "pin-022.jpg", name: "Sticker 22", kind: "meme", category: "doodle" },
  "pin-023": { file: "pin-023.jpg", name: "You are mine….", kind: "meme", category: "cat" },
  "pin-024": { file: "pin-024.jpg", name: "A girl covers her face with her", kind: "meme", category: "love" },
  "pin-025": { file: "pin-025.jpg", name: "�U gotta be fr rn �", kind: "meme", category: "dog" },
  "pin-026": { file: "pin-026.jpg", name: "A monkey holding a bouquet of fl", kind: "meme", category: "doodle" },
  "pin-027": { file: "pin-027.jpg", name: "A cross stitch cartoon character", kind: "doodle", category: "doodle" },
  "pin-028": { file: "pin-028.jpg", name: "A cat wearing sunglasses with th", kind: "meme", category: "love" },
  "pin-029": { file: "pin-029.jpg", name: "Khabe Lame Empty Wallet Sticker", kind: "meme", category: "love" },
  "pin-030": { file: "pin-030.jpg", name: "A cartoon character holding a kn", kind: "doodle", category: "doodle" },
  "pin-031": { file: "pin-031.jpg", name: "A black and white cat with the w", kind: "meme", category: "cat" },
  "pin-032": { file: "pin-032.jpg", name: "Cute Valentines Instagram Sticke", kind: "meme", category: "love" },
  "pin-033": { file: "pin-033.jpg", name: "Cart | Redbubble", kind: "meme", category: "doodle" },
  "pin-034": { file: "pin-034.jpg", name: "Sticker for whatsapp group I res", kind: "doodle", category: "meme" },
  "pin-035": { file: "pin-035.jpg", name: "A monkey sitting next to a stick", kind: "meme", category: "doodle" },
  "pin-036": { file: "pin-036.jpg", name: "Visit TikTok to discover profile", kind: "meme", category: "love" },
  "pin-037": { file: "pin-037.jpg", name: "Sticker for whatsapp !?", kind: "meme", category: "doodle" },
  "pin-038": { file: "pin-038.jpg", name: "Love", kind: "doodle", category: "love" },
  "pin-039": { file: "pin-039.jpg", name: "A hamster holding a red heart in", kind: "meme", category: "love" },
  "pin-040": { file: "pin-040.webp", name: "Silly Nerd Cat Sticker", kind: "meme", category: "love" },
  "pin-041": { file: "pin-041.jpg", name: "YAAH!", kind: "doodle", category: "doodle" },
  "pin-042": { file: "pin-042.jpg", name: "Crazy stickerrr🤪", kind: "meme", category: "meme" },
  "pin-043": { file: "pin-043.jpg", name: "A kitten holding a bouquet of re", kind: "meme", category: "cat" },
  "pin-044": { file: "pin-044.jpg", name: "Excuse Me Sticker", kind: "meme", category: "love" },
  "pin-045": { file: "pin-045.webp", name: "Cute Angry Cat Sticker", kind: "meme", category: "love" },
  "pin-046": { file: "pin-046.jpg", name: "A small white kitten standing on", kind: "meme", category: "cat" },
  "pin-047": { file: "pin-047.png", name: "A black and white cat with pink", kind: "doodle", category: "love" },
  "pin-048": { file: "pin-048.jpg", name: "Silly Florkofcows", kind: "meme", category: "meme" },
  "pin-049": { file: "pin-049.jpg", name: "Sticker gif whatsapp iphone Sus", kind: "meme", category: "love" },
  "pin-050": { file: "pin-050.jpg", name: "Love hate relationship of siblin", kind: "meme", category: "love" },
  "pin-051": { file: "pin-051.jpg", name: "Sticker 51", kind: "meme", category: "doodle" },
  "pin-052": { file: "pin-052.jpg", name: "Glamazon Squidward Sticker", kind: "doodle", category: "love" },
  "pin-053": { file: "pin-053.jpg", name: "❌Don't reup pic❌Save = theo dõi", kind: "meme", category: "cat" },
  "pin-054": { file: "pin-054.jpg", name: "A person with a brain on it's ha", kind: "doodle", category: "doodle" },
  "pin-055": { file: "pin-055.png", name: "Pfp/sticker �", kind: "doodle", category: "doodle" },
  "pin-056": { file: "pin-056.jpg", name: "Sticker 56", kind: "meme", category: "doodle" },
  "pin-057": { file: "pin-057.jpg", name: "Thank you cat, kucing terimakasi", kind: "meme", category: "cat" },
  "pin-058": { file: "pin-058.jpg", name: "Sticker 58", kind: "meme", category: "doodle" },
  "pin-059": { file: "pin-059.jpg", name: "Spongebob And Patrick Best Frien", kind: "meme", category: "love" },
  "pin-060": { file: "pin-060.jpg", name: "An anime character holding a cel", kind: "meme", category: "love" },
  "pin-061": { file: "pin-061.jpg", name: "Two cartoon bears standing next", kind: "doodle", category: "doodle" },
  "pin-062": { file: "pin-062.jpg", name: "An orange heart with the words i", kind: "meme", category: "love" },
  "pin-063": { file: "pin-063.jpg", name: "A stamp with the words best frie", kind: "meme", category: "family" },
  "pin-064": { file: "pin-064.jpg", name: "An orange and white cat looking", kind: "meme", category: "cat" },
  "pin-065": { file: "pin-065.jpg", name: "Two pinkie ponies standing next", kind: "meme", category: "doodle" },
  "pin-066": { file: "pin-066.jpg", name: "Sticker 66", kind: "meme", category: "doodle" },
  "pin-067": { file: "pin-067.jpg", name: "The penguins are standing next t", kind: "meme", category: "doodle" },
  "pin-068": { file: "pin-068.jpg", name: "Missyouholic", kind: "meme", category: "doodle" },
  "pin-069": { file: "pin-069.jpg", name: "An image of a cartoon character", kind: "doodle", category: "doodle" },
  "pin-070": { file: "pin-070.jpg", name: "Please i really need these � � �", kind: "meme", category: "doodle" },
  "pin-071": { file: "pin-071.jpg", name: "Let’s gooooo!", kind: "meme", category: "family" },
  "pin-072": { file: "pin-072.jpg", name: "Me & my girl twin", kind: "doodle", category: "meme" },
  "pin-073": { file: "pin-073.jpg", name: "A cartoon character with hearts", kind: "doodle", category: "love" },
  "pin-074": { file: "pin-074.jpg", name: "A black and white photo with the", kind: "meme", category: "family" },
  "pin-075": { file: "pin-075.jpg", name: "Stick men stickers The Office St", kind: "meme", category: "love" },
  "pin-076": { file: "pin-076.jpg", name: "Two minion stickers with glasses", kind: "meme", category: "doodle" },
  "pin-077": { file: "pin-077.jpg", name: "Sticker 77", kind: "meme", category: "doodle" },
  "pin-078": { file: "pin-078.jpg", name: "Two cartoon characters sitting a", kind: "doodle", category: "doodle" },
  "pin-079": { file: "pin-079.jpg", name: "Meri cute bestie", kind: "meme", category: "family" },
  "pin-080": { file: "pin-080.jpg", name: "A cartoon character holding up a", kind: "doodle", category: "doodle" },
  "pin-081": { file: "pin-081.jpg", name: "An orange and white kitten sitti", kind: "meme", category: "cat" },
  "pin-082": { file: "pin-082.jpg", name: "An image of a kitten with two yo", kind: "meme", category: "cat" },
  "pin-083": { file: "pin-083.jpg", name: "Two cats wearing sunglasses and", kind: "meme", category: "cat" },
  "pin-084": { file: "pin-084.jpg", name: "Two women pointing at the camera", kind: "meme", category: "doodle" },
  "pin-085": { file: "pin-085.jpg", name: "An animated image of a baby elep", kind: "meme", category: "love" },
  "pin-086": { file: "pin-086.jpg", name: "A kitten with a pink bow holding", kind: "meme", category: "cat" },
  "pin-087": { file: "pin-087.jpg", name: "Two stickers with an image of a", kind: "meme", category: "love" },
  "pin-088": { file: "pin-088.jpg", name: "\"cat in a blanket\" Sticker for S", kind: "meme", category: "cat" },
  "pin-089": { file: "pin-089.png", name: "My little brother", kind: "doodle", category: "dog" },
  "pin-090": { file: "pin-090.jpg", name: "Kediyy � � �⭐", kind: "meme", category: "cat" },
  "pin-091": { file: "pin-091.jpg", name: "Two green frog stickers sitting", kind: "meme", category: "doodle" },
  "pin-092": { file: "pin-092.jpg", name: "I Am Sorry Sticker", kind: "meme", category: "love" },
  "pin-093": { file: "pin-093.jpg", name: "Sticker on laptop \"Sly smiling d", kind: "meme", category: "love" },
  "pin-094": { file: "pin-094.jpg", name: "Frank be like", kind: "doodle", category: "love" },
  "pin-095": { file: "pin-095.jpg", name: "Two cats wearing sunglasses sitt", kind: "meme", category: "cat" },
  "pin-096": { file: "pin-096.jpg", name: "Scarlet", kind: "meme", category: "doodle" },
  "pin-097": { file: "pin-097.jpg", name: "Two people standing next to each", kind: "meme", category: "doodle" },
  "pin-098": { file: "pin-098.jpg", name: "Stickers meme", kind: "meme", category: "love" },
  "pin-099": { file: "pin-099.jpg", name: "Monkey Frriends Sticker", kind: "meme", category: "love" },
  "pin-100": { file: "pin-100.png", name: "Ketnipz Steep Sticker", kind: "doodle", category: "doodle" },
  "pin-101": { file: "pin-101.jpg", name: "W1cwey 1000pcs Cartoon Frog Stic", kind: "doodle", category: "doodle" },
  "pin-102": { file: "pin-102.jpg", name: "Two cats wearing sunglasses and", kind: "meme", category: "cat" },
  "pin-103": { file: "pin-103.jpg", name: "A kitten is holding a flower for", kind: "meme", category: "cat" },
  "pin-104": { file: "pin-104.jpg", name: "A sticker with the words birthda", kind: "doodle", category: "celebration" },
  "pin-105": { file: "pin-105.jpg", name: "A kitten sitting on top of a bed", kind: "meme", category: "cat" },
  "pin-106": { file: "pin-106.jpg", name: "Two cartoon figures with the wor", kind: "doodle", category: "doodle" },
  "pin-107": { file: "pin-107.jpg", name: "A cat holding two roses in front", kind: "meme", category: "cat" },
  "pin-108": { file: "pin-108.jpg", name: "A cartoon character with the wor", kind: "doodle", category: "family" },
  "pin-109": { file: "pin-109.jpg", name: "Sticker for whatsapp \"verified f", kind: "meme", category: "love" },
  "pin-110": { file: "pin-110.jpg", name: "A person holding a cat with the", kind: "meme", category: "cat" },
  "pin-111": { file: "pin-111.jpg", name: "A sticker with an image of a sna", kind: "meme", category: "doodle" },
  "pin-112": { file: "pin-112.jpg", name: "Sticker 112", kind: "meme", category: "doodle" },
  "pin-113": { file: "pin-113.png", name: "Sticker lucu Ohno Stickers for S", kind: "doodle", category: "doodle" },
  "pin-114": { file: "pin-114.jpg", name: "A cat with its tongue out and th", kind: "meme", category: "cat" },
  "pin-115": { file: "pin-115.jpg", name: "Sticker 115", kind: "meme", category: "doodle" },
  "pin-116": { file: "pin-116.jpg", name: "Hey cutie �", kind: "meme", category: "love" },
  "pin-117": { file: "pin-117.jpg", name: "Iphone sticker teaisfantastic Sh", kind: "meme", category: "cat" },
  "pin-118": { file: "pin-118.jpg", name: "A blue and white penguin with th", kind: "meme", category: "doodle" },
  "pin-119": { file: "pin-119.jpg", name: "Patrick Star Sticker", kind: "meme", category: "love" },
  "pin-120": { file: "pin-120.jpg", name: "A man with his hands on his ches", kind: "meme", category: "meme" },
  "pin-121": { file: "pin-121.jpg", name: "An image of a cartoon character", kind: "doodle", category: "love" },
  "pin-122": { file: "pin-122.jpg", name: "Cat", kind: "meme", category: "cat" },
  "pin-123": { file: "pin-123.jpg", name: "A woman brushing her hair with a", kind: "meme", category: "doodle" },
  "pin-124": { file: "pin-124.jpg", name: "My beautiful sister", kind: "meme", category: "cat" },
  "pin-125": { file: "pin-125.png", name: "Check out sticker 15803967 in th", kind: "doodle", category: "celebration" },
  "pin-126": { file: "pin-126.jpg", name: "Sticker kawaii png Pegatinas", kind: "meme", category: "cat" },
  "pin-127": { file: "pin-127.jpg", name: "An emo emo emo emo emo face emo", kind: "meme", category: "doodle" },
  "pin-128": { file: "pin-128.jpg", name: "Girlboss Stickthing Meme Sticker", kind: "meme", category: "love" },
  "pin-129": { file: "pin-129.jpg", name: "A hamster with the words gu kha", kind: "meme", category: "doodle" },
  "pin-130": { file: "pin-130.png", name: "She's my everything bro.. ☹", kind: "doodle", category: "love" },
  "pin-131": { file: "pin-131.jpg", name: "Flowers for u.. �", kind: "meme", category: "doodle" },
  "pin-132": { file: "pin-132.jpg", name: "Meme Stickers for Sale Pegatinas", kind: "meme", category: "cat" },
  "pin-133": { file: "pin-133.jpg", name: "Sorry � �", kind: "meme", category: "cat" },
  "pin-134": { file: "pin-134.jpg", name: "Sticker for whatsapp love sorry", kind: "meme", category: "love" },
  "pin-135": { file: "pin-135.png", name: "We Bare Bears Hugs Sticker", kind: "doodle", category: "doodle" },
  "pin-136": { file: "pin-136.jpg", name: "Si.", kind: "meme", category: "love" },
  "pin-137": { file: "pin-137.jpg", name: "A sticker with the words hey, yo", kind: "meme", category: "doodle" },
  "pin-138": { file: "pin-138.jpg", name: "Lemme Take A Selfie Sticker", kind: "meme", category: "love" },
  "pin-139": { file: "pin-139.jpg", name: "Best Bro Heart Design Cool Broth", kind: "meme", category: "love" },
  "pin-140": { file: "pin-140.jpg", name: "A sticker with the words little", kind: "meme", category: "family" },
  "pin-141": { file: "pin-141.jpg", name: "Heart sticker for whatsapp Pin o", kind: "doodle", category: "love" },
  "pin-142": { file: "pin-142.jpg", name: "A cat's face with its eyes wide", kind: "meme", category: "cat" },
  "pin-143": { file: "pin-143.png", name: ":) cuando no estudia para el exa", kind: "doodle", category: "dog" },
  "pin-144": { file: "pin-144.jpg", name: "Sticker \"Cute Duck Meme\" Sticker", kind: "meme", category: "meme" },
  "pin-145": { file: "pin-145.jpg", name: "Meri behen", kind: "doodle", category: "dog" },
  "pin-146": { file: "pin-146.jpg", name: "Flirty Meme Sticker", kind: "meme", category: "love" },
  "pin-147": { file: "pin-147.jpg", name: "Two stickers with the words best", kind: "meme", category: "love" },
  "pin-148": { file: "pin-148.gif", name: "An image of a happy father's day", kind: "doodle", category: "cat" },
  "pin-149": { file: "pin-149.jpg", name: "Pisi", kind: "meme", category: "love" },
  "pin-150": { file: "pin-150.jpg", name: "A pink sticker that says you're", kind: "meme", category: "love" },
  "pin-151": { file: "pin-151.jpg", name: "Sticker y2k art \"HUH Cat\" Sticke", kind: "meme", category: "love" },
  "pin-152": { file: "pin-152.jpg", name: "Funny doodle meme", kind: "doodle", category: "meme" },
  "pin-153": { file: "pin-153.jpg", name: "A woman holding a heart with the", kind: "meme", category: "love" },
  "pin-154": { file: "pin-154.jpg", name: "Two gray rocks with pink bows on", kind: "meme", category: "doodle" },
  "pin-155": { file: "pin-155.jpg", name: "Two cats hugging each other with", kind: "meme", category: "love" },
  "pin-156": { file: "pin-156.jpg", name: "Two hearts in the shape of a cou", kind: "doodle", category: "love" },
  "pin-157": { file: "pin-157.jpg", name: "A small orange kitten sitting on", kind: "meme", category: "cat" },
  "pin-158": { file: "pin-158.jpg", name: "A person with sunglasses and a r", kind: "doodle", category: "doodle" },
  "pin-159": { file: "pin-159.jpg", name: "Friend-sheep Funny Sheep Pun Sti", kind: "meme", category: "love" },
  "pin-160": { file: "pin-160.jpg", name: "I’m sorry", kind: "meme", category: "cat" },
  "pin-161": { file: "pin-161.jpg", name: "Sticker 161", kind: "meme", category: "doodle" },
  "pin-162": { file: "pin-162.png", name: "A sticker that says sisters i'll", kind: "doodle", category: "family" },
  "pin-163": { file: "pin-163.png", name: "There’s No Such Thing as an Effe", kind: "doodle", category: "cat" },
  "pin-164": { file: "pin-164.jpg", name: "Best Friends Sticker", kind: "meme", category: "love" },
  "pin-165": { file: "pin-165.jpg", name: "A sticker with the words best br", kind: "meme", category: "family" },
  "pin-166": { file: "pin-166.jpg", name: "39 Too-Real IRL Memes That Will", kind: "meme", category: "cat" },
  "pin-167": { file: "pin-167.jpg", name: "20 Best Father's Day Memes & Swe", kind: "meme", category: "family" },
  "pin-168": { file: "pin-168.jpg", name: "Pataka Punjabi Hindi For Women F", kind: "meme", category: "love" },
  "pin-169": { file: "pin-169.jpg", name: "A small white kitten is peeking", kind: "meme", category: "cat" },
  "pin-170": { file: "pin-170.jpg", name: "The words crazy best friend in b", kind: "meme", category: "family" },
  "pin-171": { file: "pin-171.jpg", name: "A sticker with the words best si", kind: "meme", category: "family" },
  "pin-172": { file: "pin-172.jpg", name: "A cartoon bear holding onto the", kind: "doodle", category: "doodle" },
  "pin-173": { file: "pin-173.jpg", name: "Bff Best Friend Friendship For T", kind: "meme", category: "love" },
  "pin-174": { file: "pin-174.jpg", name: "Cat gifting flowers meme but it'", kind: "meme", category: "cat" },
  "pin-175": { file: "pin-175.jpg", name: "A yellow duck with sunglasses th", kind: "meme", category: "doodle" },
  "pin-176": { file: "pin-176.jpg", name: "A black and white poster with th", kind: "meme", category: "doodle" },
  "pin-177": { file: "pin-177.jpg", name: "A sticker that says brother like", kind: "meme", category: "celebration" },
  "pin-178": { file: "pin-178.jpg", name: "A girl with a flower in her hair", kind: "doodle", category: "love" },
  "pin-179": { file: "pin-179.jpg", name: "Get my art printed on awesome pr", kind: "meme", category: "family" },
  "pin-180": { file: "pin-180.jpg", name: "Soul Sister Gift Bff Best Friend", kind: "meme", category: "love" },
  "pin-181": { file: "pin-181.png", name: "Dad Memes That Totally Capture D", kind: "doodle", category: "family" },
  "pin-182": { file: "pin-182.jpg", name: "Always my sister sticker,sister", kind: "meme", category: "love" },
  "pin-183": { file: "pin-183.jpg", name: "21 Hilarious Memes To Send Your", kind: "meme", category: "celebration" },
  "pin-184": { file: "pin-184.jpg", name: "Sticker 184", kind: "meme", category: "doodle" },
  "pin-185": { file: "pin-185.jpg", name: "“Ur my duckin best friend” Snapc", kind: "meme", category: "family" },
  "pin-186": { file: "pin-186.jpg", name: "A cartoon boy and girl running t", kind: "doodle", category: "doodle" },
  "pin-187": { file: "pin-187.jpg", name: "13 Quirky Peeking Brother Sister", kind: "doodle", category: "doodle" },
  "pin-188": { file: "pin-188.jpg", name: "A happy father's day card with a", kind: "doodle", category: "doodle" },
  "pin-189": { file: "pin-189.jpg", name: "#aesthetic #ily #blushing #cutec", kind: "meme", category: "love" },
  "pin-190": { file: "pin-190.jpg", name: "Best Sister Ever Sticker", kind: "meme", category: "family" },
  "pin-191": { file: "pin-191.jpg", name: "Sorry Cards & Templates Zazzle", kind: "meme", category: "doodle" },
  "pin-192": { file: "pin-192.jpg", name: "What's up brother sticker", kind: "meme", category: "family" },
  "pin-193": { file: "pin-193.jpg", name: "Bff Sisters Sticker", kind: "meme", category: "love" },
  "pin-194": { file: "pin-194.jpg", name: "Friend bestie sister funny stick", kind: "meme", category: "love" },
  "pin-195": { file: "pin-195.jpg", name: "Ok Sis Sticker", kind: "meme", category: "love" },
  "pin-196": { file: "pin-196.jpg", name: "A cat wearing a white hat surrou", kind: "meme", category: "love" },
  "pin-197": { file: "pin-197.jpg", name: "A couple of bears hugging each o", kind: "meme", category: "love" },
  "pin-198": { file: "pin-198.jpg", name: "Bacon And Egg Bff Sticker", kind: "meme", category: "love" },
  "pin-199": { file: "pin-199.jpg", name: "Best Friends crazy best friend", kind: "meme", category: "family" },
  "pin-200": { file: "pin-200.jpg", name: "Friends Forver Sticker", kind: "meme", category: "love" },
  "pin-201": { file: "pin-201.jpg", name: "Bubu And Dudu Sticker", kind: "doodle", category: "love" },
  "pin-202": { file: "pin-202.jpg", name: "An image of two cats hugging eac", kind: "meme", category: "love" },
  "pin-203": { file: "pin-203.jpg", name: "Sticker ideas for water bottle 3", kind: "meme", category: "doodle" },
  "pin-204": { file: "pin-204.jpg", name: "Two dogs that are sitting next t", kind: "meme", category: "dog" },
  "pin-205": { file: "pin-205.png", name: "Me in you :)", kind: "doodle", category: "doodle" },
  "pin-206": { file: "pin-206.png", name: "Two stickers with hearts and sta", kind: "doodle", category: "love" },
  "pin-207": { file: "pin-207.jpg", name: "Meme 3 friendship relationship R", kind: "doodle", category: "love" },
  "pin-208": { file: "pin-208.jpg", name: "Sponge And Star Sticker", kind: "doodle", category: "love" },
  "pin-209": { file: "pin-209.jpg", name: "Vintage Stickers Overlay", kind: "meme", category: "love" },
  "pin-210": { file: "pin-210.jpg", name: "An orange cat with the words i'm", kind: "meme", category: "cat" },
  "pin-211": { file: "pin-211.jpg", name: "A man holding a bunch of sunflow", kind: "meme", category: "doodle" },
  "pin-212": { file: "pin-212.jpg", name: "Two little trolls with pink and", kind: "meme", category: "doodle" },
  "pin-213": { file: "pin-213.jpg", name: "An orange cat sitting on the flo", kind: "meme", category: "cat" },
  "pin-214": { file: "pin-214.jpg", name: "Two monkeys sitting next to each", kind: "meme", category: "doodle" },
  "pin-215": { file: "pin-215.jpg", name: "Two small animals are standing n", kind: "meme", category: "doodle" },
  "pin-216": { file: "pin-216.jpg", name: "Para figurinha", kind: "meme", category: "doodle" },
  "pin-217": { file: "pin-217.png", name: "Dog $2", kind: "doodle", category: "dog" },
  "pin-218": { file: "pin-218.jpg", name: "A monkey is holding a red rose i", kind: "meme", category: "doodle" },
  "pin-219": { file: "pin-219.jpg", name: "Sticker 219", kind: "meme", category: "doodle" },
  "pin-220": { file: "pin-220.jpg", name: "An avocado and egg are standing", kind: "meme", category: "doodle" },
  "pin-221": { file: "pin-221.jpg", name: "Two dachshunds sitting on a couc", kind: "meme", category: "doodle" },
  "pin-222": { file: "pin-222.jpg", name: "Friendship", kind: "doodle", category: "family" },
  "pin-223": { file: "pin-223.jpg", name: "Sticker 223", kind: "meme", category: "doodle" },
  "pin-224": { file: "pin-224.jpg", name: "Purrfect Connection Sticker", kind: "meme", category: "love" },
  "pin-225": { file: "pin-225.jpg", name: "A sticker that says, i'll be the", kind: "meme", category: "doodle" },
  "pin-226": { file: "pin-226.jpg", name: "A sticker that says, friendship", kind: "meme", category: "family" },
  "pin-227": { file: "pin-227.png", name: "A monkey with a birthday hat on", kind: "doodle", category: "celebration" },
  "pin-228": { file: "pin-228.jpg", name: "This is me and my twin but now w", kind: "meme", category: "family" },
  "pin-229": { file: "pin-229.jpg", name: "Me n my bestie coree", kind: "doodle", category: "family" },
  "pin-230": { file: "pin-230.jpg", name: "I need an online friend �", kind: "doodle", category: "love" },
  "pin-231": { file: "pin-231.jpg", name: "Cute cutouts", kind: "meme", category: "doodle" },
  "pin-232": { file: "pin-232.jpg", name: "A white cat with black eyes is l", kind: "meme", category: "cat" },
  "pin-233": { file: "pin-233.jpg", name: "National sticker day quotes I�ve", kind: "meme", category: "love" },
  "pin-234": { file: "pin-234.png", name: "Monkey Wedding Sticker", kind: "doodle", category: "love" },
  "pin-235": { file: "pin-235.jpg", name: "A pink sticker with the words wa", kind: "meme", category: "family" },
  "pin-236": { file: "pin-236.jpg", name: "A small monkey sitting on top of", kind: "meme", category: "love" },
  "pin-237": { file: "pin-237.jpg", name: "Couple Love Stickers", kind: "meme", category: "love" },
  "pin-238": { file: "pin-238.jpg", name: "You get a rose � for being so ve", kind: "doodle", category: "doodle" },
  "pin-239": { file: "pin-239.jpg", name: "Just for you <3", kind: "doodle", category: "love" },
  "pin-240": { file: "pin-240.jpg", name: "Sticker ideas for car Capybara C", kind: "meme", category: "love" },
  "pin-241": { file: "pin-241.png", name: "A cartoon character holding a he", kind: "doodle", category: "love" },
  "pin-242": { file: "pin-242.jpg", name: "Adorable Uno Reverse Card Love S", kind: "doodle", category: "love" },
  "pin-243": { file: "pin-243.jpg", name: "Best Boyfriend Certified Sticker", kind: "meme", category: "love" },
  "pin-244": { file: "pin-244.jpg", name: "Sticker for whatsapp love I LOVE", kind: "meme", category: "love" },
  "pin-245": { file: "pin-245.jpg", name: "Heart Meme Sticker", kind: "meme", category: "love" },
  "pin-246": { file: "pin-246.jpg", name: "Stickers anime 5 Funny Love Cute", kind: "meme", category: "love" },
  "pin-247": { file: "pin-247.jpg", name: "Two stickers with the words best", kind: "meme", category: "love" },
  "pin-248": { file: "pin-248.jpg", name: "Sticker 248", kind: "meme", category: "doodle" },
  "pin-249": { file: "pin-249.jpg", name: "An anime character hugging anoth", kind: "meme", category: "love" },
  "pin-250": { file: "pin-250.jpg", name: "Monkey ⋆˙⟡₊ ⊹˚", kind: "meme", category: "doodle" },
  "pin-251": { file: "pin-251.jpg", name: "[object Object]", kind: "meme", category: "love" },
  "pin-252": { file: "pin-252.jpg", name: "A stick figure holding the hand", kind: "doodle", category: "love" },
  "pin-253": { file: "pin-253.jpg", name: "He is mine Sticker", kind: "meme", category: "love" },
  "pin-254": { file: "pin-254.jpg", name: "I Love You This Much Doodle Stic", kind: "doodle", category: "love" },
  "pin-255": { file: "pin-255.jpg", name: "Two monkeys with hearts on their", kind: "meme", category: "love" },
  "pin-256": { file: "pin-256.png", name: "Tom and Jerry Jerry Heartbeat St", kind: "doodle", category: "love" },
  "pin-257": { file: "pin-257.jpg", name: "I Love You Patrick Star Sticker", kind: "meme", category: "love" },
  "pin-258": { file: "pin-258.jpg", name: "Two penguins hugging each other", kind: "meme", category: "love" },
  "pin-259": { file: "pin-259.jpg", name: "Two people are hugging each othe", kind: "meme", category: "love" },
  "pin-260": { file: "pin-260.jpg", name: "Kawaii Stickers", kind: "meme", category: "love" },
  "pin-261": { file: "pin-261.jpg", name: "Perfect Valentines For Him Surpr", kind: "meme", category: "love" },
  "pin-262": { file: "pin-262.jpg", name: "Ducky Loves U!! Sticker", kind: "meme", category: "love" },
  "pin-263": { file: "pin-263.jpg", name: "Boyfriend Verified Kiss-Cut Stic", kind: "meme", category: "love" },
  "pin-264": { file: "pin-264.jpg", name: "Funny Love Cute Kawaii Sticker", kind: "meme", category: "love" },
  "pin-265": { file: "pin-265.png", name: "You and me sticker", kind: "doodle", category: "love" },
  "pin-266": { file: "pin-266.jpg", name: "A cartoon character holding a bu", kind: "doodle", category: "love" },
  "pin-267": { file: "pin-267.jpg", name: "Sticker Größe S (10 x 10 cm) bas", kind: "meme", category: "love" },
  "pin-268": { file: "pin-268.jpg", name: "Sticker laptop \ Pingu Heart Moo", kind: "meme", category: "love" },
  "pin-269": { file: "pin-269.jpg", name: "Monkey jus chillin", kind: "meme", category: "doodle" },
  "pin-270": { file: "pin-270.png", name: "Two stick figures holding hands", kind: "doodle", category: "love" },
  "pin-271": { file: "pin-271.png", name: "A man holding a woman's head wit", kind: "doodle", category: "love" },
  "pin-272": { file: "pin-272.jpg", name: "Feeling Love Sticker", kind: "meme", category: "love" },
  "pin-273": { file: "pin-273.webp", name: "A cat with the caption'good boy'", kind: "meme", category: "cat" },
  "pin-274": { file: "pin-274.jpg", name: "San Valentín", kind: "meme", category: "love" },
  "pin-275": { file: "pin-275.jpg", name: "Two people holding hands with a", kind: "meme", category: "love" },
  "pin-276": { file: "pin-276.jpg", name: "Two small kittens dressed up as", kind: "meme", category: "cat" },
  "pin-277": { file: "pin-277.jpg", name: "Cat so cute", kind: "meme", category: "cat" },
  "pin-278": { file: "pin-278.jpg", name: "There is a cat that is looking a", kind: "meme", category: "cat" },
  "pin-279": { file: "pin-279.jpg", name: "Married.♡", kind: "meme", category: "doodle" },
  "pin-280": { file: "pin-280.png", name: "Two cartoon characters are huggi", kind: "doodle", category: "love" },
  "pin-281": { file: "pin-281.jpg", name: "My Boy Sticker", kind: "meme", category: "love" },
  "pin-282": { file: "pin-282.jpg", name: "In love 🧡", kind: "meme", category: "love" },
  "pin-283": { file: "pin-283.jpg", name: "A cat standing on its hind legs", kind: "meme", category: "cat" },
  "pin-284": { file: "pin-284.jpg", name: "Cute penguin", kind: "meme", category: "love" },
  "pin-285": { file: "pin-285.jpg", name: "An image of a cat with hearts al", kind: "meme", category: "love" },
  "pin-286": { file: "pin-286.jpg", name: "The duck is sitting in the batht", kind: "meme", category: "doodle" },
  "pin-287": { file: "pin-287.jpg", name: "An orange cat with the words hi", kind: "meme", category: "cat" },
  "pin-288": { file: "pin-288.jpg", name: "Cute Meme", kind: "meme", category: "love" },
  "pin-289": { file: "pin-289.jpg", name: "Free Cuddles Ticket Sticker Stic", kind: "meme", category: "love" },
  "pin-290": { file: "pin-290.jpg", name: "I Love My Girlfriend,I Heart My", kind: "meme", category: "love" },
  "pin-291": { file: "pin-291.jpg", name: "A sticker with the words, finall", kind: "meme", category: "love" },
  "pin-292": { file: "pin-292.jpg", name: "Flork Meme", kind: "meme", category: "love" },
  "pin-293": { file: "pin-293.jpg", name: "A small kitten holding onto a ri", kind: "meme", category: "cat" },
  "pin-294": { file: "pin-294.jpg", name: "An orange cat with a bow holding", kind: "meme", category: "cat" },
  "pin-295": { file: "pin-295.png", name: "Gojo Satoru ⁦✪", kind: "doodle", category: "doodle" },
  "pin-296": { file: "pin-296.jpg", name: "A brown teddy bear standing next", kind: "meme", category: "doodle" },
  "pin-297": { file: "pin-297.jpg", name: "Two stickers that say you're min", kind: "meme", category: "doodle" },
  "pin-298": { file: "pin-298.jpg", name: "On Sticker", kind: "meme", category: "love" },
  "pin-299": { file: "pin-299.jpg", name: "Sticker 299", kind: "meme", category: "doodle" },
  "pin-300": { file: "pin-300.jpg", name: "Lacking vitamin U🫵😻🫶❤️", kind: "meme", category: "doodle" },
  "pin-301": { file: "pin-301.jpg", name: "A kitten is sitting on the arm o", kind: "meme", category: "cat" },
  "pin-302": { file: "pin-302.jpg", name: "ALIEN ˚✧₊˳༚", kind: "doodle", category: "cat" },
  "pin-303": { file: "pin-303.jpg", name: "Two cartoon characters standing", kind: "doodle", category: "doodle" },
  "pin-304": { file: "pin-304.jpg", name: "A cat with hearts on it's head a", kind: "meme", category: "love" },
  "pin-305": { file: "pin-305.png", name: "A cat holding a heart sticker", kind: "doodle", category: "love" },
  "pin-306": { file: "pin-306.jpg", name: "A man and woman are holding each", kind: "meme", category: "doodle" },
  "pin-307": { file: "pin-307.jpg", name: "This is for you, my cutie pie 3", kind: "meme", category: "doodle" },
  "pin-308": { file: "pin-308.jpg", name: "Valentine Goose Couple Sticker", kind: "meme", category: "love" },
  "pin-309": { file: "pin-309.jpg", name: "Kissing cat � 🥺", kind: "meme", category: "love" },
  "pin-310": { file: "pin-310.jpg", name: "Adorable Pink Valentines Duckie", kind: "doodle", category: "love" },
  "pin-311": { file: "pin-311.jpg", name: "A pink card with hearts and an a", kind: "meme", category: "love" },
  "pin-312": { file: "pin-312.jpg", name: "A white cat with big eyes and a", kind: "meme", category: "cat" },
  "pin-313": { file: "pin-313.jpg", name: "I Love My Gf Sticker", kind: "meme", category: "love" },
  "pin-314": { file: "pin-314.jpg", name: "Tulips", kind: "meme", category: "doodle" },
  "pin-315": { file: "pin-315.jpg", name: "Best Girlfriend Ever", kind: "meme", category: "love" },
  "pin-316": { file: "pin-316.jpg", name: "Lovely Duck Couple Sticker", kind: "meme", category: "love" },
  "pin-317": { file: "pin-317.jpg", name: "Two people hugging each other in", kind: "meme", category: "love" },
  "pin-318": { file: "pin-318.jpg", name: "A patch with the words my girl o", kind: "meme", category: "doodle" },
  "pin-319": { file: "pin-319.jpg", name: "A sticker that says, my girlfrie", kind: "meme", category: "family" },
  "pin-320": { file: "pin-320.jpg", name: "Mommy ha?", kind: "doodle", category: "love" },
  "pin-321": { file: "pin-321.jpg", name: "A group of black and white kitte", kind: "meme", category: "cat" },
  "pin-322": { file: "pin-322.jpg", name: "Mommy ha?", kind: "doodle", category: "love" },
  "pin-323": { file: "pin-323.jpg", name: "A cartoon character sitting on t", kind: "doodle", category: "love" },
  "pin-324": { file: "pin-324.jpg", name: "Here have some flowers � �", kind: "meme", category: "dog" },
  "pin-325": { file: "pin-325.jpg", name: "A group of black and white kitte", kind: "meme", category: "cat" },
  "pin-326": { file: "pin-326.jpg", name: "Gym � � � �", kind: "meme", category: "doodle" },
  "pin-327": { file: "pin-327.png", name: "Cutest cats", kind: "doodle", category: "cat" },
  "pin-328": { file: "pin-328.jpg", name: "Save=follow me", kind: "meme", category: "cat" },
  "pin-329": { file: "pin-329.jpg", name: "Caramel macciatto", kind: "meme", category: "cat" },
  "pin-330": { file: "pin-330.jpg", name: "A white cat with purple flowers", kind: "meme", category: "cat" },
  "pin-331": { file: "pin-331.jpg", name: "Ben", kind: "meme", category: "cat" },
  "pin-332": { file: "pin-332.jpg", name: "A duck wearing a red hat sitting", kind: "meme", category: "love" },
  "pin-333": { file: "pin-333.png", name: "The cat is wearing a pink boxing", kind: "doodle", category: "love" },
  "pin-334": { file: "pin-334.jpg", name: "Cute Shark Pet Headband Soft Fle", kind: "meme", category: "love" },
  "pin-335": { file: "pin-335.jpg", name: "A cat wearing glasses holding a", kind: "meme", category: "cat" },
  "pin-336": { file: "pin-336.jpg", name: "A cat with a rubber duck in fron", kind: "meme", category: "cat" },
  "pin-337": { file: "pin-337.jpg", name: "62 Things That Are Not Medicine", kind: "meme", category: "love" },
  "pin-338": { file: "pin-338.jpg", name: "Two dogs with watermelon hats on", kind: "meme", category: "dog" },
  "pin-339": { file: "pin-339.jpg", name: "A stick figure holding the hand", kind: "doodle", category: "love" },
  "pin-340": { file: "pin-340.jpg", name: "Two monkeys standing next to eac", kind: "meme", category: "doodle" },
  "pin-341": { file: "pin-341.png", name: "Emoji", kind: "doodle", category: "reaction" },
  "pin-342": { file: "pin-342.jpg", name: "A gray and white cat wearing gla", kind: "meme", category: "cat" },
  "pin-343": { file: "pin-343.png", name: "Sticker 343", kind: "doodle", category: "doodle" },
  "pin-344": { file: "pin-344.jpg", name: "Two cats sitting on top of each", kind: "meme", category: "cat" },
  "pin-345": { file: "pin-345.png", name: "Two cats with hats on their head", kind: "doodle", category: "cat" },
  "pin-346": { file: "pin-346.jpg", name: "Sticker 346", kind: "meme", category: "doodle" },
  "pin-347": { file: "pin-347.jpg", name: "Liw", kind: "meme", category: "cat" },
  "pin-348": { file: "pin-348.png", name: "Bride & Groom But Make It Cats �", kind: "doodle", category: "love" },
  "pin-349": { file: "pin-349.jpg", name: "Chihuahua", kind: "meme", category: "dog" },
  "pin-350": { file: "pin-350.png", name: "A small dog wearing a green dino", kind: "doodle", category: "dog" },
  "pin-351": { file: "pin-351.jpg", name: "An orange cat holding a bunch of", kind: "meme", category: "cat" },
  "pin-352": { file: "pin-352.jpg", name: "A hamster peeks out from behind", kind: "meme", category: "love" },
  "pin-353": { file: "pin-353.png", name: "Capybara Besties Selfie � � Cute", kind: "doodle", category: "love" },
  "pin-354": { file: "pin-354.jpg", name: "A white cat wearing a blue chris", kind: "meme", category: "cat" },
  "pin-355": { file: "pin-355.webp", name: "A woman's face with her eyes clo", kind: "meme", category: "doodle" },
  "pin-356": { file: "pin-356.png", name: "Patinho", kind: "doodle", category: "love" },
  "pin-357": { file: "pin-357.jpg", name: "A cat wearing glasses and holdin", kind: "meme", category: "cat" },
  "pin-358": { file: "pin-358.jpg", name: "Sticker 358", kind: "meme", category: "doodle" },
  "pin-359": { file: "pin-359.jpg", name: "A cat wearing headphones and hol", kind: "meme", category: "love" },
  "pin-360": { file: "pin-360.jpg", name: "A person holding a bunch of flow", kind: "meme", category: "doodle" },
  "pin-361": { file: "pin-361.jpg", name: "A hamster is holding a rose in i", kind: "meme", category: "doodle" },
  "pin-362": { file: "pin-362.jpg", name: "Me when it's to dance 🪩", kind: "doodle", category: "doodle" },
  "pin-363": { file: "pin-363.jpg", name: "Monyet lucu", kind: "meme", category: "doodle" },
  "pin-364": { file: "pin-364.jpg", name: "A cartoon duck with the words ky", kind: "doodle", category: "doodle" },
  "pin-365": { file: "pin-365.jpg", name: "Resii", kind: "meme", category: "doodle" },
  "pin-366": { file: "pin-366.png", name: "An orange and white hamster stic", kind: "doodle", category: "doodle" },
  "pin-367": { file: "pin-367.jpg", name: "An image of a cartoon character", kind: "doodle", category: "doodle" },
  "pin-368": { file: "pin-368.png", name: "You and me", kind: "doodle", category: "love" },
  "pin-369": { file: "pin-369.jpg", name: "An anime character with her hair", kind: "doodle", category: "doodle" },
  "pin-370": { file: "pin-370.jpg", name: "Two cats standing next to each o", kind: "meme", category: "cat" },
  "pin-371": { file: "pin-371.jpg", name: "Three monkeys standing next to e", kind: "meme", category: "doodle" },
  "pin-372": { file: "pin-372.jpg", name: "A cat with a pink bow on it's he", kind: "meme", category: "cat" },
  "pin-373": { file: "pin-373.jpg", name: "Ghim trên florkcow", kind: "meme", category: "meme" },
  "pin-374": { file: "pin-374.jpg", name: "Katti �", kind: "meme", category: "cat" },
  "pin-375": { file: "pin-375.jpg", name: "Sticker 375", kind: "meme", category: "doodle" },
  "pin-376": { file: "pin-376.jpg", name: "Pgl ho kya ?! �", kind: "meme", category: "love" },
  "pin-377": { file: "pin-377.jpg", name: "A brown dog wearing blue overall", kind: "meme", category: "dog" },
  "pin-378": { file: "pin-378.jpg", name: "Foodie cat", kind: "meme", category: "cat" },
  "pin-379": { file: "pin-379.jpg", name: "Two baby ducks standing next to", kind: "meme", category: "doodle" },
  "pin-380": { file: "pin-380.jpg", name: "A small hamster standing on its", kind: "meme", category: "doodle" },
  "pin-381": { file: "pin-381.jpg", name: "Two fingerprints holding hands w", kind: "meme", category: "love" },
  "pin-382": { file: "pin-382.jpg", name: "A gray and white cat with pink b", kind: "meme", category: "cat" },
  "pin-383": { file: "pin-383.jpg", name: "Healty Shiny Glowing Hairs Ideas", kind: "meme", category: "cat" },
  "pin-384": { file: "pin-384.jpg", name: "A cat in a suit and tie holding", kind: "meme", category: "cat" },
  "pin-385": { file: "pin-385.jpg", name: "Funny couple Whatsapp sticker", kind: "doodle", category: "love" },
  "pin-386": { file: "pin-386.jpg", name: "A cat with its head in the air a", kind: "meme", category: "cat" },
  "pin-387": { file: "pin-387.png", name: "Pov:", kind: "doodle", category: "family" },
  "pin-388": { file: "pin-388.png", name: "15 Cute Easy Drawings Best Frien", kind: "doodle", category: "family" },
  "pin-389": { file: "pin-389.jpg", name: "Brain 🧠 you dropped this", kind: "meme", category: "cat" },
  "pin-390": { file: "pin-390.jpg", name: "Two cats sitting next to each ot", kind: "meme", category: "cat" },
  "pin-391": { file: "pin-391.jpg", name: "A person holding a small hamster", kind: "meme", category: "doodle" },
  "pin-392": { file: "pin-392.jpg", name: "A hamster sitting on top of a pi", kind: "meme", category: "doodle" },
  "pin-393": { file: "pin-393.jpg", name: "An orange and white cat holding", kind: "meme", category: "cat" },
  "pin-394": { file: "pin-394.jpg", name: "A poster with an image of two pe", kind: "meme", category: "doodle" },
  "pin-395": { file: "pin-395.jpg", name: "A cat sitting on top of a table", kind: "meme", category: "cat" },
  "pin-396": { file: "pin-396.png", name: "A happy birthday bunny holding a", kind: "doodle", category: "celebration" },
  "pin-397": { file: "pin-397.jpg", name: "A group of cats sitting on top o", kind: "meme", category: "cat" },
  "pin-398": { file: "pin-398.jpg", name: "Two cats with their eyes closed", kind: "meme", category: "cat" },
  "pin-399": { file: "pin-399.jpg", name: "A penguin with a bow on its head", kind: "meme", category: "doodle" },
  "pin-400": { file: "pin-400.jpg", name: "Sticker 400", kind: "meme", category: "doodle" },
  "pin-401": { file: "pin-401.jpg", name: "For all the CATaholic people � �", kind: "meme", category: "love" },
  "pin-402": { file: "pin-402.jpg", name: "A white hamster with its hand in", kind: "meme", category: "doodle" },
  "pin-403": { file: "pin-403.jpg", name: "Two people with pink bows on the", kind: "meme", category: "doodle" },
  "pin-404": { file: "pin-404.jpg", name: "Two cats wearing sunglasses and", kind: "meme", category: "cat" },
  "pin-405": { file: "pin-405.png", name: "Two monkeys wearing party hats w", kind: "doodle", category: "celebration" },
  "pin-406": { file: "pin-406.jpg", name: "Two young men standing next to e", kind: "meme", category: "doodle" },
  "pin-407": { file: "pin-407.jpg", name: "Two brown bears standing next to", kind: "meme", category: "doodle" },
  "pin-408": { file: "pin-408.jpg", name: "Two cats wearing sunglasses and", kind: "meme", category: "cat" },
  "pin-409": { file: "pin-409.jpg", name: "Two cats sitting on top of each", kind: "meme", category: "cat" },
  "pin-410": { file: "pin-410.jpg", name: "Two monkeys are making a heart s", kind: "meme", category: "love" },
  "pin-411": { file: "pin-411.jpg", name: "Two dogs that are laying down to", kind: "meme", category: "dog" },
  "pin-412": { file: "pin-412.png", name: "An image of a dog's face with it", kind: "doodle", category: "dog" },
  "pin-413": { file: "pin-413.jpg", name: "A sticker with an image of a spi", kind: "meme", category: "cat" },
  "pin-414": { file: "pin-414.jpg", name: "A cartoon character holding a bo", kind: "doodle", category: "doodle" },
  "pin-415": { file: "pin-415.jpg", name: "Visit TikTok to discover profile", kind: "meme", category: "love" },
  "pin-416": { file: "pin-416.jpg", name: "Sticker 416", kind: "meme", category: "doodle" },
  "pin-417": { file: "pin-417.jpg", name: "The face of a cat with a heart i", kind: "meme", category: "love" },
  "pin-418": { file: "pin-418.jpg", name: "A white cat laying on top of a f", kind: "meme", category: "love" },
  "pin-419": { file: "pin-419.png", name: "Two cats are playing with each o", kind: "doodle", category: "cat" },
  "pin-420": { file: "pin-420.jpg", name: "Cat couple Cat lover sticker", kind: "meme", category: "love" },
  "pin-421": { file: "pin-421.jpg", name: "Pookie cat with handsome dog", kind: "meme", category: "cat" },
  "pin-422": { file: "pin-422.png", name: "Cute Couple Stickers", kind: "doodle", category: "love" },
  "pin-423": { file: "pin-423.jpg", name: "An image of two cartoon characte", kind: "doodle", category: "doodle" },
  "pin-424": { file: "pin-424.jpg", name: "Heart cat", kind: "meme", category: "love" },
  "pin-425": { file: "pin-425.jpg", name: "Stickers anime 5 Funny Love Cute", kind: "meme", category: "love" },
  "pin-426": { file: "pin-426.jpg", name: "Kedy", kind: "meme", category: "cat" },
  "pin-427": { file: "pin-427.jpg", name: "Sticker for whatsapp kiss \"I lov", kind: "meme", category: "love" },
  "pin-428": { file: "pin-428.jpg", name: "Sticker 428", kind: "meme", category: "doodle" },
  "pin-429": { file: "pin-429.jpg", name: "A man laying on the floor surrou", kind: "meme", category: "love" },
  "pin-430": { file: "pin-430.jpg", name: "A cat sleeping next to a fence", kind: "doodle", category: "cat" },
  "pin-431": { file: "pin-431.jpg", name: "A monkey with its eyes closed an", kind: "meme", category: "doodle" },
  "pin-432": { file: "pin-432.gif", name: "An image of a cat with a balloon", kind: "doodle", category: "cat" },
  "pin-433": { file: "pin-433.gif", name: "Celebrate Happy Birthday Sticker", kind: "doodle", category: "cat" },
  "pin-434": { file: "pin-434.gif", name: "Birthday Cake", kind: "doodle", category: "celebration" },
  "pin-435": { file: "pin-435.gif", name: "A teddy bear sleeping with heart", kind: "doodle", category: "love" },
  "pin-436": { file: "pin-436.gif", name: "Two cute little animals kissing", kind: "doodle", category: "love" },
  "pin-437": { file: "pin-437.gif", name: "A blurry image of a cat pointing", kind: "doodle", category: "cat" },
  "pin-438": { file: "pin-438.gif", name: "Meow �", kind: "doodle", category: "cat" },
  "pin-439": { file: "pin-439.gif", name: "A couple of teddy bears hugging", kind: "doodle", category: "love" },
  "pin-440": { file: "pin-440.jpg", name: "A brown teddy bear sitting on to", kind: "meme", category: "love" },
  "pin-441": { file: "pin-441.jpg", name: "A white cat with its mouth open", kind: "meme", category: "cat" },
  "pin-442": { file: "pin-442.jpg", name: "Two cats playing with each other", kind: "meme", category: "cat" },
  "pin-443": { file: "pin-443.jpg", name: "A penguin sitting on top of a wo", kind: "meme", category: "love" },
  "pin-444": { file: "pin-444.jpg", name: "Sticker 444", kind: "meme", category: "doodle" },
  "pin-445": { file: "pin-445.jpg", name: "Freaky ahh monkey </3", kind: "meme", category: "doodle" },
  "pin-446": { file: "pin-446.jpg", name: "A monkey making a heart with his", kind: "meme", category: "love" },
  "pin-447": { file: "pin-447.jpg", name: "A young child making a funny fac", kind: "meme", category: "love" },
  "pin-448": { file: "pin-448.png", name: "I love you this much", kind: "doodle", category: "love" },
  "pin-449": { file: "pin-449.jpg", name: "A white dog wearing a blue hat a", kind: "meme", category: "dog" },
  "pin-450": { file: "pin-450.jpg", name: "A man holding a red rose in his", kind: "meme", category: "doodle" },
  "pin-451": { file: "pin-451.jpg", name: "A kitten holding a bouquet of pi", kind: "meme", category: "cat" },
  "pin-452": { file: "pin-452.jpg", name: "Scubaa", kind: "meme", category: "cat" },
  "pin-453": { file: "pin-453.jpg", name: "Kuchu puchu", kind: "meme", category: "cat" },
  "pin-454": { file: "pin-454.jpg", name: "Sowyyyyy", kind: "meme", category: "cat" },
  "pin-455": { file: "pin-455.jpg", name: "A gray and white cat with yellow", kind: "meme", category: "love" },
  "pin-456": { file: "pin-456.jpg", name: "A cat with pink bows on it's hea", kind: "meme", category: "cat" },
  "pin-457": { file: "pin-457.png", name: "A cat is holding a bunch of pink", kind: "doodle", category: "cat" },
} as const satisfies Record<string, { file: string; name: string; kind: "doodle" | "meme"; category: string }>;

export type BoardStickerId = keyof typeof board;
/** A picture the sender uploaded, stored inline in the draft. */
export type UploadedSticker = `data:${string}`;
/** Any sticker: our drawn ones, the board pack, or an upload. */
export type AnyStickerId = StickerId | BoardStickerId | UploadedSticker;

export const boardStickerIds = Object.keys(board) as BoardStickerId[];
export const drawnStickerIds = Object.keys(stickerNames) as StickerId[];

export function isUploadedSticker(id: AnyStickerId): id is UploadedSticker {
  return id.startsWith("data:");
}

/** Bitmap for a board sticker or upload; drawn stickers have none. */
export function stickerImage(id: AnyStickerId) {
  if (isUploadedSticker(id)) return id;
  if (id in board) return `/stickers/board/${board[id as BoardStickerId].file}`;
  return null;
}

export function stickerName(id: AnyStickerId) {
  if (isUploadedSticker(id)) return "Your sticker";
  return id in board ? board[id as BoardStickerId].name : stickerNames[id as StickerId];
}

/** One sticker. Size it with the className (e.g. `size-24`). Unknown ids render nothing. */
export function Sticker({ id, className }: { id: AnyStickerId; className?: string }) {
  if (isUploadedSticker(id)) {
    return (
      <div className={cn("size-24 overflow-hidden rounded-[22%] bg-white p-[6%] shadow-[0_8px_16px_-8px_rgba(42,26,31,0.45)]", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={id} alt="" draggable={false} className="size-full rounded-[16%] object-cover" />
      </div>
    );
  }
  if (id in board) {
    const b = board[id as BoardStickerId];
    return (
      <div
        className={cn(
          "size-24 overflow-hidden bg-white shadow-[0_8px_16px_-8px_rgba(42,26,31,0.45)]",
          b.kind === "doodle" ? "rounded-[28%] p-[6%]" : "rounded-md p-[5%] pb-[12%]",
          className,
        )}
      >
        {/* Small fixed assets; next/image would add a request per size for no gain. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/stickers/board/${b.file}`}
          alt=""
          loading="lazy"
          draggable={false}
          className={cn("size-full", b.kind === "doodle" ? "object-contain" : "rounded-[3px] object-cover")}
        />
      </div>
    );
  }
  const Art = art[id as StickerId];
  if (!Art) return null;
  return (
    <div className={cn("size-24", className)}>
      <Art />
    </div>
  );
}

/* ───────────── Placing stickers around a scene ───────────── */

export type StickerSpot = "tl" | "tr" | "ml" | "mr" | "bl" | "br";
export type StickerPlacement = { id: AnyStickerId; at: StickerSpot; size?: "s" | "m" | "l" };

const spots: Record<StickerSpot, string> = {
  // Phones: hug the edges, clear of the headline. Wider screens: more breathing room.
  tl: "left-[2%] top-[7%] -rotate-[10deg] md:left-[3%] md:top-[13%]",
  tr: "right-[2%] top-[6%] rotate-[8deg] md:right-[3%] md:top-[11%]",
  ml: "left-[1%] top-[46%] -rotate-[6deg] md:left-[2%]",
  mr: "right-[1%] top-[42%] rotate-[10deg] md:right-[2%]",
  bl: "left-[2%] bottom-[14%] rotate-[6deg] md:left-[4%] md:bottom-[13%]",
  br: "right-[2%] bottom-[14%] -rotate-[8deg] md:right-[4%] md:bottom-[12%]",
};

const sizes = { s: "size-14 md:size-20", m: "size-[4.5rem] md:size-28", l: "size-24 md:size-36" };

/** Stickers dotted around the edges of a scene; they pop in one after another. */
export function StickerLayer({ stickers }: { stickers?: StickerPlacement[] }) {
  if (!stickers?.length) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {stickers.map((s, i) => (
        <motion.div
          key={s.at}
          className={cn("absolute", spots[s.at])}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.55, delay: 0.5 + i * 0.15 }}
        >
          <StudioHit field={`sticker-${i}`}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}>
              <Sticker id={s.id} className={sizes[s.size ?? "m"]} />
            </motion.div>
          </StudioHit>
        </motion.div>
      ))}
    </div>
  );
}

/** A reaction that pops up once a page is finished, like a meme sent in the chat. */
export function ReactionSticker({ id, show }: { id?: AnyStickerId; show: boolean }) {
  const studio = useStudioEdit();
  // In the studio it waits in its corner, so it can be tapped and changed like any other sticker.
  if (studio && id) {
    return (
      <div className="fixed bottom-4 right-3 z-30 md:right-8">
        <StudioHit field="reaction">
          <Sticker id={id} className="size-20 md:size-24" />
        </StudioHit>
      </div>
    );
  }
  return (
    <AnimatePresence>
      {id && show && (
        <motion.div
          key={id}
          aria-hidden
          className="pointer-events-none fixed bottom-24 right-3 z-30 md:bottom-28 md:right-8"
          style={{ originX: 1, originY: 1 }}
          initial={{ scale: 0, rotate: -25, y: 40 }}
          animate={{ scale: [0, 1.08, 1, 1, 0.6], rotate: [-25, 8, 6, 6, 4], y: [40, 0, 0, 0, 0] }}
          exit={{ scale: 0, opacity: 0 }}
          // Pops in big, holds a beat, then tucks into the corner so it never covers the page.
          transition={{ duration: 3.2, times: [0, 0.12, 0.18, 0.8, 1], ease: "easeOut", delay: 0.35 }}
        >
          <Sticker id={id} className="size-28 md:size-40" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type StickerCategory = "all" | "love" | "cat" | "meme" | "doodle" | "celebration" | "family" | "animated";

export const stickerCategories = [
  { id: "all", label: "All" },
  { id: "love", label: "❤️ Love" },
  { id: "cat", label: "🐱 Cats & Dogs" },
  { id: "meme", label: "😂 Memes" },
  { id: "doodle", label: "✨ Doodles" },
  { id: "celebration", label: "🎉 Party" },
  { id: "family", label: "👨‍👩‍👧 Family" },
  { id: "animated", label: "✨ Animated" },
] as const;

export function stickerCategory(id: AnyStickerId): string {
  if (id in board) return (board as Record<string, { category?: string }>)[id]?.category || "doodle";
  return "animated";
}
