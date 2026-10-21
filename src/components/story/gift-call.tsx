"use client";

import { Phone } from "lucide-react";
import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StudioHit, useStory } from "./scene-kit";
import { Sticker, stickerImage, type AnyStickerId, type StickerPlacement, type StickerSpot } from "./stickers";
import type { StoryPalette } from "./types";

const PICKUP = "#3dcf7a";
export const DEFAULT_CALLER: AnyStickerId = "m-scream-cat";
export const DEFAULT_PARTY: AnyStickerId = "m-dance-cat";

const PHONE_SPOTS: Record<StickerSpot, string> = {
  tl: "-left-8 -top-4 size-14 -rotate-12",
  tr: "-right-7 top-10 size-12 rotate-12",
  ml: "-left-9 top-[38%] size-14 -rotate-6",
  mr: "-right-9 top-[36%] size-14 rotate-8",
  bl: "-left-6 bottom-16 size-16 -rotate-6",
  br: "-right-8 bottom-8 size-[4.5rem] rotate-12",
};

function shell(palette: StoryPalette) {
  return {
    background: `linear-gradient(165deg, ${palette.cream} 8%, ${palette.pink} 92%)`,
    boxShadow: "0 28px 48px -24px rgba(27,18,21,0.5), inset 0 1px 0 rgba(255,255,255,0.75)",
  };
}

function ScreenFill({ id, fit }: { id: AnyStickerId; fit: "cover" | "contain" }) {
  const src = stickerImage(id);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        draggable={false}
        className={
          fit === "cover"
            ? "absolute inset-0 size-full object-cover"
            : "absolute left-1/2 top-[38%] h-[78%] w-[90%] -translate-x-1/2 -translate-y-1/2 object-contain"
        }
      />
    );
  }
  return (
    <span
      className={
        fit === "cover"
          ? "absolute inset-0 grid place-items-center p-6"
          : "absolute left-1/2 top-[38%] size-[70%] -translate-x-1/2 -translate-y-1/2"
      }
    >
      <Sticker id={id} className="size-full" />
    </span>
  );
}

/**
 * Incoming-call phone used in knock scenes and gallery peeks.
 * The screen is stickers and gifs — pick up, then the party’s on the line.
 */
export function CallArt({
  palette,
  className,
  caller = DEFAULT_CALLER,
}: {
  palette: StoryPalette;
  className?: string;
  caller?: AnyStickerId;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="rounded-[22%] p-[7%] pb-[9%] pt-[8%]" style={shell(palette)}>
        <span className="mx-auto mb-[8%] block h-[4%] w-[38%] rounded-full" style={{ backgroundColor: `${palette.ink}28` }} />
        <div className="relative aspect-[9/15] overflow-hidden rounded-[16%]" style={{ backgroundColor: palette.cream }}>
          <ScreenFill id={caller} fit="cover" />
        </div>
      </div>
    </div>
  );
}

export function GiftCall({
  open,
  shake,
  onKnock,
  knocks,
  total,
  reveal,
  caller = DEFAULT_CALLER,
  party = DEFAULT_PARTY,
  stickers,
}: {
  open: boolean;
  shake: number;
  onKnock: () => void;
  knocks: number;
  total: number;
  reveal: ReactNode;
  caller?: AnyStickerId;
  party?: AnyStickerId;
  stickers?: StickerPlacement[];
}) {
  const { palette } = useStory();
  const uid = useId().replace(/:/g, "");

  return (
    <div className="relative mx-auto w-[min(64vw,228px)]">
      {stickers?.map((s, i) => (
        <PhoneSticker key={`${s.at}-${i}`} placement={s} index={i} delay={0.08 + i * 0.12} />
      ))}

      <motion.div
        className="relative"
        animate={!open && shake ? { rotate: [0, -7, 7, -5, 5, 0], y: [0, -6, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.42 }}
        key={open ? "up" : `r${shake}`}
      >
        <div className="rounded-[2.15rem] p-[9px] pt-[11px]" style={shell(palette)}>
          <span aria-hidden className="mx-auto mb-2 block h-1.5 w-14 rounded-full" style={{ backgroundColor: `${palette.ink}28` }} />
          <div className="relative aspect-[9/15.4] overflow-hidden rounded-[1.55rem]" style={{ backgroundColor: palette.cream }}>
            {open ? (
              <div className="absolute inset-0">
                <StudioHit field="party" className="absolute inset-0 block">
                  <ScreenFill id={party} fit="contain" />
                </StudioHit>
                <div className="absolute inset-x-2.5 bottom-3 z-[1]">
                  <div
                    className="rounded-2xl px-3 py-2.5 text-center shadow-nav"
                    style={{ backgroundColor: palette.cream, color: palette.ink, rotate: "-2deg" }}
                  >
                    {reveal}
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onKnock}
                aria-label={`Pick up (${knocks} of ${total})`}
                className="absolute inset-0 outline-none"
              >
                <StudioHit field="caller" as="span" className="absolute inset-0 block">
                  <ScreenFill id={caller} fit="cover" />
                </StudioHit>
                <span className="absolute inset-x-0 bottom-4 z-[1] grid place-items-center">
                  <span className="relative grid size-[3.35rem] place-items-center">
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${PICKUP}` }}
                      animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    />
                    <span className="relative grid size-full place-items-center rounded-full" style={{ backgroundColor: PICKUP }}>
                      <Phone className="size-6 text-paper" strokeWidth={2.4} />
                    </span>
                  </span>
                </span>
              </button>
            )}
          </div>
          <span aria-hidden className="mx-auto mt-2.5 block h-1 w-10 rounded-full" style={{ backgroundColor: `${palette.ink}22` }} />
        </div>
      </motion.div>

      <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span key={`${uid}-${i}`} className="block size-7">
            <Sticker id="heart" className={cn("size-7", i >= knocks && "opacity-25")} />
          </span>
        ))}
      </div>
    </div>
  );
}

function PhoneSticker({ placement, index, delay }: { placement: StickerPlacement; index: number; delay: number }) {
  return (
    <motion.div
      className={cn("absolute z-10", PHONE_SPOTS[placement.at])}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
      transition={{
        scale: { type: "spring", bounce: 0.55, delay },
        opacity: { duration: 0.3, delay },
        y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      <StudioHit field={`sticker-${index}`}>
        <Sticker id={placement.id} className="size-full" />
      </StudioHit>
    </motion.div>
  );
}
