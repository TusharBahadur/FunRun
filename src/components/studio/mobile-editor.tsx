"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Field, TextArea } from "@/components/editor/fields";
import { cn } from "@/lib/utils";
import type { Draft } from "./draft-store";
import {
  FieldEditor,
  isStickerSlot,
  keepNames,
  PhotoPicker,
  showNames,
  SceneColours,
  SceneReaction,
  SceneStamp,
  SceneStickers,
  StickerSlotEditor,
  type Selection,
} from "./inspector";
import { FieldFontPicker } from "./font-choices";
import { isLook, LOOK, LookSettings, setFieldFont } from "./look";
import {
  addItem,
  deleteScene,
  deleteSelected,
  duplicateItem,
  duplicateScene,
  moveItem,
  moveScene,
  readItems,
  updateItem,
  updateScene,
} from "./ops";
import { childField, sceneSchemas, sceneSubtitle, type FieldDef } from "./schema";

type Edit = (next: Draft, tag?: string) => void;

export function MobileEditor({
  draft,
  edit,
  sel,
  setSel,
}: {
  draft: Draft;
  edit: Edit;
  sel: Selection;
  setSel: (s: Selection) => void;
}) {
  const scenes = draft.story.scenes;
  const look = isLook(sel.scene);
  const i = !look && sel.scene !== null && scenes[sel.scene] ? sel.scene : 0;
  const scene = look ? undefined : scenes[i];
  const list = scene ? childField(scene.type) : undefined;
  const item = scene && list && sel.item !== null ? readItems(scene, list.key)[sel.item] : undefined;
  const field = sel.field ?? null;

  useEffect(() => {
    if (!field) return;
    const id = window.setTimeout(() => {
      const box = document.querySelector<HTMLElement>(`[data-studio-input="${field}"]`);
      box?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const input = box?.querySelector<HTMLElement>("input, textarea, select");
      input?.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(id);
  }, [field, sel.item, sel.scene]);

  if (look) {
    return (
      <div className="bg-cream">
        <div className="space-y-8 px-4 py-5">
          <LookSettings draft={draft} edit={edit} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <div className="space-y-8 px-4 py-5">
        {scene && item !== undefined && list && sel.item !== null && (
          <button
            type="button"
            onClick={() => setSel({ scene: i, item: null, field: null })}
            className="flex h-11 items-center gap-1 text-base font-medium"
          >
            <ChevronLeft className="size-5" />
            Back to {sceneSchemas[scene.type].name}
          </button>
        )}
        {scene && item === undefined && (
          <PageSettings draft={draft} edit={edit} i={i!} field={field} setSel={setSel} />
        )}
        {scene && item !== undefined && list && sel.item !== null && (
          <ItemSettings draft={draft} edit={edit} i={i!} j={sel.item} field={field} setSel={setSel} />
        )}
      </div>
    </div>
  );
}

/** Prev / next plus a tap-to-open list of pages, sitting under the preview. */
export function PageSwitcher({
  draft,
  sel,
  setSel,
  onAddSection,
}: {
  draft: Draft;
  sel: Selection;
  setSel: (s: Selection) => void;
  onAddSection: () => void;
}) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const scenes = draft.story.scenes;
  const i = sel.scene ?? LOOK;
  const scene = i >= 0 ? scenes[i] : undefined;
  const label = isLook(i) ? "Look · Theme, names & font" : scene ? `${i + 1} · ${sceneSchemas[scene.type].name}` : "";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  function go(next: number) {
    setSel({ scene: next, item: null, field: null });
    setOpen(false);
  }

  return (
    <div ref={listRef} className="border-t border-ink/10 bg-[#efe8dc]">
      <div className="flex items-center gap-1 px-1.5 py-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={isLook(i)}
          onClick={() => go(i - 1)}
          className="grid size-11 shrink-0 place-items-center rounded-xl disabled:opacity-30"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-paper px-3 text-center"
        >
          <span className="min-w-0 truncate text-base font-medium">{label}</span>
          <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} />
        </button>
        <button
          type="button"
          aria-label="Next page"
          disabled={i >= scenes.length - 1}
          onClick={() => go(i + 1)}
          className="grid size-11 shrink-0 place-items-center rounded-xl disabled:opacity-30"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      {open && (
        <div className="max-h-[min(50vh,22rem)] overflow-y-auto border-t border-ink/10 bg-cream px-3 py-3">
          <Pages
            draft={draft}
            sel={sel}
            setSel={(s) => {
              setSel(s);
              setOpen(false);
            }}
            onAddSection={() => {
              setOpen(false);
              onAddSection();
            }}
          />
        </div>
      )}
    </div>
  );
}

function PageSettings({
  draft,
  edit,
  i,
  field,
  setSel,
}: {
  draft: Draft;
  edit: Edit;
  i: number;
  field: string | null;
  setSel: (s: Selection) => void;
}) {
  const scene = draft.story.scenes[i];
  const schema = sceneSchemas[scene.type];
  const list = childField(scene.type);
  const fields = schema.fields.filter((f) => f !== list);
  const items = list ? readItems(scene, list.key) : [];
  const set = (key: string, value: unknown) => edit(updateScene(draft, i, { [key]: value }), `${i}-${key}`);
  const focused = field ? schema.fields.find((f) => f.key === field && f !== list) : undefined;
  const shown = focused ? [focused] : fields;
  const allSettings = (
    <button
      type="button"
      onClick={() => setSel({ scene: i, item: null, field: null })}
      className="flex h-12 w-full items-center justify-center rounded-2xl bg-paper text-base font-medium"
    >
      All settings on this page
    </button>
  );

  if (isStickerSlot(scene, field)) {
    return (
      <>
        <p className="text-sm leading-snug text-muted">Swap it for another, upload your own picture, or remove it.</p>
        <StudioField id={field!} on>
          <StickerSlotEditor
            draft={draft}
            i={i}
            field={field}
            edit={edit}
            onRemoved={() => setSel({ scene: i, item: null, field: null })}
          />
        </StudioField>
        {allSettings}
      </>
    );
  }

  return (
    <>
      <p className="text-sm leading-snug text-muted">{focused ? `Everything for this ${focused.label.toLowerCase()}.` : schema.blurb}</p>
      {shown.map((f) => (
        <StudioField key={f.key} id={f.key} on={!!focused || field === f.key}>
          <FieldEditor
            field={f}
            draft={draft}
            roomy
            highlight={!!focused || field === f.key}
            value={(scene as unknown as Record<string, unknown>)[f.key]}
            onChange={(v) => set(f.key, v)}
            font={scene.fonts?.[f.key]}
            onFont={(id) => edit(setFieldFont(draft, i, f.key, id), `${i}-font-${f.key}`)}
            onRemove={
              "optional" in f && f.optional
                ? () => set(f.key, f.kind === "image" ? undefined : "")
                : undefined
            }
          />
        </StudioField>
      ))}

      {list && !focused && (
        <StudioField id={list.key} on={field === list.key}>
          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className={cn("text-base font-medium", field === list.key && "text-rose-deep")}>{list.label}</h3>
              <span className="text-sm text-muted">
                {items.length} / {list.max}
              </span>
            </div>
            <ul className="space-y-2">
              {items.map((entry, j) => (
                <li key={j} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSel({ scene: i, item: j, field: list.key })}
                    className="flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-line bg-paper px-3 text-left"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-sm font-medium">{j + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-base">
                      {showNames(list.kind === "list" ? list.title(entry as Record<string, unknown>) : String(entry), draft.story)}
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted" />
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
                    className="grid size-12 shrink-0 place-items-center rounded-2xl border border-rose/30 text-rose-deep disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            {items.length < list.max && (
              <button
                type="button"
                onClick={() => {
                  const value = list.kind === "list" ? list.newItem() : `New ${list.itemLabel.toLowerCase()}`;
                  edit(addItem(draft, i, list.key, value));
                  setSel({ scene: i, item: items.length, field: list.key });
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/30 text-base font-medium"
              >
                <Plus className="size-4" /> Add {list.itemLabel.toLowerCase()}
              </button>
            )}
          </section>
        </StudioField>
      )}

      {focused && allSettings}

      {!focused && (
        <>
          <SceneStickers
            draft={draft}
            stickers={scene.stickers ?? []}
            onChange={(next) => edit(updateScene(draft, i, { stickers: next.length ? next : undefined }))}
          />
          <SceneReaction draft={draft} value={scene.reaction} onChange={(reaction) => edit(updateScene(draft, i, { reaction }))} />
          <SceneStamp draft={draft} i={i} edit={edit} />
          <SceneColours draft={draft} i={i} edit={edit} />
          <PageActions draft={draft} edit={edit} i={i} setSel={setSel} />
        </>
      )}
    </>
  );
}

function PageActions({
  draft,
  edit,
  i,
  setSel,
}: {
  draft: Draft;
  edit: Edit;
  i: number;
  setSel: (s: Selection) => void;
}) {
  const scene = draft.story.scenes[i];
  const count = draft.story.scenes.length;
  return (
    <section className="space-y-2">
      <h3 className="text-base font-medium">This page</h3>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          label={scene.hidden ? "Show page" : "Hide page"}
          onClick={() => edit(updateScene(draft, i, { hidden: !scene.hidden }))}
        >
          {scene.hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </ActionButton>
        <ActionButton
          label="Duplicate"
          onClick={() => {
            edit(duplicateScene(draft, i));
            setSel({ scene: i + 1, item: null, field: null });
          }}
        >
          <Copy className="size-4" />
        </ActionButton>
        <ActionButton
          label="Move up"
          disabled={i === 0}
          onClick={() => {
            edit(moveScene(draft, i, i - 1));
            setSel({ scene: i - 1, item: null, field: null });
          }}
        >
          <ArrowUp className="size-4" />
        </ActionButton>
        <ActionButton
          label="Move down"
          disabled={i === count - 1}
          onClick={() => {
            edit(moveScene(draft, i, i + 1));
            setSel({ scene: i + 1, item: null, field: null });
          }}
        >
          <ArrowDown className="size-4" />
        </ActionButton>
      </div>
      <ActionButton
        label="Delete page"
        danger
        disabled={count <= 1}
        onClick={() => {
          if (!window.confirm("Delete this page?")) return;
          edit(deleteScene(draft, i));
          setSel({ scene: Math.max(0, i - 1), item: null, field: null });
        }}
      >
        <Trash2 className="size-4" />
      </ActionButton>
    </section>
  );
}

function ItemSettings({
  draft,
  edit,
  i,
  j,
  field,
  setSel,
}: {
  draft: Draft;
  edit: Edit;
  i: number;
  j: number;
  field: string | null;
  setSel: (s: Selection) => void;
}) {
  const scene = draft.story.scenes[i];
  const list = childField(scene.type)!;
  const items = readItems(scene, list.key);
  const item = items[j];
  const set = (value: unknown) => edit(updateItem(draft, i, list.key, j, value), `${i}-${list.key}-${j}`);
  const fields = list.kind === "list" ? list.item : [];
  const ordered: FieldDef[] = field ? [...fields.filter((f) => f.key === field), ...fields.filter((f) => f.key !== field)] : fields;

  return (
    <>
      <h2 className="text-lg font-medium">
        {list.itemLabel} {j + 1}
      </h2>
      {list.kind === "strings" ? (
        <StudioField id={list.key} on>
          <Field label={list.itemLabel} roomy highlight>
            <TextArea
              value={showNames(String(item ?? ""), draft.story)}
              maxLength={400}
              onChange={(e) => set(keepNames(e.target.value, draft.story))}
              className="min-h-28 text-base"
            />
            <FieldFontPicker
              value={scene.fonts?.[`${list.key}:${j}`]}
              sample={String(item ?? "")}
              onChange={(id) => edit(setFieldFont(draft, i, `${list.key}:${j}`, id), `${i}-font-${list.key}-${j}`)}
            />
          </Field>
        </StudioField>
      ) : (
        ordered.map((f) => (
          <StudioField key={f.key} id={f.key} on={field === f.key}>
            <FieldEditor
              field={f}
              draft={draft}
              roomy
              highlight={field === f.key}
              value={(item as Record<string, unknown>)[f.key]}
              onChange={(v) => set({ ...(item as Record<string, unknown>), [f.key]: v })}
              font={scene.fonts?.[`${f.key}:${j}`]}
              onFont={(id) => edit(setFieldFont(draft, i, `${f.key}:${j}`, id), `${i}-font-${f.key}-${j}`)}
            />
          </StudioField>
        ))
      )}
      {(list.key === "photos" || list.key === "songs") && (
        <StudioField id="src" on={field === "src"}>
          <PhotoPicker
            draft={draft}
            roomy
            highlight={field === "src"}
            src={(item as Record<string, unknown>).src as string | undefined}
            onChange={(src) => set({ ...(item as Record<string, unknown>), src })}
          />
        </StudioField>
      )}
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          label="Duplicate"
          disabled={items.length >= list.max}
          onClick={() => {
            edit(duplicateItem(draft, i, list.key, j));
            setSel({ scene: i, item: j + 1, field: list.key });
          }}
        >
          <Copy className="size-4" />
        </ActionButton>
        <ActionButton
          label="Move up"
          disabled={j === 0}
          onClick={() => {
            edit(moveItem(draft, i, list.key, j, j - 1));
            setSel({ scene: i, item: j - 1, field: list.key });
          }}
        >
          <ArrowUp className="size-4" />
        </ActionButton>
        <ActionButton
          label="Move down"
          disabled={j === items.length - 1}
          onClick={() => {
            edit(moveItem(draft, i, list.key, j, j + 1));
            setSel({ scene: i, item: j + 1, field: list.key });
          }}
        >
          <ArrowDown className="size-4" />
        </ActionButton>
      </div>
      <button
        type="button"
        disabled={items.length <= 1}
        onClick={() => {
          const next = deleteSelected(draft, { scene: i, item: j, field: list.key });
          if (!next) return;
          edit(next.draft);
          setSel(next.sel);
        }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose/30 text-base font-medium text-rose-deep disabled:opacity-40"
      >
        <Trash2 className="size-4" /> Remove this {list.itemLabel.toLowerCase()}
      </button>
    </>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-2xl border bg-paper text-sm font-medium disabled:opacity-40",
        danger ? "border-rose/30 text-rose-deep" : "border-line",
      )}
    >
      {children}
      {label}
    </button>
  );
}

function StudioField({ id, on, children }: { id: string; on: boolean; children: ReactNode }) {
  return (
    <div
      data-studio-input={id}
      className={cn(
        "scroll-mt-20 rounded-2xl transition-colors",
        on && "-mx-2 bg-rose/10 px-2 py-3 ring-2 ring-rose/40",
      )}
    >
      {children}
    </div>
  );
}

function Pages({
  draft,
  sel,
  setSel,
  onAddSection,
}: {
  draft: Draft;
  sel: Selection;
  setSel: (s: Selection) => void;
  onAddSection: () => void;
}) {
  const scenes = draft.story.scenes;
  return (
    <div>
      <ul className="space-y-2">
        <li>
          <button
            type="button"
            onClick={() => setSel({ scene: LOOK, item: null, field: null })}
            className={cn(
              "flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 text-left",
              isLook(sel.scene) ? "border-ink bg-paper" : "border-line bg-paper/50",
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-sm font-medium">Aa</span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-medium">Look</span>
              <span className="block truncate text-sm text-muted">Theme, names and font</span>
            </span>
          </button>
        </li>
        {scenes.map((scene, i) => {
          const schema = sceneSchemas[scene.type];
          const Icon = schema.icon;
          const on = sel.scene === i;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setSel({ scene: i, item: null, field: null })}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 text-left",
                  on ? "border-ink bg-paper" : "border-line bg-paper/50",
                  scene.hidden && "opacity-60",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-sm font-medium">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-base font-medium">
                    <Icon className="size-4 shrink-0 text-ink/70" />
                    <span className="truncate">{schema.name}</span>
                  </span>
                  <span className="block truncate text-sm text-muted">{scene.hidden ? "Hidden" : showNames(sceneSubtitle(scene), draft.story)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onAddSection}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/30 text-base font-medium"
      >
        <Plus className="size-4" /> Add a page
      </button>
    </div>
  );
}
