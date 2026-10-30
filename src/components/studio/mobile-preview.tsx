"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Play } from "lucide-react";

const W = 390;
const H = 844;

/** A live phone in the page flow, so it scrolls with the fields. Taps inside select the matching field below. */
export function MobilePreview({
  frames,
  sceneLabel,
  hidden,
  onPreview,
}: {
  frames: RefObject<Map<string, HTMLIFrameElement>>;
  sceneLabel: string;
  hidden: boolean;
  onPreview: () => void;
}) {
  const phone = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  // The phone's size comes from CSS (below), so the page never shifts while it
  // loads; this only scales the 390px-wide gift inside to fill it.
  useLayoutEffect(() => {
    const el = phone.current;
    if (!el) return;
    const fit = () => {
      const next = el.clientWidth / W;
      if (next > 0) setScale(next);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="bg-[#efe8dc] px-3 pb-2 pt-3">
      <div className="mx-auto w-full">
        <div
          ref={phone}
          data-tour="m-preview"
          // Fits in 56% of the screen height (room for the page switcher and the
          // first field below), never wider than the screen, never above 100%.
          className="relative mx-auto aspect-[390/844] h-[min(56svh,844px,calc((100vw-24px)*2.164))] overflow-hidden rounded-[1.35rem] bg-paper shadow-[0_18px_40px_-24px_rgba(27,18,21,.55)] ring-2 ring-ink/80"
          style={{ opacity: hidden ? 0.55 : 1 }}
        >
          <iframe
            ref={(el) => {
              if (el) frames.current.set("mobile", el);
              else frames.current.delete("mobile");
            }}
            src="/studio/frame"
            allow="autoplay; encrypted-media"
            title={`Live preview, ${sceneLabel}. Tap anything to edit it.`}
            scrolling="no"
            className="absolute left-0 top-0 origin-top-left border-0"
            style={{ width: W, height: H, transform: `scale(${scale})`, visibility: scale ? undefined : "hidden" }}
          />
          {hidden && (
            <p className="pointer-events-none absolute inset-x-0 top-3 text-center text-sm font-medium text-ink">Hidden</p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-3">
        <p className="type-label text-[10px] text-muted">Tap anything to edit it</p>
        <button
          type="button"
          onClick={onPreview}
          data-tour="m-play"
          className="btn btn-ink flex h-7 items-center gap-1.5 px-3 text-xs"
        >
          <Play className="size-3 fill-current" /> Preview
        </button>
      </div>
    </div>
  );
}
