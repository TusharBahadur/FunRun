"use client";

import {ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
  Lock as LockIcon,
  Unlock as UnlockIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  ColorInput,
  Field,
  NumberInput,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/editor/fields";
import type { FontId } from "@/components/story/font-catalog";
import type { LayerPosition, Scene, StoryPalette } from "@/components/story/types";
import { keepNames, showNames } from "@/lib/gift-names";
import { cn } from "@/lib/utils";
import { type Draft } from "./draft-store";
import { FileCropInput } from "./image-crop";
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
  setFieldPosition,
} from "./ops";
import { FieldFontPicker, FontPickerScope } from "./font-choices";
import { isLook, LookSettings, setFieldFont } from "./look";
import { childField, sceneSchemas, type FieldDef } from "./schema";
import { TrackField } from "./track-field";
import {
  boardStickerIds,
  drawnStickerIds,
  isUploadedSticker,
  Sticker,
  stickerCategories,
  stickerCategory,
  stickerName,
  type AnyStickerId,
  type StickerPlacement,
  type StickerSpot,
} from "@/components/story/stickers";

export type Selection = { scene: number | null; item: number | null; field?: string | null };
export { LOOK, isLook } from "./look";
type Edit = (next: Draft, tag?: string) => void;
type Rec = Record<string, unknown>;

export const paletteFields: { key: keyof StoryPalette; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "fg", label: "Text" },
  { key: "accent", label: "Highlight & buttons" },
  { key: "cream", label: "Cards & paper" },
  { key: "ink", label: "Text on cards" },
  { key: "pink", label: "Soft tint" },
  { key: "gold", label: "Sparkle & flames" },
];

export function Inspector({
  draft,
  sel,
  setSel,
  edit,
}: {
  draft: Draft;
  sel: Selection;
  setSel: (s: Selection) => void;
  edit: Edit;
}) {
  return (
    <FontPickerScope key={`${sel.scene}-${sel.item ?? ""}`}>
      <InspectorBody draft={draft} sel={sel} setSel={setSel} edit={edit} />
    </FontPickerScope>
  );
}

function InspectorBody({
  draft,
  sel,
  setSel,
  edit,
}: {
  draft: Draft;
  sel: Selection;
  setSel: (s: Selection) => void;
  edit: Edit;
}) {
  if (isLook(sel.scene)) {
    return (
      <Panel crumbs={[{ label: "Look" }]}>
        <LookSettings draft={draft} edit={edit} />
      </Panel>
    );
  }
  const i = sel.scene !== null && draft.story.scenes[sel.scene] ? sel.scene : 0;
  const scene = draft.story.scenes[i];
  const list = childField(scene.type);
  if (
    sel.item !== null &&
    list &&
    readItems(scene, list.key)[sel.item] !== undefined
  ) {
    return (
      <ItemInspector
        draft={draft}
        i={i}
        j={sel.item}
        list={list}
        setSel={setSel}
        edit={edit}
      />
    );
  }
  if (isStickerSlot(scene, sel.field)) {
    const back = () => setSel({ scene: i, item: null, field: null });
    return (
      <Panel crumbs={[{ label: sceneSchemas[scene.type].name, onClick: back }, { label: "Sticker" }]}>
        <StickerSlotEditor draft={draft} i={i} field={sel.field} edit={edit} onRemoved={back} />
      </Panel>
    );
  }
  return <SceneInspector draft={draft} i={i} setSel={setSel} edit={edit} />;
}

/* ───────────── One scene ───────────── */

function SceneInspector({
  draft,
  i,
  setSel,
  edit,
}: {
  draft: Draft;
  i: number;
  setSel: (s: Selection) => void;
  edit: Edit;
}) {
  const scene = draft.story.scenes[i];
  const schema = sceneSchemas[scene.type];
  const count = draft.story.scenes.length;
  const set = (key: string, value: unknown) =>
    edit(updateScene(draft, i, { [key]: value }), `${i}-${key}`);
  const list = childField(scene.type);

  return (
    <Panel
      crumbs={[
        { label: schema.name },
      ]}
      actions={
        <>
          <IconAction
            label={scene.hidden ? "Show this page" : "Hide this page"}
            onClick={() =>
              edit(updateScene(draft, i, { hidden: !scene.hidden }))
            }
          >
            {scene.hidden ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </IconAction>
          <IconAction
            label="Duplicate"
            onClick={() => {
              edit(duplicateScene(draft, i));
              setSel({ scene: i + 1, item: null });
            }}
          >
            <Copy className="size-4" />
          </IconAction>
          <IconAction
            label="Move up"
            disabled={i === 0}
            onClick={() => {
              edit(moveScene(draft, i, i - 1));
              setSel({ scene: i - 1, item: null });
            }}
          >
            <ArrowUp className="size-4" />
          </IconAction>
          <IconAction
            label="Move down"
            disabled={i === count - 1}
            onClick={() => {
              edit(moveScene(draft, i, i + 1));
              setSel({ scene: i + 1, item: null });
            }}
          >
            <ArrowDown className="size-4" />
          </IconAction>
          <span className="flex-1" />
          <IconAction
            label="Delete page"
            danger
            disabled={count <= 1}
            onClick={() => {
              edit(deleteScene(draft, i));
              setSel({ scene: Math.max(0, i - 1), item: null });
            }}
          >
            <Trash2 className="size-4" />
          </IconAction>
        </>
      }
    >
      <p className="-mt-2 text-sm text-muted">{schema.blurb}</p>
      <Group title="Content">
        {schema.fields
          .filter((f) => f !== list)
          .map((f) => (
            <FieldEditor
              key={f.key}
              field={f}
              draft={draft}
              value={
                (scene as unknown as Rec)[f.key] !== undefined
                  ? (scene as unknown as Rec)[f.key]
                  : f.key === "meta" && scene.type === "letter"
                    ? "For {to} · from {from}"
                    : f.key === "greeting" && scene.type === "letter"
                      ? "Dear {to},"
                      : ""
              }
              onChange={(v) => set(f.key, v)}
              font={scene.fonts?.[f.key]}
              onFont={(id) => edit(setFieldFont(draft, i, f.key, id), `${i}-font-${f.key}`)}
              position={scene.positions?.[f.key]}
              onPosition={(pos) => edit(setFieldPosition(draft, i, f.key, pos), `${i}-pos-${f.key}`)}
              onRemove={
                "optional" in f && f.optional
                  ? () => set(f.key, f.kind === "image" ? undefined : "")
                  : undefined
              }
            />
          ))}
      </Group>

      {list && (
        <Group
          title={`${list.label} ${readItems(scene, list.key).length} / ${list.max}`}
          action={
            readItems(scene, list.key).length < list.max && (
              <IconAction
                label={`Add ${list.itemLabel.toLowerCase()}`}
                onClick={() => {
                  const value =
                    list.kind === "list"
                      ? list.newItem()
                      : `New ${list.itemLabel.toLowerCase()}`;
                  edit(addItem(draft, i, list.key, value));
                  setSel({ scene: i, item: readItems(scene, list.key).length });
                }}
              >
                <Plus className="size-4" />
              </IconAction>
            )
          }
        >
          <ul className="-mx-2">
            {readItems(scene, list.key).map((item, j) => (
              <li key={j} className="group/item flex items-center">
                <button
                  type="button"
                  onClick={() => setSel({ scene: i, item: j })}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-cream"
                >
                  <span className="type-label w-5 text-[10px] text-muted">
                    {j + 1}
                  </span>
                  <span className="flex-1 truncate">
                    {showNames(
                      list.kind === "list" ? list.title(item as Rec) : String(item),
                      draft.story,
                    )}
                  </span>
                  <ChevronRight className="size-4 text-muted" />
                </button>
                <IconAction
                  label={`Remove this ${list.itemLabel.toLowerCase()}`}
                  danger
                  disabled={readItems(scene, list.key).length <= 1}
                  onClick={() => {
                    const next = deleteSelected(draft, { scene: i, item: j, field: list.key });
                    if (!next) return;
                    edit(next.draft);
                    setSel(next.sel);
                  }}
                >
                  <Trash2 className="size-4" />
                </IconAction>
              </li>
            ))}
          </ul>
        </Group>
      )}

      <SceneStickers
        draft={draft}
        stickers={scene.stickers ?? []}
        max={stickerCap(scene)}
        onChange={(next) =>
          edit(updateScene(draft, i, { stickers: next.length ? next : undefined }))
        }
      />

      <SceneReaction
        draft={draft}
        value={scene.reaction}
        onChange={(reaction) => edit(updateScene(draft, i, { reaction }))}
      />

      <SceneStamp draft={draft} i={i} edit={edit} />

      <SceneColours draft={draft} i={i} edit={edit} />
    </Panel>
  );
}

const STICKER_SPOTS: StickerSpot[] = ["tr", "bl", "tl", "br", "mr", "ml"];
const MAX_STICKERS = 3;
const CALL_STICKERS = 4;

export function stickerCap(scene: Scene) {
  return scene.type === "knock" ? CALL_STICKERS : MAX_STICKERS;
}

/** Uploads already in this gift, so one picture can be reused as a sticker elsewhere. */
function uploadedStickers(draft: Draft): AnyStickerId[] {
  const ids = new Set<AnyStickerId>();
  for (const s of draft.story.scenes) {
    for (const st of s.stickers ?? []) if (isUploadedSticker(st.id)) ids.add(st.id);
    if (s.reaction && isUploadedSticker(s.reaction)) ids.add(s.reaction);
    if (s.type === "spotlight" && s.stamp && isUploadedSticker(s.stamp)) ids.add(s.stamp);
    if (s.type === "knock") {
      if (s.caller && isUploadedSticker(s.caller)) ids.add(s.caller);
      if (s.party && isUploadedSticker(s.party)) ids.add(s.party);
    }
  }
  for (const a of draft.assets) if (a.src.startsWith("data:")) ids.add(a.src as AnyStickerId);
  return [...ids];
}

type StickerSlot = {
  title: string;
  value: AnyStickerId;
  replace: (id: AnyStickerId) => Partial<Scene>;
  remove: () => Partial<Scene>;
};

/** The one sticker a tap in the preview points at: a page sticker, the reaction, or the notes stamp. */
function stickerSlot(scene: Scene, field: string | null | undefined): StickerSlot | null {
  const k = field?.match(/^sticker-(\d+)$/)?.[1];
  if (k !== undefined) {
    const list = scene.stickers ?? [];
    const st = list[Number(k)];
    if (!st) return null;
    return {
      title: "Sticker",
      value: st.id,
      replace: (id) => ({ stickers: list.map((s, n) => (n === Number(k) ? { ...s, id } : s)) }),
      remove: () => {
        const next = list.filter((_, n) => n !== Number(k));
        return { stickers: next.length ? next : undefined };
      },
    };
  }
  if (field === "reaction" && scene.reaction) {
    return {
      title: "Reaction when finished",
      value: scene.reaction,
      replace: (id) => ({ reaction: id }),
      remove: () => ({ reaction: undefined }),
    };
  }
  if (field === "stamp" && scene.type === "spotlight" && scene.stamp !== null) {
    return {
      title: "Stamp after the last note",
      value: scene.stamp ?? "yay",
      replace: (id) => ({ stamp: id }) as Partial<Scene>,
      remove: () => ({ stamp: null }) as Partial<Scene>,
    };
  }
  if (scene.type === "knock" && field === "caller") {
    return {
      title: "Who’s calling",
      value: scene.caller ?? "m-scream-cat",
      replace: (id) => ({ caller: id }),
      remove: () => ({ caller: undefined }),
    };
  }
  if (scene.type === "knock" && field === "party") {
    return {
      title: "After they pick up",
      value: scene.party ?? "m-dance-cat",
      replace: (id) => ({ party: id }),
      remove: () => ({ party: undefined }),
    };
  }
  return null;
}

export function isStickerSlot(scene: Scene, field: string | null | undefined) {
  return stickerSlot(scene, field) !== null;
}

/** Swap, upload over, or remove the one sticker picked in the preview. */
export function StickerSlotEditor({
  draft,
  i,
  field,
  edit,
  onRemoved,
}: {
  draft: Draft;
  i: number;
  field: string | null | undefined;
  edit: Edit;
  onRemoved: () => void;
}) {
  const slot = stickerSlot(draft.story.scenes[i], field);
  if (!slot) return null;
  const replace = (id: AnyStickerId) => edit(updateScene(draft, i, slot.replace(id)));
  const remove = () => {
    edit(updateScene(draft, i, slot.remove()));
    onRemoved();
  };
  return (
    <Group title={slot.title}>
      <div className="flex items-center gap-3">
        <div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-line bg-paper p-2">
          <Sticker id={slot.value} className="size-full shadow-none" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="truncate text-sm font-medium">{stickerName(slot.value)}</p>
          <div className="flex flex-wrap gap-2">
            <UploadButton onUpload={replace} />
            <button
              type="button"
              onClick={remove}
              className="flex h-9 items-center gap-1.5 rounded-full border border-rose/30 px-3 text-sm font-medium text-rose-deep"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted">Or tap another sticker to put it here.</p>
      <StickerGrid
        selected={[slot.value]}
        yours={uploadedStickers(draft)}
        onPick={(id) => (id === slot.value ? remove() : replace(id))}
      />
    </Group>
  );
}

function UploadButton({ onUpload }: { onUpload: (id: AnyStickerId) => void }) {
  return (
    <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3 text-sm font-medium text-paper">
      <Upload className="size-3.5" /> Upload your own
      <FileCropInput
        maxSide={STICKER_SIDE}
        type="image/webp"
        aspect="1:1"
        onDone={(urls) => onUpload(urls[0] as AnyStickerId)}
      />
    </label>
  );
}

const STICKER_SIDE = 360;

/** Pick stickers for the page (or around the incoming-call phone). */
export function SceneStickers({
  draft,
  stickers,
  onChange,
  max = MAX_STICKERS,
}: {
  draft: Draft;
  stickers: StickerPlacement[];
  onChange: (next: StickerPlacement[]) => void;
  max?: number;
}) {
  const toggle = (id: AnyStickerId) => {
    if (stickers.some((s) => s.id === id)) {
      onChange(stickers.filter((s) => s.id !== id));
      return;
    }
    if (stickers.length >= max) return;
    const at = STICKER_SPOTS.find((spot) => !stickers.some((s) => s.at === spot))!;
    onChange([...stickers, { id, at }]);
  };
  return (
    <Group title={`Stickers ${stickers.length} / ${max}`}>
      {stickers.length >= max && (
        <p className="mb-2 text-sm text-muted">All {max} used. Tap the ✕ on one to swap it for another.</p>
      )}
      <StickerGrid
        selected={stickers.map((s) => s.id)}
        yours={uploadedStickers(draft)}
        full={stickers.length >= max}
        onPick={toggle}
        onUpload={toggle}
      />
    </Group>
  );
}

/** The sticker that pops up once the page is finished. */
export function SceneReaction({
  draft,
  value,
  onChange,
  title = "Reaction when finished",
  bare,
}: {
  draft: Draft;
  value?: AnyStickerId;
  onChange: (next: AnyStickerId | undefined) => void;
  title?: string;
  /** Skip the group chrome when a Fold / Field already labelled this. */
  bare?: boolean;
}) {
  const grid = (
    <StickerGrid
      selected={value ? [value] : []}
      yours={uploadedStickers(draft)}
      onPick={(id) => onChange(id === value ? undefined : id)}
      onUpload={onChange}
    />
  );
  if (bare) return grid;
  return (
    <Group
      title={title}
      action={
        value && (
          <IconAction label={`No ${title.toLowerCase()}`} onClick={() => onChange(undefined)}>
            <X className="size-4" />
          </IconAction>
        )
      }
    >
      {grid}
    </Group>
  );
}

const STICKER_PEEK = 8;

function StickerGrid({
  selected,
  yours = [],
  full = false,
  onPick,
  onUpload,
}: {
  selected: AnyStickerId[];
  /** Pictures uploaded in this gift, shown first. */
  yours?: AnyStickerId[];
  full?: boolean;
  onPick: (id: AnyStickerId) => void;
  /** Adds an "upload" tile to the "Yours" row. */
  onUpload?: (id: AnyStickerId) => void;
}) {
  const [more, setMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const pack = [...boardStickerIds, ...drawnStickerIds];
  const peek = peekStickers(pack, selected, STICKER_PEEK);

  const filteredBoardStickers = useMemo(() => {
    if (activeCategory === "all") return boardStickerIds;
    if (activeCategory === "animated") return [];
    if (activeCategory === "cat") {
      return boardStickerIds.filter((id) => {
        const cat = stickerCategory(id);
        return cat === "cat" || cat === "dog";
      });
    }
    return boardStickerIds.filter((id) => stickerCategory(id) === activeCategory);
  }, [activeCategory]);

  const filteredAnimatedStickers = useMemo(() => {
    if (activeCategory === "all" || activeCategory === "animated") return drawnStickerIds;
    return [];
  }, [activeCategory]);

  const groups: { title: string; ids: AnyStickerId[]; upload?: boolean }[] = more
    ? [
        { title: "Yours", ids: yours, upload: !!onUpload },
        ...(filteredBoardStickers.length ? [{ title: `Board Stickers (${filteredBoardStickers.length})`, ids: filteredBoardStickers }] : []),
        ...(filteredAnimatedStickers.length ? [{ title: "Animated Stickers", ids: filteredAnimatedStickers }] : []),
      ]
    : [
        { title: "Yours", ids: yours, upload: !!onUpload },
        { title: "Stickers", ids: peek },
      ];
  const hidden = pack.length - peek.length;

  return (
    <div className="space-y-3">
      {more && (
        <div className="flex flex-wrap gap-1 pb-1">
          {stickerCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                activeCategory === cat.id
                  ? "bg-ink text-paper"
                  : "bg-paper border border-line text-muted hover:text-ink hover:border-ink/30",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
      {groups.filter((g) => g.ids.length || g.upload).map((g) => (
        <div key={g.title}>
          <p className="type-label mb-1.5 text-[10px] text-muted">{g.title}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1.5">
            {g.upload && onUpload && (
              <label
                title="Upload your own"
                className={cn(
                  "grid aspect-square max-w-20 cursor-pointer place-items-center rounded-xl border border-dashed border-ink/30 text-center text-muted",
                  full && "pointer-events-none opacity-35",
                )}
              >
                <span className="flex flex-col items-center gap-0.5 text-[10px] font-medium leading-tight">
                  <Upload className="size-4" />
                  Upload
                </span>
                <FileCropInput
                  disabled={full}
                  maxSide={STICKER_SIDE}
                  type="image/webp"
                  aspect="1:1"
                  onDone={(urls) => onUpload(urls[0] as AnyStickerId)}
                />
              </label>
            )}
            {g.ids.map((id) => {
              const on = selected.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  title={stickerName(id)}
                  aria-label={on ? `Remove ${stickerName(id)}` : stickerName(id)}
                  aria-pressed={on}
                  onClick={() => onPick(id)}
                  disabled={!on && full}
                  className={cn(
                    "relative grid aspect-square max-w-20 place-items-center rounded-xl border p-1.5 transition-colors disabled:opacity-35",
                    on ? "border-ink bg-paper" : "border-line hover:border-ink/30",
                  )}
                >
                  <Sticker id={id} className="size-full shadow-none" />
                  {on && (
                    <span
                      aria-hidden
                      className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-rose-deep text-paper shadow ring-2 ring-paper"
                    >
                      <X className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={more}
          onClick={() => setMore((m) => !m)}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-ink/25 text-sm font-medium hover:border-ink/40 hover:bg-paper"
        >
          {more ? "Show less" : `Explore all ${pack.length} stickers`}
          <ChevronDown className={cn("size-4 text-muted transition-transform", more && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

function peekStickers(ids: AnyStickerId[], selected: AnyStickerId[], limit: number) {
  const picked = ids.filter((id) => selected.includes(id));
  const rest = ids.filter((id) => !selected.includes(id));
  return [...picked, ...rest.slice(0, Math.max(0, limit - picked.length))];
}

/** Spotlight pages: the sticker that lands after the last note. */
export function SceneStamp({ draft, i, edit }: { draft: Draft; i: number; edit: Edit }) {
  const scene = draft.story.scenes[i];
  if (scene.type !== "spotlight") return null;
  return (
    <SceneReaction
      draft={draft}
      title="Stamp after the last note"
      value={scene.stamp === undefined ? "yay" : (scene.stamp ?? undefined)}
      onChange={(stamp) => edit(updateScene(draft, i, { stamp: stamp ?? null } as Partial<Scene>))}
    />
  );
}

export function SceneColours({
  draft,
  i,
  edit,
}: {
  draft: Draft;
  i: number;
  edit: Edit;
}) {
  const scene = draft.story.scenes[i];
  const merged = { ...draft.story.palette, ...scene.palette };
  const overridden = scene.palette && Object.keys(scene.palette).length > 0;
  return (
    <Group
      title="Colours"
      action={
        overridden && (
          <IconAction
            label="Back to the template colours"
            onClick={() => edit(updateScene(draft, i, { palette: undefined }))}
          >
            <RotateCcw className="size-4" />
          </IconAction>
        )
      }
    >
      <p className="text-xs text-muted">
        Only this page changes.
      </p>
      <div className="grid gap-2">
        {paletteFields.slice(0, 4).map((f) => (
          <ColorInput
            key={f.key}
            label={f.label}
            value={merged[f.key]}
            onChange={(v) =>
              edit(
                updateScene(draft, i, {
                  palette: { ...scene.palette, [f.key]: v },
                }),
                `${i}-pal-${f.key}`,
              )
            }
          />
        ))}
      </div>
    </Group>
  );
}

/* ───────────── One item inside a scene ───────────── */

function ItemInspector({
  draft,
  i,
  j,
  list,
  setSel,
  edit,
}: {
  draft: Draft;
  i: number;
  j: number;
  list: NonNullable<ReturnType<typeof childField>>;
  setSel: (s: Selection) => void;
  edit: Edit;
}) {
  const scene = draft.story.scenes[i];
  const items = readItems(scene, list.key);
  const item = items[j];
  const set = (value: unknown) =>
    edit(updateItem(draft, i, list.key, j, value), `${i}-${list.key}-${j}`);

  return (
    <Panel
      crumbs={[
        {
          label: sceneSchemas[scene.type].name,
          onClick: () => setSel({ scene: i, item: null }),
        },
        { label: `${list.itemLabel} ${j + 1}` },
      ]}
      actions={
        <>
          <IconAction
            label="Duplicate"
            disabled={items.length >= list.max}
            onClick={() => {
              edit(duplicateItem(draft, i, list.key, j));
              setSel({ scene: i, item: j + 1 });
            }}
          >
            <Copy className="size-4" />
          </IconAction>
          <IconAction
            label="Move up"
            disabled={j === 0}
            onClick={() => {
              edit(moveItem(draft, i, list.key, j, j - 1));
              setSel({ scene: i, item: j - 1 });
            }}
          >
            <ArrowUp className="size-4" />
          </IconAction>
          <IconAction
            label="Move down"
            disabled={j === items.length - 1}
            onClick={() => {
              edit(moveItem(draft, i, list.key, j, j + 1));
              setSel({ scene: i, item: j + 1 });
            }}
          >
            <ArrowDown className="size-4" />
          </IconAction>
          <span className="flex-1" />
          <IconAction
            label={`Remove this ${list.itemLabel.toLowerCase()}`}
            danger
            disabled={items.length <= 1}
            onClick={() => {
              const next = deleteSelected(draft, { scene: i, item: j, field: list.key });
              if (!next) return;
              edit(next.draft);
              setSel(next.sel);
            }}
          >
            <Trash2 className="size-4" />
          </IconAction>
        </>
      }
    >
      <Group title="Content">
        {list.kind === "strings" ? (
          <>
            {(() => {
              const itemStr = showNames(String(item ?? ""), draft.story);
              const charLimit = ("charMax" in list && typeof list.charMax === "number") ? list.charMax : 800;
              return (
                <Field label={list.itemLabel} counter={`${itemStr.length}/${charLimit}`}>
                  <TextArea
                    value={itemStr}
                    maxLength={charLimit}
                    onChange={(e) => set(keepNames(e.target.value, draft.story))}
                  />
                </Field>
              );
            })()}
            <FieldFontPicker
              value={scene.fonts?.[`${list.key}:${j}`]}
              sample={String(item ?? "")}
              onChange={(id) => edit(setFieldFont(draft, i, `${list.key}:${j}`, id), `${i}-font-${list.key}-${j}`)}
            />
            <LayerPositionControl
              label={`${list.itemLabel} position`}
              position={scene.positions?.[`${list.key}:${j}`]}
              onChange={(pos) => edit(setFieldPosition(draft, i, `${list.key}:${j}`, pos), `${i}-pos-${list.key}-${j}`)}
            />
          </>
        ) : (
          <>
            {list.item.map((f) => (
              <FieldEditor
                key={f.key}
                field={f}
                draft={draft}
                value={(item as Rec)[f.key]}
                onChange={(v) => set({ ...(item as Rec), [f.key]: v })}
                font={scene.fonts?.[`${f.key}:${j}`]}
                onFont={(id) => edit(setFieldFont(draft, i, `${f.key}:${j}`, id), `${i}-font-${f.key}-${j}`)}
              />
            ))}
            <LayerPositionControl
              label={`${list.itemLabel} position`}
              position={scene.positions?.[`${list.key}:${j}`]}
              onChange={(pos) => edit(setFieldPosition(draft, i, `${list.key}:${j}`, pos), `${i}-pos-${list.key}-${j}`)}
            />
          </>
        )}
        {(list.key === "photos" || list.key === "songs") && (
          <PhotoPicker
            draft={draft}
            src={(item as Rec).src as string | undefined}
            onChange={(src) => set({ ...(item as Rec), src })}
          />
        )}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSel({ scene: i, item: null, field: null })}
            className="text-xs text-muted hover:text-ink underline"
          >
            ← Back to all ${sceneSchemas[scene.type].name} fields
          </button>
        </div>
        {list.key === "songs" && (
          <TrackField
            value={{
              link: (item as Rec).link as string | undefined,
              file: (item as Rec).file as string | undefined,
              fileName: (item as Rec).fileName as string | undefined,
            }}
            onChange={(track) =>
              set({
                ...(item as Rec),
                link: track?.link,
                file: track?.file,
                fileName: track?.fileName,
              })
            }
          />
        )}
      </Group>
      <button
        type="button"
        disabled={items.length <= 1}
        onClick={() => {
          const next = deleteSelected(draft, { scene: i, item: j, field: list.key });
          if (!next) return;
          edit(next.draft);
          setSel(next.sel);
        }}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose/30 text-sm font-medium text-rose-deep disabled:opacity-40"
      >
        <Trash2 className="size-4" /> Remove this {list.itemLabel.toLowerCase()}
      </button>
    </Panel>
  );
}

export function PhotoPicker({
  draft,
  src,
  onChange,
  label = "Photo",
  hint,
  roomy,
  highlight,
  hideLabel,
}: {
  draft: Draft;
  src?: string;
  onChange: (src: string | undefined) => void;
  label?: string;
  hint?: string;
  roomy?: boolean;
  highlight?: boolean;
  hideLabel?: boolean;
}) {
  return (
    <Field label={label} hint={hint} roomy={roomy} highlight={highlight} hideLabel={hideLabel}>
      <div className="flex items-center gap-3">
        <label className={cn("relative grid shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl bg-line/60 text-muted", roomy ? "size-24" : "size-20")}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <FileCropInput onDone={(urls) => onChange(urls[0])} />
        </label>
        <div className="flex flex-col gap-1.5 text-xs text-muted">
          <span>Tap the square to upload and crop, or pick from your assets.</span>
          {src && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="flex items-center gap-1 text-rose-deep"
            >
              <X className="size-3" /> Remove photo
            </button>
          )}
        </div>
      </div>
      {draft.assets.length > 0 && (
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {draft.assets.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange(a.src)}
              className={cn(
                "aspect-square overflow-hidden rounded-lg ring-2",
                a.src === src ? "ring-ink" : "ring-transparent",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.src}
                alt={a.name}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}

/* ───────────── Field rendering ───────────── */

export { keepNames, showNames } from "@/lib/gift-names";

export function FieldEditor({
  field,
  value,
  onChange,
  draft,
  roomy,
  highlight,
  hideLabel,
  font,
  onFont,
  position,
  onPosition,
  onRemove,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  draft: Draft;
  roomy?: boolean;
  highlight?: boolean;
  hideLabel?: boolean;
  font?: FontId;
  onFont?: (id?: FontId) => void;
  position?: LayerPosition;
  onPosition?: (pos: LayerPosition) => void;
  onRemove?: () => void;
}) {
  const input = roomy ? "min-h-12 text-base" : undefined;
  const names = draft.story;
  switch (field.kind) {
    case "sticker":
      return (
        <SceneReaction
          draft={draft}
          value={value as AnyStickerId | undefined}
          onChange={(id) => onChange(id)}
          title={field.label}
          bare={hideLabel}
        />
      );
    case "image":
      return (
        <div>
          <PhotoPicker
            draft={draft}
            label={field.label}
            hint={field.help}
            src={value as string | undefined}
            onChange={onChange}
            roomy={roomy}
            highlight={highlight}
            hideLabel={hideLabel}
          />
          {onRemove && String(value ?? "") && (
            <button type="button" onClick={onRemove} className="mt-1.5 text-sm text-rose-deep">
              Remove from this page
            </button>
          )}
        </div>
      );
    case "text":
      return (
        <div>
          <Field label={field.label} hint={field.help} roomy={roomy} highlight={highlight} hideLabel={hideLabel}>
            <TextInput
              value={showNames(String(value ?? ""), names)}
              maxLength={field.max}
              placeholder={field.placeholder}
              onChange={(e) => onChange(keepNames(e.target.value, names))}
              className={input}
            />
          </Field>
          {onFont && <FieldFontPicker value={font} sample={String(value ?? "")} onChange={onFont} />}
          {onRemove && String(value ?? "") ? (
            <button type="button" onClick={onRemove} className="mt-1.5 text-sm text-rose-deep">
              Remove from this page
            </button>
          ) : null}
        </div>
      );
    case "textarea":
      return (
        <div>
          <Field label={field.label} hint={field.help} roomy={roomy} highlight={highlight} hideLabel={hideLabel}>
            <TextArea
              value={showNames(String(value ?? ""), names)}
              maxLength={field.max}
              onChange={(e) => onChange(keepNames(e.target.value, names))}
              className={input}
            />
          </Field>
          {onFont && <FieldFontPicker value={font} sample={String(value ?? "")} onChange={onFont} />}
          {onRemove && String(value ?? "") ? (
            <button type="button" onClick={onRemove} className="mt-1.5 text-sm text-rose-deep">
              Remove from this page
            </button>
          ) : null}
        </div>
      );
    case "number":
      return (
        <Field label={field.label} roomy={roomy} highlight={highlight} hideLabel={hideLabel}>
          <NumberInput
            value={Number(value ?? field.min)}
            min={field.min}
            max={field.max}
            onChange={onChange}
            className={input}
          />
        </Field>
      );
    case "select":
      return (
        <Field label={field.label} roomy={roomy} highlight={highlight} hideLabel={hideLabel}>
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={cn("w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-ink/40", input)}
          >
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      );
    case "toggle":
      return (
        <Toggle label={field.label} checked={!!value} onChange={onChange} />
      );
    case "multi": {
      const chosen = (value as string[]) ?? [];
      return (
        <Field label={`${field.label} (${field.min}–${field.max})`} roomy={roomy} highlight={highlight} hideLabel={hideLabel}>
          <div className="flex flex-wrap gap-2">
            {field.options.map((o) => {
              const on = chosen.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    if (on && chosen.length > field.min)
                      onChange(chosen.filter((c) => c !== o.value));
                    if (!on && chosen.length < field.max)
                      onChange([...chosen, o.value]);
                  }}
                  className={cn(
                    "rounded-full border px-3 text-sm",
                    roomy ? "min-h-11 px-4 text-base" : "py-1.5",
                    on ? "border-ink bg-ink text-paper" : "border-line",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </Field>
      );
    }
    case "strings": {
      // Nested lists (e.g. a quiz question's answers) are edited inline.
      const items = (value as string[]) ?? [];
      return (
        <Field label={field.label} roomy={roomy} highlight={highlight} hideLabel={hideLabel}>
          <div className="space-y-2">
            {items.map((s, k) => (
              <div key={k} className="flex items-center gap-2">
                <TextInput
                  value={showNames(s, names)}
                  className={roomy ? "min-h-12 text-base" : "py-2"}
                  onChange={(e) =>
                    onChange(
                      items.map((x, m) => (m === k ? keepNames(e.target.value, names) : x)),
                    )
                  }
                />
                <IconAction
                  label="Remove"
                  disabled={items.length <= 1}
                  onClick={() => onChange(items.filter((_, m) => m !== k))}
                >
                  <X className="size-4" />
                </IconAction>
              </div>
            ))}
            {items.length < field.max && (
              <button
                type="button"
                onClick={() => onChange([...items, ""])}
                className={cn("flex items-center gap-1.5 text-muted hover:text-ink", roomy ? "min-h-11 text-base" : "text-sm")}
              >
                <Plus className="size-3.5" /> Add{" "}
                {field.itemLabel.toLowerCase()}
              </button>
            )}
          </div>
        </Field>
      );
    }
    case "list":
      return null;
  }
}

/* ───────────── Layout bits ───────────── */

function Panel({
  title,
  subtitle,
  crumbs,
  actions,
  children,
}: {
  title?: string;
  subtitle?: string;
  crumbs?: { label: string; onClick?: () => void }[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 border-b border-line bg-cream/95 px-5 pb-3 pt-4 backdrop-blur">
        {crumbs ? (
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {crumbs.map((c, k) => (
              <span key={k} className="flex items-center gap-1">
                {k > 0 && <ChevronRight className="size-3.5 text-muted" />}
                {c.onClick ? (
                  <button
                    type="button"
                    onClick={c.onClick}
                    className="text-muted hover:text-ink"
                  >
                    {c.label}
                  </button>
                ) : (
                  <span className="font-medium">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <>
            <p className="font-medium">{title}</p>
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </>
        )}
        {actions && (
          <div className="mt-2 flex items-center gap-0.5 rounded-2xl border border-line bg-paper/70 p-0.5">
            {actions}
          </div>
        )}
      </div>
      <div className="space-y-6 px-5 py-5">{children}</div>
    </div>
  );
}

function Group({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function IconAction({
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
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-8 place-items-center rounded-lg transition-colors hover:bg-paper disabled:opacity-30",
        danger ? "text-rose-deep" : "text-ink/70",
      )}
    >
      {children}
    </button>
  );
}


export function LayerPositionControl({
  position,
  onChange,
  label = "Layer position",
}: {
  position?: LayerPosition;
  onChange: (next: LayerPosition) => void;
  label?: string;
}) {
  const isLocked = position?.locked !== false; // Locked by default!
  const x = position?.x ?? 0;
  const y = position?.y ?? 0;

  return (
    <div className="mt-2.5 rounded-xl border border-line bg-paper/60 p-2.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          {isLocked ? (
            <>
              <LockIcon className="size-3.5 text-muted" />
              <span className="text-muted">{label}: <span className="font-semibold text-ink">Locked</span></span>
            </>
          ) : (
            <>
              <UnlockIcon className="size-3.5 text-amber-600" />
              <span className="text-amber-700 font-semibold">{label}: Unlocked</span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...position, locked: !isLocked })}
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
            isLocked
              ? "bg-cream text-ink hover:bg-blush/60 border border-line"
              : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300",
          )}
        >
          {isLocked ? "Unlock to move" : "Lock position"}
        </button>
      </div>

      {!isLocked && (
        <div className="mt-2 space-y-2 border-t border-line/60 pt-2">
          <div>
            <div className="flex justify-between text-[10px] text-muted">
              <span>Horizontal offset (X)</span>
              <span className="font-mono">{x > 0 ? `+${x}px` : `${x}px`}</span>
            </div>
            <input
              type="range"
              min={-120}
              max={120}
              value={x}
              onChange={(e) => onChange({ ...position, locked: false, x: Number(e.target.value) })}
              className="mt-1 h-1.5 w-full cursor-pointer rounded-lg bg-line accent-ink"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-muted">
              <span>Vertical offset (Y)</span>
              <span className="font-mono">{y > 0 ? `+${y}px` : `${y}px`}</span>
            </div>
            <input
              type="range"
              min={-120}
              max={120}
              value={y}
              onChange={(e) => onChange({ ...position, locked: false, y: Number(e.target.value) })}
              className="mt-1 h-1.5 w-full cursor-pointer rounded-lg bg-line accent-ink"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted">Nudge:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Nudge left"
                onClick={() => onChange({ ...position, locked: false, x: Math.max(-120, x - 5) })}
                className="grid size-6 place-items-center rounded bg-paper text-ink shadow-xs hover:bg-cream"
              >
                ←
              </button>
              <button
                type="button"
                title="Nudge right"
                onClick={() => onChange({ ...position, locked: false, x: Math.min(120, x + 5) })}
                className="grid size-6 place-items-center rounded bg-paper text-ink shadow-xs hover:bg-cream"
              >
                →
              </button>
              <button
                type="button"
                title="Nudge up"
                onClick={() => onChange({ ...position, locked: false, y: Math.max(-120, y - 5) })}
                className="grid size-6 place-items-center rounded bg-paper text-ink shadow-xs hover:bg-cream"
              >
                ↑
              </button>
              <button
                type="button"
                title="Nudge down"
                onClick={() => onChange({ ...position, locked: false, y: Math.min(120, y + 5) })}
                className="grid size-6 place-items-center rounded bg-paper text-ink shadow-xs hover:bg-cream"
              >
                ↓
              </button>
            </div>
            {(x !== 0 || y !== 0) && (
              <button
                type="button"
                onClick={() => onChange({ ...position, locked: false, x: 0, y: 0 })}
                className="text-[10px] text-muted underline hover:text-ink"
              >
                Reset (0,0)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
