"use client";

import { Reorder } from "motion/react";
import { ChevronRight, Eye, EyeOff, GripVertical, Image as ImgIcon, ImagePlus, Lock as LockIcon, Plus, Sparkles, Trash2, Type, Unlock as UnlockIcon } from "lucide-react";
import { useState } from "react";
import type { Scene } from "@/components/story/types";
import { cn } from "@/lib/utils";
import { type Draft } from "./draft-store";
import { FileCropInput } from "./image-crop";
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
    <aside data-tour="pages" className="flex w-[280px] shrink-0 flex-col border-r border-line bg-cream">
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
          <button type="button" data-tour="add" onClick={onAddSection} className="flex w-full items-center justify-center gap-2 rounded-xl bg-paper py-2.5 text-sm font-medium hover:bg-white">
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
        data-tour="look"
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
          const sceneRecord = scene as unknown as Record<string, unknown>;
          const fieldLayers = schema.fields.filter(
            (f) =>
              f !== list &&
              (f.kind === "text" || f.kind === "textarea" || f.kind === "image") &&
              (f.key === "meta" || f.key === "greeting" || (sceneRecord[f.key] !== undefined && sceneRecord[f.key] !== ""))
          );
          const hasKids = fieldLayers.length > 0 || items.length > 0 || stickers.length > 0;
          const expanded = open.has(i) || (sel.scene === i && (sel.item !== null || sel.field !== null));
          const active = sel.scene === i && sel.item === null && sel.field === null;

          const toggleLock = (layerKey: string) => {
            const cur = scene.positions?.[layerKey] ?? {};
            const nextLocked = cur.locked === false ? true : false;
            const nextPositions = {
              ...(scene.positions ?? {}),
              [layerKey]: { ...cur, locked: nextLocked },
            };
            edit(updateScene(draft, i, { positions: nextPositions }));
          };

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
                <ul className="ml-7 border-l border-line pl-1.5 space-y-0.5 mt-0.5">
                  {/* Field layers (Headline, Label, Greeting, Pinned Photo, etc.) */}
                  {fieldLayers.map((f) => {
                    const layerKey = f.key;
                    const isLocked = scene.positions?.[layerKey]?.locked !== false;
                    const isSel = sel.scene === i && sel.field === layerKey && sel.item === null;
                    return (
                      <li key={layerKey} className="group/kid flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-paper/40">
                        <button
                          type="button"
                          onClick={() => setSel({ scene: i, item: null, field: layerKey })}
                          className={cn(
                            "flex min-w-0 flex-1 items-center gap-1.5 truncate rounded px-1.5 py-1 text-left text-xs",
                            isSel ? "bg-paper font-medium text-ink shadow-2xs" : "text-muted hover:text-ink",
                          )}
                        >
                          {f.kind === "image" ? (
                            <ImgIcon className="size-3 shrink-0 text-ink/60" />
                          ) : (
                            <Type className="size-3 shrink-0 text-ink/60" />
                          )}
                          <span className="truncate">{f.label}</span>
                        </button>
                        <button
                          type="button"
                          title={isLocked ? "Position locked (default). Click to unlock." : "Position unlocked. Click to lock."}
                          onClick={() => toggleLock(layerKey)}
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded hover:bg-paper transition-colors",
                            isLocked ? "text-muted" : "text-amber-600 bg-amber-50"
                          )}
                        >
                          {isLocked ? <LockIcon className="size-3" /> : <UnlockIcon className="size-3" />}
                        </button>
                      </li>
                    );
                  })}

                  {/* List / Strings items (Paragraphs, Photos, Cards, etc.) */}
                  {list &&
                    items.map((item, j) => {
                      const layerKey = `${list.key}:${j}`;
                      const isLocked = scene.positions?.[layerKey]?.locked !== false;
                      const isSel = sel.scene === i && sel.item === j;
                      return (
                        <li key={layerKey} className="group/kid flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-paper/40">
                          <button
                            type="button"
                            onClick={() => setSel({ scene: i, item: j, field: list.key })}
                            className={cn(
                              "flex min-w-0 flex-1 items-center gap-1.5 truncate rounded px-1.5 py-1 text-left text-xs",
                              isSel ? "bg-paper font-medium text-ink shadow-2xs" : "text-muted hover:text-ink",
                            )}
                          >
                            {list.key === "photos" ? (
                              <ImgIcon className="size-3 shrink-0 text-ink/60" />
                            ) : (
                              <Type className="size-3 shrink-0 text-ink/60" />
                            )}
                            <span className="truncate">
                              {showNames(list.kind === "list" ? list.title(item as Record<string, unknown>) : String(item), draft.story)}
                            </span>
                          </button>
                          <button
                            type="button"
                            title={isLocked ? "Position locked (default). Click to unlock." : "Position unlocked. Click to lock."}
                            onClick={() => toggleLock(layerKey)}
                            className={cn(
                              "grid size-6 shrink-0 place-items-center rounded hover:bg-paper transition-colors",
                              isLocked ? "text-muted" : "text-amber-600 bg-amber-50"
                            )}
                          >
                            {isLocked ? <LockIcon className="size-3" /> : <UnlockIcon className="size-3" />}
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
                      );
                    })}

                  {/* Stickers */}
                  {stickers.map((_, n) => {
                    const layerKey = `sticker-${n}`;
                    const isLocked = scene.positions?.[layerKey]?.locked !== false;
                    const isSel = sel.scene === i && sel.field === layerKey;
                    return (
                      <li key={layerKey} className="group/kid flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-paper/40">
                        <button
                          type="button"
                          onClick={() => setSel({ scene: i, item: null, field: layerKey })}
                          className={cn(
                            "flex min-w-0 flex-1 items-center gap-1.5 truncate rounded px-1.5 py-1 text-left text-xs",
                            isSel ? "bg-paper font-medium text-ink shadow-2xs" : "text-muted hover:text-ink",
                          )}
                        >
                          <Sparkles className="size-3 shrink-0 text-ink/60" />
                          <span className="truncate">Sticker {n + 1}</span>
                        </button>
                        <button
                          type="button"
                          title={isLocked ? "Position locked (default). Click to unlock." : "Position unlocked. Click to lock."}
                          onClick={() => toggleLock(layerKey)}
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded hover:bg-paper transition-colors",
                            isLocked ? "text-muted" : "text-amber-600 bg-amber-50"
                          )}
                        >
                          {isLocked ? <LockIcon className="size-3" /> : <UnlockIcon className="size-3" />}
                        </button>
                        <button
                          type="button"
                          aria-label="Remove this sticker"
                          onClick={() => {
                            const next = deleteSelected(draft, { scene: i, item: null, field: layerKey });
                            if (!next) return;
                            edit(next.draft);
                            setSel(next.sel);
                          }}
                          className="grid size-6 shrink-0 place-items-center text-rose-deep"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </li>
                    );
                  })}
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
  return (
    <div className="space-y-3 px-1">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink/25 py-4 text-sm font-medium hover:border-ink/50 hover:bg-paper">
        <ImagePlus className="size-4" /> Upload photos
        <FileCropInput
          multiple
          onDone={(urls) => {
            const added = urls.map((src, i) => ({
              id: Math.random().toString(36).slice(2, 10),
              name: `Photo ${draft.assets.length + i + 1}`,
              src,
            }));
            edit({ ...draft, assets: [...draft.assets, ...added] });
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
