"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";
import { imageToDataUrl } from "./draft-store";

export type AspectId = "free" | "1:1" | "4:5" | "3:2" | "9:16";

const ASPECTS: { id: AspectId; label: string; ratio: number | null }[] = [
  { id: "free", label: "Original", ratio: null },
  { id: "1:1", label: "Square", ratio: 1 },
  { id: "4:5", label: "Portrait", ratio: 4 / 5 },
  { id: "3:2", label: "Landscape", ratio: 3 / 2 },
  { id: "9:16", label: "Story", ratio: 9 / 16 },
];

type CropOpts = {
  maxSide?: number;
  type?: "image/jpeg" | "image/webp";
  aspect?: AspectId;
};

type Job = {
  file: File;
  maxSide: number;
  type: "image/jpeg" | "image/webp";
  aspect: AspectId;
  resolve: (url: string | null) => void;
};

const ImageCropContext = createContext<(file: File, opts?: CropOpts) => Promise<string | null>>(
  (file, opts) => imageToDataUrl(file, opts?.maxSide, opts?.type),
);

export function useImageCrop() {
  return useContext(ImageCropContext);
}

/** Lets any studio upload open the cropper, one photo at a time. */
export function ImageCropProvider({ children }: { children: React.ReactNode }) {
  const queue = useRef<Job[]>([]);
  const [job, setJob] = useState<Job | null>(null);

  const kick = useCallback(() => {
    setJob((current) => current ?? queue.current.shift() ?? null);
  }, []);

  const crop = useCallback((file: File, opts?: CropOpts) => {
    return new Promise<string | null>((resolve) => {
      queue.current.push({
        file,
        maxSide: opts?.maxSide ?? 1100,
        type: opts?.type ?? "image/jpeg",
        aspect: opts?.aspect ?? "free",
        resolve,
      });
      kick();
    });
  }, [kick]);

  function finish(url: string | null) {
    job?.resolve(url);
    setJob(null);
  }

  useEffect(() => {
    if (!job) kick();
  }, [job, kick]);

  return (
    <ImageCropContext.Provider value={crop}>
      {children}
      <CropDialog
        key={job ? job.file.name + job.file.size + job.file.lastModified : "idle"}
        job={job}
        onDone={finish}
      />
    </ImageCropContext.Provider>
  );
}

/** Hidden file input that crops each chosen photo before handing it back. */
export function FileCropInput({
  className = "sr-only",
  multiple,
  disabled,
  maxSide,
  type = "image/jpeg",
  aspect,
  onDone,
}: {
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxSide?: number;
  type?: "image/jpeg" | "image/webp";
  aspect?: AspectId;
  onDone: (urls: string[]) => void;
}) {
  const crop = useImageCrop();
  return (
    <input
      type="file"
      accept="image/*"
      multiple={multiple}
      disabled={disabled}
      className={className}
      onChange={async (e) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        const urls: string[] = [];
        for (const file of files) {
          const url = await crop(file, { maxSide, type, aspect });
          if (url) urls.push(url);
        }
        if (urls.length) onDone(urls);
      }}
    />
  );
}

function CropDialog({ job, onDone }: { job: Job | null; onDone: (url: string | null) => void }) {
  return (
    <AnimatePresence>
      {job && <Dialog job={job} onDone={onDone} />}
    </AnimatePresence>
  );
}

function Dialog({ job, onDone }: { job: Job; onDone: (url: string | null) => void }) {
  const stageRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLCanvasElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const applyZoomRef = useRef<(z: number) => void>(() => {});

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspect, setAspect] = useState<AspectId>(job.aspect);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState({ w: 0, h: 0 });

  const layout = ready && source.current && stage.w > 0
    ? cropLayout(source.current.width, source.current.height, stage.w, stage.h, aspect, zoom, pan)
    : null;

  useEffect(() => {
    let gone = false;
    (async () => {
      try {
        const bitmap = await createImageBitmap(job.file);
        if (gone) {
          bitmap.close();
          return;
        }
        const c = document.createElement("canvas");
        c.width = bitmap.width;
        c.height = bitmap.height;
        c.getContext("2d")!.drawImage(bitmap, 0, 0);
        bitmap.close();
        source.current = c;
        setReady(true);
      } catch {
        if (!gone) setError("Couldn't read that photo. Try another one.");
      }
    })();
    return () => {
      gone = true;
    };
  }, [job.file]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ready]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDone(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  useEffect(() => {
    const canvas = stageRef.current;
    const src = source.current;
    if (!canvas || !src || !layout) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(stage.w * dpr);
    canvas.height = Math.round(stage.h * dpr);
    canvas.style.width = `${stage.w}px`;
    canvas.style.height = `${stage.h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintStage(ctx, src, layout, stage.w, stage.h);
  }, [layout, stage.h, stage.w]);

  function applyPan(next: { x: number; y: number }, nextZoom = zoomRef.current) {
    const src = source.current;
    if (!src || stage.w === 0) return;
    const L = cropLayout(src.width, src.height, stage.w, stage.h, aspect, nextZoom, next);
    panRef.current = { x: L.panX, y: L.panY };
    setPan(panRef.current);
  }

  function applyZoom(nextZoom: number) {
    const z = Math.min(4, Math.max(1, nextZoom));
    zoomRef.current = z;
    setZoom(z);
    applyPan(panRef.current, z);
  }
  applyZoomRef.current = applyZoom;

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !ready) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyZoomRef.current(zoomRef.current * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ready]);

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: zoomRef.current };
      drag.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY, panX: panRef.current.x, panY: panRef.current.y };
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      applyZoom(pinch.current.zoom * (dist / Math.max(1, pinch.current.dist)));
      return;
    }
    if (drag.current) {
      applyPan({
        x: drag.current.panX + (e.clientX - drag.current.x),
        y: drag.current.panY + (e.clientY - drag.current.y),
      });
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  }

  function confirm() {
    const src = source.current;
    if (!src || !layout) return;
    const scale = layout.displayW / src.width;
    const sx = (layout.cropX - layout.dx) / scale;
    const sy = (layout.cropY - layout.dy) / scale;
    const sw = layout.cw / scale;
    const sh = layout.ch / scale;
    const outScale = Math.min(1, job.maxSide / Math.max(sw, sh));
    const out = document.createElement("canvas");
    out.width = Math.max(1, Math.round(sw * outScale));
    out.height = Math.max(1, Math.round(sh * outScale));
    out.getContext("2d")!.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);
    onDone(out.toDataURL(job.type, 0.82));
  }

  return (
    <motion.div
      className="fixed inset-0 z-[110] flex items-end justify-center p-3 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => onDone(null)} />
      <motion.div
        role="dialog"
        aria-modal
        aria-labelledby="crop-title"
        className="relative flex h-[min(92vh,740px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-cream shadow-float"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5">
          <div>
            <p id="crop-title" className="font-semibold">Crop photo</p>
            <p className="text-xs text-muted">Drag to move · pinch or scroll to zoom</p>
          </div>
          <button type="button" onClick={() => onDone(null)} aria-label="Cancel crop" className="grid size-9 place-items-center rounded-lg hover:bg-paper">
            <X className="size-4" />
          </button>
        </div>

        <div ref={wrapRef} className="relative min-h-0 flex-1 bg-ink">
          {error ? (
            <p className="grid size-full place-items-center px-6 text-center text-sm text-paper">{error}</p>
          ) : (
            <canvas
              ref={stageRef}
              className="absolute inset-0 size-full touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          )}
        </div>

        <div className="space-y-3 px-5 py-4">
          <div className="flex flex-wrap gap-1.5">
            {ASPECTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setAspect(a.id);
                  panRef.current = { x: 0, y: 0 };
                  setPan({ x: 0, y: 0 });
                }}
                className={cn(
                  "h-8 rounded-full px-3 text-sm",
                  aspect === a.id ? "bg-ink text-paper" : "border border-line hover:bg-paper",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-xs text-muted">
            <span className="w-10 shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => applyZoom(Number(e.target.value))}
              className="h-8 w-full accent-rose-deep"
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => onDone(null)} className="h-11 flex-1 rounded-full border border-line text-sm font-medium hover:bg-paper">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!layout || !!error}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-rose-deep text-sm font-medium text-paper hover:bg-rose disabled:opacity-40"
            >
              <Check className="size-4" /> Use photo
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

type Layout = {
  cropX: number;
  cropY: number;
  cw: number;
  ch: number;
  dx: number;
  dy: number;
  displayW: number;
  displayH: number;
  panX: number;
  panY: number;
};

function cropLayout(
  imgW: number,
  imgH: number,
  stageW: number,
  stageH: number,
  aspectId: AspectId,
  zoom: number,
  pan: { x: number; y: number },
): Layout {
  const pad = 28;
  const maxW = Math.max(80, stageW - pad * 2);
  const maxH = Math.max(80, stageH - pad * 2);
  const chosen = ASPECTS.find((a) => a.id === aspectId)?.ratio ?? null;
  const ratio = chosen ?? imgW / imgH;
  let cw: number;
  let ch: number;
  if (maxW / maxH > ratio) {
    ch = maxH;
    cw = ch * ratio;
  } else {
    cw = maxW;
    ch = cw / ratio;
  }
  const cropX = (stageW - cw) / 2;
  const cropY = (stageH - ch) / 2;
  const z = Math.min(4, Math.max(1, zoom));
  const cover = Math.max(cw / imgW, ch / imgH);
  const displayW = imgW * cover * z;
  const displayH = imgH * cover * z;
  const maxPanX = Math.max(0, (displayW - cw) / 2);
  const maxPanY = Math.max(0, (displayH - ch) / 2);
  const panX = Math.min(maxPanX, Math.max(-maxPanX, pan.x));
  const panY = Math.min(maxPanY, Math.max(-maxPanY, pan.y));
  const dx = cropX + cw / 2 - displayW / 2 + panX;
  const dy = cropY + ch / 2 - displayH / 2 + panY;
  return { cropX, cropY, cw, ch, dx, dy, displayW, displayH, panX, panY };
}

function paintStage(
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  layout: Layout,
  stageW: number,
  stageH: number,
) {
  ctx.clearRect(0, 0, stageW, stageH);
  ctx.fillStyle = "#1b1215";
  ctx.fillRect(0, 0, stageW, stageH);
  ctx.globalAlpha = 0.38;
  ctx.drawImage(src, layout.dx, layout.dy, layout.displayW, layout.displayH);
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.beginPath();
  ctx.rect(layout.cropX, layout.cropY, layout.cw, layout.ch);
  ctx.clip();
  ctx.drawImage(src, layout.dx, layout.dy, layout.displayW, layout.displayH);
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 2;
  ctx.strokeRect(layout.cropX + 1, layout.cropY + 1, layout.cw - 2, layout.ch - 2);
}
