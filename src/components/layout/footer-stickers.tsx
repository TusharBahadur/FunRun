/* eslint-disable @next/next/no-img-element -- tiny local stickers, already sized and compressed */
import type { CSSProperties } from "react";

/** A white die-cut edge and a soft shadow, so every sticker looks stuck on the same way. */
const dieCut: CSSProperties = {
  filter:
    "drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 6px 8px rgb(27 18 21 / 0.18))",
};

const stickers = [
  // Just the flower cat, on every screen size.
  { src: "/a/s/m-flower-cat-cut.webp", className: "size-24 rotate-6 md:size-28" },
];

/** A little cluster of stickers from our own library, for the footer banner. */
export function FooterStickers() {
  return (
    <div aria-hidden className="flex shrink-0 items-center py-2">
      {stickers.map((s) => (
        <img key={s.src} src={s.src} alt="" width={160} height={160} style={dieCut} className={`object-contain ${s.className}`} />
      ))}
    </div>
  );
}
