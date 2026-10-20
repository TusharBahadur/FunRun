"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  LayoutList,
  PenLine,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { ColorInput, Field, TextArea, TextInput } from "@/components/editor/fields";
import type { AccentFont } from "@/components/experiences/birthday/types";
import type { GiftFont } from "@/components/story/gift-fonts";
import type { MelodyId } from "@/components/story/types";
import { palettes } from "@/data/stories/shared";
import { cn } from "@/lib/utils";
import type { Draft } from "./draft-store";
import { FontChoices } from "./font-choices";
import {
  FieldEditor,
  PhotoPicker,
  SceneColours,
  SceneReaction,
  SceneStickers,
  paletteFields,
  type Selection,
} from "./inspector";
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
import { childField, sceneSchemas, sceneSubtitle, type FieldDef } from "./schema";

type Edit = (next: Draft, tag?: string) => void;
type Mode = "simple" | "advanced";
export type MobilePane = "edit" | "pages";

const melodyOptions: { value: MelodyId; label: string }[] = [
  { value: "birthday", label: "Happy Birthday, music box" },
  { value: "lullaby", label: "Lullaby, slow and tender" },
  { value: "waltz", label: "Waltz, romantic" },
  { value: "sunny", label: "Sunny, bright and bouncy" },
];

/** Words and photos. Labels, hints, counts and menus wait for Advanced. */
function isSimpleField(field: FieldDef) {
  if (field.key === "eyebrow" || field.key === "hint" || field.key === "done" || field.key === "nav") return false;
  return field.kind === "text" || field.kind === "textarea" || field.kind === "image" || field.kind === "list" || field.kind === "strings";
}

function isSimpleItemField(field: FieldDef) {
  return field.kind === "text" || field.kind === "textarea" || field.kind === "image" || field.kind === "strings";
}

export function MobileEditor({
  draft,
  edit,
  sel,
  setSel,
  pane,
  onAddSection,
}: {
  draft: Draft;
  edit: Edit;
  sel: Selection;
  setSel: (s: Selection) => void;
  pane: MobilePane;
  onAddSection: () => void;
}) {
  const [mode, setMode] = useState<Mode>("simple");
  return (
    <div className="bg-cream">
      {pane === "pages" ? (
        <Pages draft={draft} sel={sel} setSel={setSel} onAddSection={onAddSection} />
      ) : (
        <Editor draft={draft} edit={edit} sel={sel} setSel={setSel} mode={mode} setMode={setMode} />
      )}
    </div>
  );
}

export function MobileNav({ pane, onChange }: { pane: MobilePane; onChange: (pane: MobilePane) => void }) {
  const items: { id: MobilePane; label: string; icon: typeof PenLine }[] = [
    { id: "edit", label: "Edit", icon: PenLine },
    { id: "pages", label: "Pages", icon: LayoutList },
  ];
  return (
    <nav className="grid shrink-0 grid-cols-2 border-t border-line bg-paper pb-[max(0.35rem,env(safe-area-inset-bottom))]" aria-label="Editor">
      {items.map((item) => {
        const Icon = item.icon;
        const on = pane === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => onChange(item.id)}
            className={cn("flex h-14 flex-col items-center justify-center gap-0.5 text-xs", on ? "font-medium text-ink" : "text-muted")}
          >
            <Icon className="size-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function ModeSwitch({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-line/70 p-1" role="tablist" aria-label="Editing mode">
        {(["simple", "advanced"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn("h-11 rounded-xl text-base capitalize", mode === m ? "bg-paper font-medium shadow-sm" : "text-muted")}
          >
            {m}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm leading-snug text-muted">
        {mode === "simple" ? "The words, photos and fonts. Start here." : "Stickers, colours, music, and moving pages around."}
      </p>
    </div>
  );
}

function Editor({
  draft,
  edit,
  sel,
  setSel,
  mode,
  setMode,
}: {
  draft: Draft;
  edit: Edit;
  sel: Selection;
  setSel: (s: Selection) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const scenes = draft.story.scenes;
  const i = sel.scene;
  const scene = i !== null ? scenes[i] : undefined;
  const list = scene ? childField(scene.type) : undefined;
  const item = scene && list && sel.item !== null ? readItems(scene, list.key)[sel.item] : undefined;

  return (
    <div>
      <div className="sticky top-0 z-10 space-y-3 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur">
        <ModeSwitch mode={mode} setMode={setMode} />
        {scene && item === undefined && (
          <div>
            <p className="text-sm text-muted">
              Page {i! + 1} of {scenes.length}
              {scene.hidden ? " · Hidden" : ""}
            </p>
            <p className="truncate text-lg font-medium leading-tight">{sceneSchemas[scene.type].name}</p>
          </div>
        )}
        {scene && item !== undefined && list && (
          <button
            type="button"
            onClick={() => setSel({ scene: i, item: null })}
            className="flex h-11 items-center gap-1 text-base font-medium"
          >
            <ChevronLeft className="size-5" />
            Back to {sceneSchemas[scene.type].name}
          </button>
        )}
        {!scene && <p className="text-lg font-medium">Whole gift</p>}
      </div>

      <div className="space-y-8 px-4 py-5">
        {!scene && <GiftSettings draft={draft} edit={edit} mode={mode} />}
        {scene && item === undefined && (
          <PageSettings draft={draft} edit={edit} i={i!} mode={mode} setSel={setSel} />
        )}
        {scene && item !== undefined && list && sel.item !== null && (
          <ItemSettings draft={draft} edit={edit} i={i!} j={sel.item} mode={mode} setSel={setSel} />
        )}
      </div>
    </div>
  );
}

function GiftSettings({ draft, edit, mode }: { draft: Draft; edit: Edit; mode: Mode }) {
  const { story } = draft;
  const setStory = (patch: Partial<Draft["story"]>, tag?: string) => edit({ ...draft, story: { ...story, ...patch } }, tag);
  return (
    <>
      <Names story={story} setStory={setStory} />
      <FontChoices
        font={story.font ?? "classic"}
        accent={story.accentFont ?? "classic"}
        sample={story.recipient || "Maya"}
        onFont={(font: GiftFont) => setStory({ font })}
        onAccent={(accentFont: AccentFont) => setStory({ accentFont })}
      />
      <Themes story={story} setStory={setStory} />
      {mode === "advanced" && (
        <>
          <section className="space-y-3">
            <h3 className="text-base font-medium">Music</h3>
            <select
              value={story.melody}
              onChange={(e) => setStory({ melody: e.target.value as MelodyId })}
              className="min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus:border-ink/40"
            >
              {melodyOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </section>
          <section className="space-y-3">
            <h3 className="text-base font-medium">Custom colours</h3>
            <p className="text-sm leading-snug text-muted">Fine-tune the theme. These apply to every page that doesn’t have its own colours.</p>
            <div className="grid gap-2">
              {paletteFields.map((f) => (
                <ColorInput
                  key={f.key}
                  label={f.label}
                  value={story.palette[f.key]}
                  onChange={(v) => setStory({ palette: { ...story.palette, [f.key]: v } }, `pal-${f.key}`)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}

function Names({
  story,
  setStory,
}: {
  story: Draft["story"];
  setStory: (patch: Partial<Draft["story"]>, tag?: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-medium">Names</h3>
      <p className="text-sm leading-snug text-muted">
        Type {"{to}"} or {"{from}"} in any line and these names fill in.
      </p>
      <Field label="For" roomy>
        <TextInput value={story.recipient} maxLength={30} onChange={(e) => setStory({ recipient: e.target.value }, "to")} className="min-h-12 text-base" />
      </Field>
      <Field label="From" roomy>
        <TextInput value={story.sender} maxLength={30} onChange={(e) => setStory({ sender: e.target.value }, "from")} className="min-h-12 text-base" />
      </Field>
    </section>
  );
}

function Themes({
  story,
  setStory,
}: {
  story: Draft["story"];
  setStory: (patch: Partial<Draft["story"]>) => void;
}) {
  return (
    <section>
      <h3 className="text-base font-medium">Colour theme</h3>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {Object.entries(palettes).map(([id, p]) => {
          const on = story.palette.bg === p.bg && story.palette.accent === p.accent;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setStory({ palette: { ...p } })}
              className={cn("flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-2", on ? "border-ink" : "border-transparent")}
            >
              <span className="grid size-12 place-items-center rounded-xl" style={{ backgroundColor: p.bg }}>
                <span className="size-5 rounded-full" style={{ backgroundColor: p.accent }} />
              </span>
              <span className="text-xs capitalize text-muted">{id}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PageSettings({
  draft,
  edit,
  i,
  mode,
  setSel,
}: {
  draft: Draft;
  edit: Edit;
  i: number;
  mode: Mode;
  setSel: (s: Selection) => void;
}) {
  const scene = draft.story.scenes[i];
  const schema = sceneSchemas[scene.type];
  const list = childField(scene.type);
  const fields = schema.fields.filter((f) => f !== list && (mode === "advanced" || isSimpleField(f)));
  const items = list ? readItems(scene, list.key) : [];
  const set = (key: string, value: unknown) => edit(updateScene(draft, i, { [key]: value }), `${i}-${key}`);

  return (
    <>
      <p className="text-sm leading-snug text-muted">{schema.blurb}</p>
      {fields.map((f) => (
        <FieldEditor
          key={f.key}
          field={f}
          draft={draft}
          roomy
          value={(scene as unknown as Record<string, unknown>)[f.key]}
          onChange={(v) => set(f.key, v)}
        />
      ))}

      {list && (
        <section className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-medium">{list.label}</h3>
            <span className="text-sm text-muted">
              {items.length} / {list.max}
            </span>
          </div>
          <ul className="space-y-2">
            {items.map((item, j) => (
              <li key={j}>
                <button
                  type="button"
                  onClick={() => setSel({ scene: i, item: j })}
                  className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-line bg-paper px-3 text-left"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-sm font-medium">{j + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-base">
                    {list.kind === "list" ? list.title(item as Record<string, unknown>) : String(item)}
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted" />
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
                setSel({ scene: i, item: items.length });
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/30 text-base font-medium"
            >
              <Plus className="size-4" /> Add {list.itemLabel.toLowerCase()}
            </button>
          )}
        </section>
      )}

      {mode === "simple" && (
        <button type="button" onClick={() => setSel({ scene: null, item: null })} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-paper text-base font-medium">
          <Type className="size-4" /> Fonts, names and colours
        </button>
      )}

      {mode === "advanced" && (
        <>
          <SceneStickers
            stickers={scene.stickers ?? []}
            onChange={(next) => edit(updateScene(draft, i, { stickers: next.length ? next : undefined }))}
          />
          <SceneReaction value={scene.reaction} onChange={(reaction) => edit(updateScene(draft, i, { reaction }))} />
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
            setSel({ scene: i + 1, item: null });
          }}
        >
          <Copy className="size-4" />
        </ActionButton>
        <ActionButton
          label="Move up"
          disabled={i === 0}
          onClick={() => {
            edit(moveScene(draft, i, i - 1));
            setSel({ scene: i - 1, item: null });
          }}
        >
          <ArrowUp className="size-4" />
        </ActionButton>
        <ActionButton
          label="Move down"
          disabled={i === count - 1}
          onClick={() => {
            edit(moveScene(draft, i, i + 1));
            setSel({ scene: i + 1, item: null });
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
          setSel({ scene: Math.max(0, i - 1), item: null });
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
  mode,
  setSel,
}: {
  draft: Draft;
  edit: Edit;
  i: number;
  j: number;
  mode: Mode;
  setSel: (s: Selection) => void;
}) {
  const scene = draft.story.scenes[i];
  const list = childField(scene.type)!;
  const items = readItems(scene, list.key);
  const item = items[j];
  const set = (value: unknown) => edit(updateItem(draft, i, list.key, j, value), `${i}-${list.key}-${j}`);
  const fields = list.kind === "list" ? list.item.filter((f) => mode === "advanced" || isSimpleItemField(f)) : [];

  return (
    <>
      <h2 className="text-lg font-medium">
        {list.itemLabel} {j + 1}
      </h2>
      {list.kind === "strings" ? (
        <Field label={list.itemLabel} roomy>
          <TextArea value={String(item ?? "")} maxLength={400} onChange={(e) => set(e.target.value)} className="min-h-28 text-base" />
        </Field>
      ) : (
        fields.map((f) => (
          <FieldEditor
            key={f.key}
            field={f}
            draft={draft}
            roomy
            value={(item as Record<string, unknown>)[f.key]}
            onChange={(v) => set({ ...(item as Record<string, unknown>), [f.key]: v })}
          />
        ))
      )}
      {(list.key === "photos" || list.key === "songs") && (
        <PhotoPicker draft={draft} roomy src={(item as Record<string, unknown>).src as string | undefined} onChange={(src) => set({ ...(item as Record<string, unknown>), src })} />
      )}
      {mode === "advanced" && (
        <div className="grid grid-cols-2 gap-2">
          <ActionButton
            label="Duplicate"
            disabled={items.length >= list.max}
            onClick={() => {
              edit(duplicateItem(draft, i, list.key, j));
              setSel({ scene: i, item: j + 1 });
            }}
          >
            <Copy className="size-4" />
          </ActionButton>
          <ActionButton
            label="Move up"
            disabled={j === 0}
            onClick={() => {
              edit(moveItem(draft, i, list.key, j, j - 1));
              setSel({ scene: i, item: j - 1 });
            }}
          >
            <ArrowUp className="size-4" />
          </ActionButton>
          <ActionButton
            label="Move down"
            disabled={j === items.length - 1}
            onClick={() => {
              edit(moveItem(draft, i, list.key, j, j + 1));
              setSel({ scene: i, item: j + 1 });
            }}
          >
            <ArrowDown className="size-4" />
          </ActionButton>
          <ActionButton
            label="Delete"
            danger
            disabled={items.length <= 1}
            onClick={() => {
              if (!window.confirm(`Delete this ${list.itemLabel.toLowerCase()}?`)) return;
              edit(deleteItem(draft, i, list.key, j));
              setSel({ scene: i, item: Math.max(0, j - 1) });
            }}
          >
            <Trash2 className="size-4" />
          </ActionButton>
        </div>
      )}
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
    <div className="px-4 py-4">
      <h2 className="text-lg font-medium">Pages</h2>
      <p className="mt-1 text-sm leading-snug text-muted">Tap a page to edit its words. The gift-wide settings are at the top.</p>
      <ul className="mt-4 space-y-2">
        <li>
          <button
            type="button"
            onClick={() => setSel({ scene: null, item: null })}
            className={cn(
              "flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3 text-left",
              sel.scene === null ? "border-ink bg-paper" : "border-line bg-paper/50",
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream">
              <Type className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-medium">Whole gift</span>
              <span className="block truncate text-sm text-muted">Names, fonts, colours</span>
            </span>
            <ChevronRight className="size-5 text-muted" />
          </button>
        </li>
        {scenes.map((scene, i) => {
          const schema = sceneSchemas[scene.type];
          const Icon = schema.icon;
          const on = sel.scene === i && sel.item === null;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setSel({ scene: i, item: null })}
                className={cn(
                  "flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3 text-left",
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
                  <span className="block truncate text-sm text-muted">{scene.hidden ? "Hidden" : sceneSubtitle(scene)}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted" />
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
