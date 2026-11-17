/* eslint-disable @next/next/no-img-element -- tiny local stickers, already sized and compressed */

/** A few stickers from our own library, stuck on the footer banner. */
export function FooterStickers() {
  return (
    <div aria-hidden className="flex shrink-0 items-end">
      <img
        src="/a/s/pin-305.c959d18603.thumb.webp"
        alt=""
        width={192}
        height={192}
        loading="lazy"
        className="size-20 -rotate-6 rounded-2xl border-4 border-white bg-white object-cover shadow-[0_6px_14px_rgb(27_18_21/0.18)] md:size-24"
      />
      <img
        src="/a/s/b-cake.b9a0e63343.still.webp"
        alt=""
        width={256}
        height={256}
        loading="lazy"
        className="-ml-1 size-20 rotate-6 drop-shadow-[0_6px_8px_rgb(27_18_21/0.2)] md:size-24"
      />
      <img
        src="/a/s/pin-206.892271cedb.thumb.webp"
        alt=""
        width={192}
        height={192}
        loading="lazy"
        className="-ml-2 hidden size-20 -rotate-3 drop-shadow-[0_6px_8px_rgb(27_18_21/0.2)] sm:block md:size-20"
      />
    </div>
  );
}
