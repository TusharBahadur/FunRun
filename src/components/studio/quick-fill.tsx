"use client";

import { ArrowLeft, Check, Eye, ImagePlus, Images, PenLine } from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";
import type { Scene } from "@/components/story/types";
import { keepNames, showNames } from "@/lib/gift-names";
import { cn } from "@/lib/utils";
import type { Draft } from "./draft-store";
import { FileCropInput } from "./image-crop";
import { readItems, updateItem, updateScene } from "./ops";
import { sceneSchemas } from "./schema";
import { TrackField } from "./track-field";

/**
 * "Make it in a minute": a few questions, one per screen, that fill in the
 * personal bits of a template — names, photos, song and the letter. Everything
 * else (headlines, games, stickers) stays as the template has it.
 */

type Edit = (next: Draft, tag?: string) => void;
type Slot = { scene: number; key: string; item?: number; label: string };
type Step = "names" | "photos" | "song" | "message" | "done";

/** Every place in the gift that takes a photo, in page order. */
export function photoSlots(scenes: Scene[]): Slot[] {
  const slots: Slot[] = [];
  scenes.forEach((scene, i) => {
    if (scene.hidden) return;
    const schema = sceneSchemas[scene.type];
    for (const f of schema.fields) {
      if (f.kind === "image") slots.push({ scene: i, key: f.key, label: f.label === "Photo" ? schema.name : f.label });
      if (f.kind === "list" && f.key === "photos") {
        readItems(scene, f.key).forEach((item, j) => {
          const caption = String((item as Record<string, unknown>).caption ?? "").trim();
          slots.push({ scene: i, key: f.key, item: j, label: caption || `${schema.name} ${j + 1}` });
        });
      }
    }
  });
  return slots;
}

function slotSrc(scenes: Scene[], s: Slot): string | undefined {
  const scene = scenes[s.scene] as unknown as Record<string, unknown>;
  if (s.item === undefined) return scene[s.key] as string | undefined;
  return (readItems(scenes[s.scene], s.key)[s.item] as Record<string, unknown> | undefined)?.src as string | undefined;
}

function setSlot(d: Draft, s: Slot, src: string): Draft {
  if (s.item === undefined) return updateScene(d, s.scene, { [s.key]: src });
  const item = readItems(d.story.scenes[s.scene], s.key)[s.item] as Record<string, unknown>;
  return updateItem(d, s.scene, s.key, s.item, { ...item, src });
}

/** The gift's letter, if it has one. */
function letterIndex(scenes: Scene[]) {
  return scenes.findIndex((s) => s.type === "letter" && !s.hidden);
}

export function QuickFill({
  draft,
  edit,
  saveNames,
  defaultFrom,
  demoNames,
  price,
  onPreview,
  onPublish,
  onFullEditor,
}: {
  draft: Draft;
  edit: Edit;
  saveNames: (to: string, from: string) => void;
  defaultFrom: string;
  /** The template's sample names: shown as empty boxes, not as their names. */
  demoNames: { recipient: string; sender: string };
  price: string;
  onPreview: () => void;
  onPublish: () => void;
  onFullEditor: () => void;
}) {
  const { story } = draft;
  const slots = photoSlots(story.scenes);
  const letter = letterIndex(story.scenes);
  const steps: Step[] = ["names", ...(slots.length ? (["photos"] as const) : []), "song", ...(letter >= 0 ? (["message"] as const) : []), "done"];
  const [at, setAt] = useState(0);
  const step = steps[Math.min(at, steps.length - 1)];
  const next = () => setAt((n) => Math.min(n + 1, steps.length - 1));
  const back = () => setAt((n) => Math.max(n - 1, 0));
  const accent = { "--btn-bg": story.palette.accent } as CSSProperties;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-cream">
      <header className="flex items-center gap-3 border-b border-line px-3 py-2.5">
        <button
          type="button"
          onClick={at === 0 ? onFullEditor : back}
          aria-label={at === 0 ? "Close" : "Back"}
          className="grid size-10 place-items-center rounded-full hover:bg-paper"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex flex-1 justify-center gap-1.5" aria-hidden>
          {steps.slice(0, -1).map((s, i) => (
            <span key={s} className={cn("h-1.5 rounded-full transition-all", i === at ? "w-6" : "w-1.5")} style={{ backgroundColor: i <= at ? story.palette.accent : "rgb(27 18 21 / 0.15)" }} />
          ))}
        </div>
        <button type="button" onClick={onFullEditor} className="px-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          Full editor
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-y-auto px-5 pb-6 pt-6">
        {step === "names" && (
          <NamesStep
            key="names"
            to={story.recipient === demoNames.recipient ? "" : story.recipient}
            from={story.sender === demoNames.sender ? defaultFrom : story.sender}
            accent={accent}
            onNext={(to, from) => {
              saveNames(to, from);
              next();
            }}
          />
        )}

        {step === "photos" && (
          <Shell
            title="Add your photos"
            sub={`This gift has ${slots.length === 1 ? "one spot" : `${slots.length} spots`} for photos. Tap one, or add several at once.`}
            footer={
              <Next accent={accent} onClick={next} label={slots.some((s) => slotSrc(story.scenes, s)) ? "Next" : "Skip for now"} />
            }
          >
            <div className="grid grid-cols-3 gap-2.5">
              {slots.map((s, n) => {
                const src = slotSrc(story.scenes, s);
                return (
                  <label key={`${s.scene}-${s.key}-${s.item ?? ""}`} className="block cursor-pointer">
                    <span className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-dashed border-ink/25 bg-paper text-muted">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt="" className="size-full object-cover" />
                      ) : (
                        <ImagePlus className="size-5" />
                      )}
                      <FileCropInput onDone={(urls) => edit(setSlot(draft, s, urls[0]), `quick-photo-${n}`)} />
                    </span>
                    <span className="mt-1 block truncate text-center text-xs text-muted">{showNames(s.label, story)}</span>
                  </label>
                );
              })}
            </div>
            <label className="btn btn-paper mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 text-base">
              <Images className="size-4" /> Add several at once
              <FileCropInput
                multiple
                onDone={(urls) => {
                  // Fill the empty spots first, in order, then replace from the top.
                  const order = [...slots.filter((s) => !slotSrc(story.scenes, s)), ...slots.filter((s) => slotSrc(story.scenes, s))];
                  let d = draft;
                  urls.slice(0, order.length).forEach((url, k) => {
                    d = setSlot(d, order[k], url);
                  });
                  edit(d, "quick-photos");
                }}
              />
            </label>
          </Shell>
        )}

        {step === "song" && (
          <Shell
            title="Add a song"
            sub="It plays while they open the gift. Paste a YouTube link, or keep the one it comes with."
            footer={<Next accent={accent} onClick={next} label="Next" />}
          >
            <TrackField roomy value={story.track} onChange={(track) => edit({ ...draft, story: { ...story, track } }, "music")} />
          </Shell>
        )}

        {step === "message" && letter >= 0 && (
          <MessageStep
            key="message"
            draft={draft}
            index={letter}
            accent={accent}
            onSave={(paragraphs) => edit(updateScene(draft, letter, { paragraphs }), "quick-letter")}
            onNext={next}
          />
        )}

        {step === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="grid size-16 place-items-center rounded-full text-paper" style={{ backgroundColor: story.palette.accent }}>
              <Check className="size-8" />
            </span>
            <h2 className="type-heading mt-5 text-3xl">Your gift for {story.recipient} is ready</h2>
            <p className="mt-2 text-muted">Have a look, then make it live and send the link.</p>
            <div className="mt-8 w-full space-y-2.5">
              <button type="button" onClick={onPreview} className="btn btn-paper flex h-12 w-full items-center justify-center gap-2 text-base">
                <Eye className="size-4" /> Preview it
              </button>
              <button type="button" onClick={onPublish} className="btn btn-tint flex h-12 w-full items-center justify-center gap-2 text-base" style={accent}>
                Make it live · {price}
              </button>
              <button type="button" onClick={onFullEditor} className="flex h-11 w-full items-center justify-center gap-2 text-sm text-muted hover:text-ink">
                <PenLine className="size-4" /> Change more details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Shell({ title, sub, children, footer }: { title: string; sub: string; children: ReactNode; footer: ReactNode }) {
  return (
    <>
      <h2 className="type-heading text-[1.75rem] leading-tight">{title}</h2>
      <p className="mt-1.5 text-muted">{sub}</p>
      <div className="mt-6 flex-1">{children}</div>
      <div className="sticky bottom-0 mt-6 bg-cream pt-2">{footer}</div>
    </>
  );
}

function Next({ onClick, label, accent, disabled }: { onClick: () => void; label: string; accent: CSSProperties; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn btn-tint h-12 w-full text-base disabled:opacity-40" style={accent}>
      {label}
    </button>
  );
}

const input =
  "mt-1.5 block min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none placeholder:text-muted/60 focus:border-ink/40";

function NamesStep({ to: start, from: startFrom, accent, onNext }: { to: string; from: string; accent: CSSProperties; onNext: (to: string, from: string) => void }) {
  const [to, setTo] = useState(start);
  const [from, setFrom] = useState(startFrom);
  return (
    <Shell
      title="Who’s it for?"
      sub="Their name goes on every page."
      footer={<Next accent={accent} disabled={!to.trim()} onClick={() => onNext(to.trim(), from.trim())} label="Next" />}
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-base font-medium">To</span>
          <input value={to} onChange={(e) => setTo(e.target.value)} maxLength={30} placeholder="Their name" autoComplete="off" className={input} />
        </label>
        <label className="block">
          <span className="text-base font-medium">From</span>
          <input value={from} onChange={(e) => setFrom(e.target.value)} maxLength={30} placeholder="Your name" autoComplete="off" className={input} />
        </label>
      </div>
    </Shell>
  );
}

function MessageStep({
  draft,
  index,
  accent,
  onSave,
  onNext,
}: {
  draft: Draft;
  index: number;
  accent: CSSProperties;
  onSave: (paragraphs: string[]) => void;
  onNext: () => void;
}) {
  const scene = draft.story.scenes[index] as Scene & { paragraphs?: string[] };
  const [text, setText] = useState(() => showNames((scene.paragraphs ?? []).join("\n\n"), draft.story));
  return (
    <Shell
      title={`Your letter to ${draft.story.recipient}`}
      sub="We’ve started it for you. Keep it, tweak it, or write your own. A blank line starts a new paragraph."
      footer={<Next accent={accent} onClick={onNext} label="Next" />}
    >
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const paragraphs = e.target.value
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .slice(0, 6)
            .map((p) => keepNames(p, draft.story));
          onSave(paragraphs.length ? paragraphs : [""]);
        }}
        rows={12}
        maxLength={4000}
        className="block min-h-72 w-full rounded-2xl border border-line bg-paper p-4 text-base leading-relaxed outline-none focus:border-ink/40"
      />
    </Shell>
  );
}
