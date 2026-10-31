"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import memeIds from "@/data/sticker-memes.json";
import stickerHashes from "@/data/sticker-hashes.json";
import stickerStills from "@/data/sticker-stills.json";
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

/*
 * Image stickers live in src/data/stickers.json (name, kind, category, source
 * file in assets/stickers/). `npm run assets` turns each source into a WebP
 * named by its content fingerprint: public/a/s/<id>.<hash>.webp.
 *
 * Rules that keep published gifts unchanged:
 * - A published gift stores "<id>@<hash>", so it keeps the exact image it was
 *   made with even after you replace the source file (that makes a new hash).
 * - Old WebP files are never deleted.
 * - Never delete or rename an id: set "retired": true to hide it from the picker.
 * - Drawn stickers (above) are code, so never redraw one in place: add a new id
 *   (e.g. "cat2") and retire the old one by removing it from `drawnStickerIds`.
 */

// Only what's needed to draw a board sticker: its current image version, and
// whether it's a meme (framed like a photo) or a doodle. Names and categories
// live in ./sticker-catalog, which only the studio's picker loads.
const boardHashes = stickerHashes as Record<string, string>;
const memes = new Set(memeIds as string[]);
/** Animated stickers ("<id>.<hash>") that also have a small first-frame still. */
const stills = new Set(stickerStills as string[]);

export type BoardStickerId = string;
/** A picture the sender uploaded: inline in the draft, or a link once the gift is published. */
export type UploadedSticker = `data:${string}` | `https://${string}`;
/** Any sticker: our drawn ones, the board pack (optionally pinned "id@hash"), or an upload. */
export type AnyStickerId = StickerId | BoardStickerId | UploadedSticker;

/** How many board stickers there are (the full list lives in ./sticker-catalog). */
export const boardStickerCount = Object.keys(boardHashes).length;
export const drawnStickerIds = Object.keys(stickerNames) as StickerId[];

export function isUploadedSticker(id: AnyStickerId): id is UploadedSticker {
  return id.startsWith("data:") || id.startsWith("https://");
}

/** A board sticker, live ("pin-149": today's image) or pinned ("pin-149@3fa9c1ab0d": one exact image). */
export function boardRef(id: string) {
  const at = id.indexOf("@");
  const key = at < 0 ? id : id.slice(0, at);
  const hash = at < 0 ? boardHashes[key] : id.slice(at + 1);
  if (!hash || !/^[0-9a-f]{10}$/.test(hash)) return null;
  if (at < 0 && !(key in boardHashes)) return null;
  return { key, hash, kind: memes.has(key) ? ("meme" as const) : ("doodle" as const) };
}

/** Pins a board sticker to the image it shows right now. Anything else is returned as is. */
export function pinSticker(id: string) {
  if (id.includes("@") || !(id in boardHashes)) return id;
  const hash = boardHashes[id];
  return hash ? `${id}@${hash}` : id;
}

export function isBoardSticker(id: string) {
  return !isUploadedSticker(id) && boardRef(id) !== null;
}

/** Bitmap for a board sticker or upload; drawn stickers have none. */
export function stickerImage(id: AnyStickerId) {
  if (isUploadedSticker(id)) return id;
  const ref = boardRef(id);
  return ref ? `/a/s/${ref.key}.${ref.hash}.webp` : null;
}

/**
 * One sticker. Size it with the className (e.g. `size-24`). Unknown ids render nothing.
 * `still` shows the first frame of an animated sticker (a few KB instead of up to
 * 300 KB): for thumbnails and pickers, never inside a gift.
 */
export function Sticker({ id, className, still }: { id: AnyStickerId; className?: string; still?: boolean }) {
  if (isUploadedSticker(id)) {
    return (
      <div className={cn("size-24 overflow-hidden rounded-[22%] bg-white p-[6%] shadow-[0_8px_16px_-8px_rgba(42,26,31,0.45)]", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={id} alt="" draggable={false} className="size-full rounded-[16%] object-cover" />
      </div>
    );
  }
  const ref = boardRef(id);
  if (ref) {
    const doodle = ref.kind === "doodle";
    return (
      <div
        className={cn(
          "size-24 overflow-hidden bg-white shadow-[0_8px_16px_-8px_rgba(42,26,31,0.45)]",
          doodle ? "rounded-[28%] p-[6%]" : "rounded-md p-[5%] pb-[12%]",
          className,
        )}
      >
        {/* Small fixed assets; next/image would add a request per size for no gain. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/a/s/${ref.key}.${ref.hash}${still && stills.has(`${ref.key}.${ref.hash}`) ? ".still" : ""}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className={cn("size-full", doodle ? "object-contain" : "rounded-[3px] object-cover")}
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
      {/* On wide screens the corners are measured from a centred box, not the
          whole window, so stickers stay close to the page's content. */}
      <div className="relative mx-auto h-full w-full md:max-w-[60rem]">
      {stickers.map((s, i) => (
        <motion.div
          key={s.at}
          className={cn("absolute", spots[s.at])}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.55, delay: 0.5 + i * 0.15 }}
        >
          <StudioHit field={`sticker-${i}`}>
            {/* CSS loop (GPU), not a JavaScript one: this layer is on almost every gift page. */}
            <div className="tt-loop" style={{ animation: `tt-float-y ${3 + i * 0.4}s ease-in-out infinite` }}>
              <Sticker id={s.id} className={sizes[s.size ?? "m"]} />
            </div>
          </StudioHit>
        </motion.div>
      ))}
      </div>
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
