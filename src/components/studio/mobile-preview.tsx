"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const W = 390;
const H = 844;

/** A live phone in the page flow, so it scrolls with the fields instead of sitting in its own pane. */
export function MobilePreview({
  frames,
  sceneLabel,
  hidden,
}: {
  frames: RefObject<Map<string, HTMLIFrameElement>>;
  sceneLabel: string;
  hidden: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.85);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const next = el.clientWidth / W;
      if (next > 0) setScale(Math.min(next, 1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="border-b border-line bg-[#efe8dc] px-3 py-4">
      <div ref={box} className="mx-auto w-full">
        <div
          className="relative mx-auto overflow-hidden rounded-[1.35rem] bg-paper shadow-[0_18px_40px_-24px_rgba(27,18,21,.55)] ring-2 ring-ink/80"
          style={{ width: W * scale, height: H * scale, opacity: hidden ? 0.55 : 1 }}
        >
          {/* Touches pass through so the page scroll moves the phone with the fields. */}
          <iframe
            ref={(el) => {
              if (el) frames.current.set("mobile", el);
              else frames.current.delete("mobile");
            }}
            src="/studio/frame"
            title={`Live preview, ${sceneLabel}`}
            scrolling="no"
            className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
            style={{ width: W, height: H, transform: `scale(${scale})` }}
          />
          {hidden && (
            <p className="pointer-events-none absolute inset-x-0 top-3 text-center text-sm font-medium text-ink">Hidden</p>
          )}
        </div>
      </div>
    </div>
  );
}
