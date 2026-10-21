"use client";

import { Reorder } from "motion/react";
import { ChevronRight, Eye, EyeOff, GripVertical, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Scene } from "@/components/story/types";
import { cn } from "@/lib/utils";
import { imageToDataUrl, type Draft } from "./draft-store";
import { showNames, type Selection } from "./inspector";
import { isLook, LOOK } from "./look";
import { deleteSelected, readItems, setScenes, updateScene } from "./ops";
import { childField, sceneSchemas, sceneSubtitle } from "./schema";

type Edit = (next: Draft, tag?: string) => void;

// Stable keys for drag-and-drop: one per scene object, kept outside React state.
const keys = new WeakMap<Scene, number>();
let nextKey = 0;
function sceneKey(scene: Scene) {
  if (!keys.has(scene)) keys.set(scene, nextKey++);
  return keys.get(scene)!;
}

export function LeftPanel({
  draft,
  sel,
  setSel,
  edit,
  onAddSection,
}: {
  draft: Draft;
  sel: Selection;
  setSel: (s: Selection) => void;
  edit: Edit;
  onAddSection: () => void;
}) {
  const [tab, setTab] = useState<"layers" | "assets">("layers");
  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-line bg-cream">
      <div className="flex gap-1 p-2">
        {(["layers", "assets"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn("rounded-lg px-3 py-1.5 text-sm capitalize", tab === t ? "bg-paper font-medium shadow-sm" : "text-muted hover:text-ink")}
          >
            {t}
          </button>
        ))}
      </div>
      <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {tab === "layers" ? <Layers draft={draft} sel={sel} setSel={setSel} edit={edit} /> : <Assets draft={draft} edit={edit} />}
      </div>
      {tab === "layers" && (
        <div className="border-t border-line p-2">
          <button type="button" onClick={onAddSection} className="flex w-full items-center justify-center gap-2 rounded-xl bg-paper py-2.5 text-sm font-medium hover:bg-white">
            <Plus className="size-4" /> Add section
          </button>
        </div>
      )}
    </aside>
  );
}

function Layers({ draft, sel, setSel, edit }: { draft: Draft; sel: Selection; setSel: (s: Selection) => void; edit: Edit }) {
  const scenes = draft.story.scenes;
  const [open, setOpen] = useState<Set<number>>(new Set());


  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setSel({ scene: LOOK, item: null, field: null })}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm",
          isLook(sel.scene) ? "bg-paper font-medium shadow-sm" : "hover:bg-paper/60",
        )}
      >
        <span className="grid size-6 place-items-center rounded-md bg-cream text-[10px] font-semibold">Aa</span>
        <span>Look</span>
        <span className="truncate text-xs font-normal text-muted">Theme, names & font</span>
      </button>
      <Reorder.Group
        axis="y"
        values={scenes}
        onReorder={(next: Scene[]) => {
          const selected = sel.scene !== null ? scenes[sel.scene] : null;
          edit(setScenes(draft, next));
          if (selected) setSel({ scene: next.indexOf(selected), item: null, field: null });
        }}
        className="space-y-0.5"
      >
        {scenes.map((scene, i) => {
          const schema = sceneSchemas[scene.type];
          const Icon = schema.icon;
          const list = childField(scene.type);
          const items = list ? readItems(scene, list.key) : [];
          const stickers = scene.stickers ?? [];
          const hasKids = items.length > 0 || stickers.length > 0;
          const expanded = open.has(i) || (sel.scene === i && (sel.item !== null || !!sel.field?.startsWith("sticker-")));
          const active = sel.scene === i;
          return (
            <Reorder.Item key={sceneKey(scene)} value={scene} className="group list-none">
              <div
                className={cn(
                  "flex items-center gap-1 rounded-lg px-1 py-1 text-sm",
                  active ? "bg-paper font-medium shadow-sm" : "hover:bg-paper/60",
                  scene.hidden && "opacity-50",
                )}
              >
                <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted opacity-0 group-hover:opacity-100" />
                <button
                  type="button"
                  aria-label={expanded ? "Collapse" : "Expand"}
                  onClick={() => setOpen((o) => (o.has(i) ? new Set([...o].filter((x) => x !== i)) : new Set([...o, i])))}
                  className={cn("grid size-5 place-items-center text-muted", !hasKids && "invisible")}
                >
                  <ChevronRight className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
                </button>
                <button type="button" onClick={() => setSel({ scene: i, item: null, field: null })} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <Icon className="size-4 shrink-0 text-ink/70" />
                  <span className="shrink-0">{schema.name}</span>
                  <span className="truncate text-xs font-normal text-muted">{showNames(sceneSubtitle(scene), draft.story)}</span>
                </button>
                <button
                  type="button"
                  aria-label={scene.hidden ? "Show page" : "Hide page"}
                  onClick={() => edit(updateScene(draft, i, { hidden: !scene.hidden }))}
                  className={cn("grid size-6 place-items-center text-muted hover:text-ink", !scene.hidden && "opacity-0 group-hover:opacity-100")}
                >
                  {scene.hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              {expanded && hasKids && (
                <ul className="ml-9 border-l border-line pl-2">
                  {list &&
                    items.map((item, j) => (
                      <li key={`${list.key}-${j}`} className="group/kid flex items-center">
                        <button
                          type="button"
                          onClick={() => setSel({ scene: i, item: j, field: list.key })}
                          className={cn(
                            "min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-xs",
                            sel.scene === i && sel.item === j ? "bg-paper font-medium" : "text-muted hover:bg-paper/60 hover:text-ink",
                          )}
                        >
                          {showNames(list.kind === "list" ? list.title(item as Record<string, unknown>) : String(item), draft.story)}
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove this ${list.itemLabel.toLowerCase()}`}
                          disabled={items.length <= 1}
                          onClick={() => {
                            const next = deleteSelected(draft, { scene: i, item: j, field: list.key });
                            if (!next) return;
                            edit(next.draft);
                            setSel(next.sel);
                          }}
                          className="grid size-6 shrink-0 place-items-center text-rose-deep disabled:opacity-30"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </li>
                    ))}
                  {stickers.map((_, n) => (
                    <li key={`sticker-${n}`} className="group/kid flex items-center">
                      <button
                        type="button"
                        onClick={() => setSel({ scene: i, item: null, field: `sticker-${n}` })}
                        className={cn(
                          "min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-xs",
                          sel.scene === i && sel.field === `sticker-${n}` ? "bg-paper font-medium" : "text-muted hover:bg-paper/60 hover:text-ink",
                        )}
                      >
                        Sticker {n + 1}
                      </button>
                      <button
                        type="button"
                        aria-label="Remove this sticker"
                        onClick={() => {
                          const next = deleteSelected(draft, { scene: i, item: null, field: `sticker-${n}` });
                          if (!next) return;
                          edit(next.draft);
                          setSel(next.sel);
                        }}
                        className="grid size-6 shrink-0 place-items-center text-rose-deep"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}

function Assets({ draft, edit }: { draft: Draft; edit: Edit }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3 px-1">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink/25 py-4 text-sm font-medium hover:border-ink/50 hover:bg-paper">
        <ImagePlus className="size-4" /> {busy ? "Adding…" : "Upload photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (!files.length) return;
            setBusy(true);
            const added = await Promise.all(
              files.map(async (f) => ({ id: Math.random().toString(36).slice(2, 10), name: f.name, src: await imageToDataUrl(f) })),
            );
            edit({ ...draft, assets: [...draft.assets, ...added] });
            setBusy(false);
          }}
        />
      </label>
      {draft.assets.length === 0 ? (
        <p className="px-1 text-xs text-muted">Photos you upload live here. Select a photo inside a Polaroids page to place one.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {draft.assets.map((a) => (
            <div key={a.id} className="group relative aspect-square overflow-hidden rounded-xl bg-line/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.src} alt={a.name} className="size-full object-cover" />
              <button
                type="button"
                aria-label={`Remove ${a.name}`}
                onClick={() => edit({ ...draft, assets: draft.assets.filter((x) => x.id !== a.id) })}
                className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-paper/90 text-rose-deep opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
