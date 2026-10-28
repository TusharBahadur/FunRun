"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { SceneType, StoryPalette } from "@/components/story/types";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { categoryOrder, sceneSchemas, type SceneCategory } from "./schema";

const allTypes = (Object.keys(sceneSchemas) as SceneType[]).filter((t) => t !== "finale");

/** The section library: every mini-game, grouped like a design tool's insert menu. */
export function AddSection({
  open,
  onClose,
  onPick,
  afterLabel,
  palette,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: SceneType) => void;
  afterLabel: string;
  palette: StoryPalette;
}) {
  const [cat, setCat] = useState<SceneCategory | "All">("All");
  const shown = allTypes.filter((t) => cat === "All" || sceneSchemas[t].category === cat);

  return (
    <Sheet open={open} onClose={onClose} label="Add section" scroll={false} width="w-[min(96vw,980px)]" className="h-[88svh] sm:h-[min(86vh,680px)]">
            <div className="flex items-start justify-between border-b border-line px-6 py-4">
              <div>
                <p className="font-semibold">Add section</p>
                <p className="text-xs text-muted">Inserted after {afterLabel}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-lg hover:bg-paper">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1">
              <nav className="hidden w-48 shrink-0 space-y-0.5 border-r border-line p-3 sm:block">
                {(["All", ...categoryOrder] as const).map((c) => {
                  const n = c === "All" ? allTypes.length : allTypes.filter((t) => sceneSchemas[t].category === c).length;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCat(c)}
                      className={cn("flex w-full justify-between rounded-lg px-3 py-2 text-left text-sm", cat === c ? "bg-paper font-medium" : "text-muted hover:text-ink")}
                    >
                      {c === "All" ? "All sections" : c}
                      <span className="text-xs opacity-60">{n}</span>
                    </button>
                  );
                })}
              </nav>
              <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {shown.map((t) => {
                    const s = sceneSchemas[t];
                    const Icon = s.icon;
                    return (
                      <button key={t} type="button" onClick={() => onPick(t)} className="group text-left">
                        <span
                          className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl transition-transform group-hover:-translate-y-0.5"
                          style={{ backgroundColor: palette.bg, color: palette.accent }}
                        >
                          <span className="absolute -right-6 -top-6 size-24 rounded-full opacity-40" style={{ backgroundColor: palette.pink }} />
                          <span className="relative grid size-16 place-items-center rounded-2xl shadow-sm" style={{ backgroundColor: palette.cream }}>
                            <Icon className="size-7" strokeWidth={1.6} />
                          </span>
                          <span className="type-label absolute bottom-2 left-3 text-[9px]" style={{ color: palette.fg, opacity: 0.6 }}>
                            {s.category}
                          </span>
                        </span>
                        <span className="mt-2 block text-sm font-medium">{s.name}</span>
                        <span className="block text-xs leading-snug text-muted">{s.blurb}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
    </Sheet>
  );
}
