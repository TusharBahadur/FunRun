"use client";

import { EyeOff, Hand, Minus, MousePointer2, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { capturePointer } from "@/components/story/scene-kit";
import { cn } from "@/lib/utils";

export const DEVICES = [
  { id: "phone", label: "Phone", w: 390, h: 844 },
  { id: "tablet", label: "Tablet", w: 768, h: 1024 },
  { id: "desktop", label: "Desktop", w: 1280, h: 800 },
] as const;

export type DeviceMode = "phone" | "desktop" | "all";

/**
 * The studio canvas: live artboards at real device sizes, with zoom and pan.
 * Each artboard is an iframe so its layout matches the real device width.
 */
export function Canvas({
  frames,
  device,
  setDevice,
  sceneLabel,
  hidden,
  onReplay,
}: {
  frames: RefObject<Map<string, HTMLIFrameElement>>;
  device: DeviceMode;
  setDevice: (d: DeviceMode) => void;
  sceneLabel: string;
  hidden: boolean;
  onReplay: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.7);
  const [tool, setTool] = useState<"select" | "hand">("select");
  const [space, setSpace] = useState(false);
  const panning = tool === "hand" || space;
  const drag = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);

  const shown = useMemo(() => (device === "all" ? [...DEVICES] : DEVICES.filter((d) => d.id === device)), [device]);

  const fit = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const pad = 120;
    const totalW = shown.reduce((a, d) => a + d.w, 0) + (shown.length - 1) * 60;
    const maxH = Math.max(...shown.map((d) => d.h));
    setZoom(Math.max(0.15, Math.min(1, (el.clientWidth - pad) / totalW, (el.clientHeight - pad - 40) / maxH)));
  }, [shown]);

  // Re-fit whenever the set of artboards changes.
  useEffect(() => {
    fit();
  }, [device, fit]);

  // Ctrl/⌘ + scroll zooms, like design tools.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => Math.min(2, Math.max(0.1, z * (1 - e.deltaY * 0.0025))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Hold space to pan.
  useEffect(() => {
    const typing = () => /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName ?? "");
    const down = (e: KeyboardEvent) => e.code === "Space" && !typing() && (e.preventDefault(), setSpace(true));
    const up = (e: KeyboardEvent) => e.code === "Space" && setSpace(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scroller}
        data-lenis-prevent
        className={cn("absolute inset-0 overflow-auto", panning && "cursor-grab active:cursor-grabbing")}
        style={{ backgroundImage: "radial-gradient(rgba(27,18,21,.10) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      >
        <div className="relative flex w-max min-w-full items-start justify-center gap-[60px] p-[60px] pb-[120px]">
          {shown.map((d) => (
            <div key={d.id} className="shrink-0">
              <div className="mb-2 flex items-center gap-2 text-[11px]" style={{ width: d.w * zoom }}>
                <span className="type-label rounded-md bg-paper px-2 py-0.5 text-[10px] text-muted">
                  {d.label} <span className="opacity-50">{d.w}</span>
                </span>
                <span className="type-label truncate rounded-md bg-ink px-2 py-0.5 text-[10px] text-paper">{sceneLabel}</span>
                {hidden && (
                  <span className="type-label flex items-center gap-1 rounded-md bg-line px-2 py-0.5 text-[10px] text-muted">
                    <EyeOff className="size-3" /> Hidden
                  </span>
                )}
              </div>
              <div
                className="relative overflow-hidden rounded-[18px] bg-paper shadow-[0_30px_60px_-30px_rgba(27,18,21,.45)] ring-2 ring-ink/80"
                style={{ width: d.w * zoom, height: d.h * zoom }}
              >
                <iframe
                  ref={(el) => {
                    if (el) frames.current.set(d.id, el);
                    else frames.current.delete(d.id);
                  }}
                  src="/studio/frame"
                  title={`${d.label} artboard`}
                  className="absolute left-0 top-0 origin-top-left border-0"
                  style={{ width: d.w, height: d.h, transform: `scale(${zoom})`, opacity: hidden ? 0.55 : 1 }}
                />
              </div>
            </div>
          ))}
          {/* While panning, a sheet over the artboards catches the drag instead of the iframes. */}
          {panning && (
            <div
              className="absolute inset-0"
              onPointerDown={(e) => {
                const el = scroller.current!;
                drag.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
                capturePointer(e);
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                const el = scroller.current!;
                el.scrollLeft = drag.current.sl - (e.clientX - drag.current.x);
                el.scrollTop = drag.current.st - (e.clientY - drag.current.y);
              }}
              onPointerUp={() => (drag.current = null)}
            />
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-line bg-paper/95 p-1.5 text-sm shadow-nav backdrop-blur">
        <ToolButton active={tool === "select"} label="Select and play (V)" onClick={() => setTool("select")}>
          <MousePointer2 className="size-4" />
        </ToolButton>
        <ToolButton active={tool === "hand"} label="Pan (H, or hold space)" onClick={() => setTool("hand")}>
          <Hand className="size-4" />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-line" />
        <ToolButton label="Zoom out" onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}>
          <Minus className="size-4" />
        </ToolButton>
        <button type="button" onClick={fit} className="w-14 rounded-lg py-1.5 text-center text-xs tabular-nums hover:bg-cream" title="Zoom to fit">
          {Math.round(zoom * 100)}%
        </button>
        <ToolButton label="Zoom in" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
          <Plus className="size-4" />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-line" />
        {(["phone", "desktop", "all"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setDevice(m)}
            className={cn("rounded-lg px-3 py-1.5 text-xs", device === m ? "bg-ink text-paper" : "text-muted hover:bg-cream")}
          >
            {m === "all" ? "All sizes" : m[0].toUpperCase() + m.slice(1)}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-line" />
        <ToolButton label="Replay this page" onClick={onReplay}>
          <RotateCcw className="size-4" />
        </ToolButton>
      </div>
    </div>
  );
}

function ToolButton({ active, label, onClick, children }: { active?: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn("grid size-8 place-items-center rounded-lg", active ? "bg-ink text-paper" : "text-ink/70 hover:bg-cream")}
    >
      {children}
    </button>
  );
}
