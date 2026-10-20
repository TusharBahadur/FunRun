"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  ColorInput,
  Field,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/editor/fields";
import {
  accentMoodOrder,
  accentMoods,
  accentMoodStyle,
} from "@/components/experiences/birthday/accent-moods";
import type { StoryPalette } from "@/components/story/types";
import { palettes } from "@/data/stories/shared";
import { cn } from "@/lib/utils";
import { imageToDataUrl, type Draft } from "./draft-store";
import {
  addItem,
  deleteItem,
  deleteScene,
  duplicateItem,
  duplicateScene,
  moveItem,
  moveScene,
  readItems,
  updateItem,
  updateScene,
} from "./ops";
import { childField, sceneSchemas, type FieldDef } from "./schema";
import {
  boardStickerIds,
  drawnStickerIds,
  Sticker,
  stickerName,
  type AnyStickerId,
  type StickerPlacement,
  type StickerSpot,
} from "@/components/story/stickers";

export type Selection = { scene: number | null; item: number | null };
type Edit = (next: Draft, tag?: string) => void;
type Rec = Record<string, unknown>;

const paletteFields: { key: keyof StoryPalette; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "fg", label: "Text" },
  { key: "accent", label: "Highlight & buttons" },
  { key: "cream", label: "Cards & paper" },
  { key: "ink", label: "Text on cards" },
  { key: "pink", label: "Soft tint" },
  { key: "gold", label: "Sparkle & flames" },
];

const melodyOptions = [
  { value: "birthday", label: "Happy Birthday (music box)" },
  { value: "lullaby", label: "Lullaby: slow and tender" },
  { value: "waltz", label: "Waltz: romantic" },
  { value: "sunny", label: "Sunny: bright and bouncy" },
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
  if (sel.scene === null || !draft.story.scenes[sel.scene])
    return <PageSettings draft={draft} edit={edit} />;
  const i = sel.scene;
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
  return <SceneInspector draft={draft} i={i} setSel={setSel} edit={edit} />;
}

/* ───────────── Whole-gift settings ───────────── */

function PageSettings({ draft, edit }: { draft: Draft; edit: Edit }) {
  const { story } = draft;
  const setStory = (patch: Partial<Draft["story"]>, tag?: string) =>
    edit({ ...draft, story: { ...story, ...patch } }, tag);

  return (
    <Panel title="Page" subtitle="Settings for the whole gift">
      <Group title="Names">
        <div className="grid grid-cols-2 gap-3">
          <Field label="For">
            <TextInput
              value={story.recipient}
              maxLength={30}
              onChange={(e) => setStory({ recipient: e.target.value }, "to")}
            />
          </Field>
          <Field label="From">
            <TextInput
              value={story.sender}
              maxLength={30}
              onChange={(e) => setStory({ sender: e.target.value }, "from")}
            />
          </Field>
        </div>
        <p className="text-xs text-muted">
          Anywhere you type <b className="text-ink">{"{to}"}</b> or{" "}
          <b className="text-ink">{"{from}"}</b>, these names appear.
        </p>
      </Group>

      <Group title="Colour theme">
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(palettes).map(([id, p]) => (
            <button
              key={id}
              type="button"
              title={id}
              onClick={() => setStory({ palette: { ...p } })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border-2 p-1.5",
                story.palette.bg === p.bg && story.palette.accent === p.accent
                  ? "border-ink"
                  : "border-transparent hover:border-line",
              )}
            >
              <span
                className="grid size-10 place-items-center rounded-lg"
                style={{ backgroundColor: p.bg }}
              >
                <span
                  className="size-4 rounded-full"
                  style={{ backgroundColor: p.accent }}
                />
              </span>
              <span className="type-label text-[9px] capitalize text-muted">
                {id}
              </span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Colours">
        <div className="grid gap-2">
          {paletteFields.map((f) => (
            <ColorInput
              key={f.key}
              label={f.label}
              value={story.palette[f.key]}
              onChange={(v) =>
                setStory(
                  { palette: { ...story.palette, [f.key]: v } },
                  `pal-${f.key}`,
                )
              }
            />
          ))}
        </div>
      </Group>

      <Group title="Highlight style">
        <div className="grid grid-cols-2 gap-2">
          {accentMoodOrder.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setStory({ accentFont: m })}
              className={cn(
                "rounded-xl border px-3 py-2 text-left",
                (story.accentFont ?? "classic") === m
                  ? "border-ink bg-paper"
                  : "border-line hover:border-ink/30",
              )}
            >
              <span
                className="block text-xl leading-tight"
                style={{ ...accentMoodStyle(m), color: "var(--color-rose)" }}
              >
                {story.recipient || "Maya"}
              </span>
              <span className="type-label text-[9px] text-muted">
                {accentMoods[m].name}
              </span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Music">
        <select
          value={story.melody}
          onChange={(e) =>
            setStory({ melody: e.target.value as Draft["story"]["melody"] })
          }
          className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-ink/40"
        >
          {melodyOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Group>
    </Panel>
  );
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
        { label: "Page", onClick: () => setSel({ scene: null, item: null }) },
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
              value={(scene as unknown as Rec)[f.key]}
              onChange={(v) => set(f.key, v)}
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
              <li key={j}>
                <button
                  type="button"
                  onClick={() => setSel({ scene: i, item: j })}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-cream"
                >
                  <span className="type-label w-5 text-[10px] text-muted">
                    {j + 1}
                  </span>
                  <span className="flex-1 truncate">
                    {list.kind === "list"
                      ? list.title(item as Rec)
                      : String(item)}
                  </span>
                  <ChevronRight className="size-4 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </Group>
      )}

      <SceneStickers
        stickers={scene.stickers ?? []}
        onChange={(next) =>
          edit(updateScene(draft, i, { stickers: next.length ? next : undefined }))
        }
      />

      <SceneReaction
        value={scene.reaction}
        onChange={(reaction) => edit(updateScene(draft, i, { reaction }))}
      />

      <SceneColours draft={draft} i={i} edit={edit} />
    </Panel>
  );
}

const STICKER_SPOTS: StickerSpot[] = ["tr", "bl", "tl", "br", "mr", "ml"];
const MAX_STICKERS = 3;

/** Pick up to three stickers; each takes the next free corner. */
function SceneStickers({
  stickers,
  onChange,
}: {
  stickers: StickerPlacement[];
  onChange: (next: StickerPlacement[]) => void;
}) {
  const toggle = (id: AnyStickerId) => {
    if (stickers.some((s) => s.id === id)) {
      onChange(stickers.filter((s) => s.id !== id));
      return;
    }
    if (stickers.length >= MAX_STICKERS) return;
    const at = STICKER_SPOTS.find((spot) => !stickers.some((s) => s.at === spot))!;
    onChange([...stickers, { id, at }]);
  };
  return (
    <Group title={`Stickers ${stickers.length} / ${MAX_STICKERS}`}>
      <StickerGrid
        selected={stickers.map((s) => s.id)}
        full={stickers.length >= MAX_STICKERS}
        onPick={toggle}
      />
    </Group>
  );
}

/** The sticker that pops up once the page is finished. */
function SceneReaction({
  value,
  onChange,
}: {
  value?: AnyStickerId;
  onChange: (next: AnyStickerId | undefined) => void;
}) {
  return (
    <Group
      title="Reaction when finished"
      action={
        value && (
          <IconAction label="No reaction" onClick={() => onChange(undefined)}>
            <X className="size-4" />
          </IconAction>
        )
      }
    >
      <StickerGrid
        selected={value ? [value] : []}
        onPick={(id) => onChange(id === value ? undefined : id)}
      />
    </Group>
  );
}

function StickerGrid({
  selected,
  full = false,
  onPick,
}: {
  selected: AnyStickerId[];
  full?: boolean;
  onPick: (id: AnyStickerId) => void;
}) {
  const groups: { title: string; ids: AnyStickerId[] }[] = [
    { title: "Memes & doodles", ids: boardStickerIds },
    { title: "Animated", ids: drawnStickerIds },
  ];
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="type-label mb-1.5 text-[10px] text-muted">{g.title}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1.5">
            {g.ids.map((id) => {
              const on = selected.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  title={stickerName(id)}
                  aria-label={stickerName(id)}
                  aria-pressed={on}
                  onClick={() => onPick(id)}
                  disabled={!on && full}
                  className={cn(
                    "grid aspect-square max-w-20 place-items-center rounded-xl border p-1.5 transition-colors disabled:opacity-35",
                    on ? "border-ink bg-paper" : "border-line hover:border-ink/30",
                  )}
                >
                  <Sticker id={id} className="size-full shadow-none" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SceneColours({
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
            label="Use the page colours"
            onClick={() => edit(updateScene(draft, i, { palette: undefined }))}
          >
            <RotateCcw className="size-4" />
          </IconAction>
        )
      }
    >
      <p className="text-xs text-muted">
        Only this page changes. Whole-gift colours are under Page.
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
        { label: "Page", onClick: () => setSel({ scene: null, item: null }) },
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
            label="Delete"
            danger
            disabled={items.length <= 1}
            onClick={() => {
              edit(deleteItem(draft, i, list.key, j));
              setSel({ scene: i, item: Math.max(0, j - 1) });
            }}
          >
            <Trash2 className="size-4" />
          </IconAction>
        </>
      }
    >
      <Group title="Content">
        {list.kind === "strings" ? (
          <Field label={list.itemLabel}>
            <TextArea
              value={String(item ?? "")}
              maxLength={400}
              onChange={(e) => set(e.target.value)}
            />
          </Field>
        ) : (
          list.item.map((f) => (
            <FieldEditor
              key={f.key}
              field={f}
              draft={draft}
              value={(item as Rec)[f.key]}
              onChange={(v) => set({ ...(item as Rec), [f.key]: v })}
            />
          ))
        )}
        {(list.key === "photos" || list.key === "songs") && (
          <PhotoPicker
            draft={draft}
            src={(item as Rec).src as string | undefined}
            onChange={(src) => set({ ...(item as Rec), src })}
          />
        )}
      </Group>
    </Panel>
  );
}

function PhotoPicker({
  draft,
  src,
  onChange,
  label = "Photo",
  hint,
}: {
  draft: Draft;
  src?: string;
  onChange: (src: string | undefined) => void;
  label?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <label className="relative grid size-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl bg-line/60 text-muted">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) onChange(await imageToDataUrl(f));
            }}
          />
        </label>
        <div className="flex flex-col gap-1.5 text-xs text-muted">
          <span>Tap the square to upload, or pick from your assets.</span>
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

function FieldEditor({
  field,
  value,
  onChange,
  draft,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  draft: Draft;
}) {
  switch (field.kind) {
    case "image":
      return (
        <PhotoPicker
          draft={draft}
          label={field.label}
          hint={field.help}
          src={value as string | undefined}
          onChange={onChange}
        />
      );
    case "text":
      return (
        <Field label={field.label} hint={field.help}>
          <TextInput
            value={String(value ?? "")}
            maxLength={field.max}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    case "textarea":
      return (
        <Field label={field.label} hint={field.help}>
          <TextArea
            value={String(value ?? "")}
            maxLength={field.max}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    case "number":
      return (
        <Field label={field.label}>
          <TextInput
            type="number"
            min={field.min}
            max={field.max}
            value={Number(value ?? field.min)}
            onChange={(e) =>
              onChange(
                Math.min(
                  field.max,
                  Math.max(field.min, Number(e.target.value) || field.min),
                ),
              )
            }
          />
        </Field>
      );
    case "select":
      return (
        <Field label={field.label}>
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-ink/40"
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
        <Field label={`${field.label} (${field.min}–${field.max})`}>
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
                    "rounded-full border px-3 py-1.5 text-sm",
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
        <Field label={field.label}>
          <div className="space-y-2">
            {items.map((s, k) => (
              <div key={k} className="flex items-center gap-2">
                <TextInput
                  value={s}
                  className="py-2"
                  onChange={(e) =>
                    onChange(
                      items.map((x, m) => (m === k ? e.target.value : x)),
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
                className="flex items-center gap-1.5 text-sm text-muted hover:text-ink"
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
          <div className="mt-2 flex items-center gap-1">{actions}</div>
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
