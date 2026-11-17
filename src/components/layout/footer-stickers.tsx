/* eslint-disable @next/next/no-img-element -- tiny local stickers, already sized and compressed */
import type { CSSProperties } from "react";

/** A white die-cut edge and a soft shadow, so every sticker looks stuck on the same way. */
const dieCut: CSSProperties = {
  filter:
    "drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 6px 8px rgb(27 18 21 / 0.18))",
};

const stickers = [
  { src: "/a/s/pin-343.cb74daa07f.thumb.webp", className: "size-20 -rotate-8 md:size-24" },
  { src: "/a/s/pin-350.b4533d0c02.thumb.webp", className: "-ml-3 size-20 rotate-6 -translate-y-3 md:size-24" },
  { src: "/a/s/b-besties-cut.webp", className: "-ml-2 size-20 -rotate-6 translate-y-1 md:size-24" },
  { src: "/a/s/m-flower-cat-cut.webp", className: "-ml-2 hidden size-20 rotate-6 -translate-y-2 lg:block md:size-24" },
];

/** A little cluster of stickers from our own library, for the footer banner. */
export function FooterStickers() {
  return (
    <div aria-hidden className="flex shrink-0 items-center py-2">
      {stickers.map((s) => (
        <img key={s.src} src={s.src} alt="" width={160} height={160} loading="lazy" style={dieCut} className={`object-contain ${s.className}`} />
      ))}
    </div>
  );
}
