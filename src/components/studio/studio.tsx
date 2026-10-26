"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ChevronDown, Eye, LayoutGrid, Loader2, Redo2, RotateCcw, Undo2, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StudioFrameMessage } from "@/app/studio/frame/page";
import type { SceneType, Story } from "@/components/story/types";
import type { Template } from "@/lib/templates";
import { bindStoryNames, storyWithNames, type GiftNames } from "@/lib/gift-names";
import { useUser } from "@/lib/supabase/browser";
import { useProfile } from "@/lib/supabase/profile";
import { formatInr } from "@/lib/utils";
import { AddSection } from "./add-section";
import { Canvas, type DeviceMode } from "./canvas";
import { ChangeDesign } from "./change-design";
import { Checkout, hasPendingPublish } from "./checkout";
import { freshDraft, loadDraft, useDraft, type Draft } from "./draft-store";
import { ImageCropProvider } from "./image-crop";
import { Inspector, type Selection } from "./inspector";
import { isLook, LOOK } from "./look";
import { LeftPanel } from "./layers";
import { MobileEditor, PageSwitcher } from "./mobile-editor";
import { MobilePreview } from "./mobile-preview";
import { NamesDialog } from "./names-dialog";
import { deleteSelected, insertScene, updateScene } from "./ops";
import { sceneSchemas } from "./schema";

export type StudioTemplate = { slug: string; name: string; pricePaise: number; story: Story };

/** The workspace: layers on the left, live artboards in the middle, inspector on the right. */
export function Studio({
  template,
  designs,
  seedNames,
  askNames = false,
}: {
  template: StudioTemplate;
  designs: Template[];
  /** Demo To / From from the catalog recipe, so leftover names in copy can be retokenized. */
  seedNames: GiftNames;
  askNames?: boolean;
}) {
  const initial = useMemo(() => freshDraft(template.slug, `${template.name} for ${template.story.recipient}`, template.story), [template]);
  const { draft, edit, undo, redo, reset, canUndo, canRedo, saved } = useDraft(initial);

  const save = useCallback(
    (next: Draft, tag?: string) => {
      if (tag === "names" || tag === "names-to" || tag === "names-from") {
        next = {
          ...next,
          story: storyWithNames(
            draft.story,
            { recipient: next.story.recipient, sender: next.story.sender },
            seedNames,
          ),
        };
      }
      edit(next, tag);
    },
    [draft.story, edit, seedNames],
  );

  // Old drafts still have demo names written into lines. Turn those into {to} / {from}.
  useEffect(() => {
    const bound = bindStoryNames(draft.story, seedNames);
    if (JSON.stringify(bound.scenes) === JSON.stringify(draft.story.scenes)) return;
    edit({ ...draft, story: { ...draft.story, scenes: bound.scenes } }, "bind-names");
    // Only when the people change: copy is retokenized, then fill() picks up the new names.
  }, [draft.story.recipient, draft.story.sender, seedNames, edit, draft]);
  const [sel, setSel] = useState<Selection>({ scene: LOOK, item: null });
  const [device, setDevice] = useState<DeviceMode>("phone");
  const [run, setRun] = useState(0);
  const [adding, setAdding] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [preview, setPreview] = useState(false);
  const [names, setNames] = useState<"first" | "edit" | null>(null);
  const [designsOpen, setDesignsOpen] = useState(false);
  const router = useRouter();
  // Signed-in senders get their saved sign-off in the "From" line of new gifts.
  const { profile } = useProfile(useUser());
  const wide = useMinLg();

  // Back from Google sign-in mid-checkout: reopen it where they left off.
  useEffect(() => {
    if (!hasPendingPublish(initial.id)) return;
    const id = window.setTimeout(() => setCheckout(true), 300);
    return () => window.clearTimeout(id);
  }, [initial.id]);

  // A fresh gift starts by asking who it's for; a saved draft already knows.
  useEffect(() => {
    if (!askNames || loadDraft(initial.id)) return;
    const id = window.setTimeout(() => setNames("first"), 250);
    return () => window.clearTimeout(id);
  }, [askNames, initial.id]);

  function saveNames(to: string, from: string) {
    const { story } = draft;
    const recipient = to || story.recipient;
    const sender = from || story.sender;
    const autoName = draft.name === `${template.name} for ${story.recipient}`;
    save({ ...draft, name: autoName ? `${template.name} for ${recipient}` : draft.name, story: { ...story, recipient, sender } }, "names");
    setNames(null);
  }
  // A draft saved before the template was rewritten would hide the new version.
  const outdated = draft.base !== initial.base;
  const frames = useRef(new Map<string, HTMLIFrameElement>());
  const previewFrame = useRef<HTMLIFrameElement>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const scenes = draft.story.scenes;
  const sceneIdx = !isLook(sel.scene) && sel.scene !== null && scenes[sel.scene] ? sel.scene : 0;

  // The canvas always shows the selected page, even if it's hidden in the gift.
  const frameStory = useMemo<Story>(
    () => ({ ...draft.story, scenes: draft.story.scenes.map((s, i) => (i === sceneIdx ? { ...s, hidden: false } : s)) }),
    [draft.story, sceneIdx],
  );
  const visibleIndex = frameStory.scenes.slice(0, sceneIdx).filter((s) => !s.hidden).length;

  const postAll = useCallback(() => {
    const msg: StudioFrameMessage = {
      type: "tynitales:studio",
      story: frameStory,
      slug: template.slug,
      index: visibleIndex,
      run,
      mode: "edit",
      pick: { field: sel.field ?? null, item: sel.item },
    };
    frames.current.forEach((f) => f.contentWindow?.postMessage(msg, window.location.origin));
  }, [frameStory, template.slug, visibleIndex, run, sel.field, sel.item]);

  const postPreview = useCallback(() => {
    const msg: StudioFrameMessage = { type: "tynitales:studio", story: draft.story, slug: template.slug, index: 0, run, mode: "play" };
    previewFrame.current?.contentWindow?.postMessage(msg, window.location.origin);
  }, [draft.story, template.slug, run]);

  useEffect(() => {
    const id = setTimeout(postAll, 60);
    return () => clearTimeout(id);
  }, [postAll]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "tynitales:studio-ready") {
        postAll();
        if (preview) postPreview();
      }
      // Pressing Next inside an artboard moves the selection along with it.
      if (e.data?.type === "tynitales:studio-index" && e.source !== previewFrame.current?.contentWindow) {
        let seen = -1;
        const i = frameStory.scenes.findIndex((s) => !s.hidden && ++seen === e.data.index);
        if (i >= 0 && i !== sceneIdx) setSel({ scene: i, item: null, field: null });
      }
      if (e.data?.type === "tynitales:studio-pick" && e.source !== previewFrame.current?.contentWindow) {
        let scene = sceneIdx;
        if (typeof e.data.index === "number") {
          let seen = -1;
          const i = frameStory.scenes.findIndex((s) => !s.hidden && ++seen === e.data.index);
          if (i >= 0) scene = i;
        }
        setSel({ scene, item: e.data.item ?? null, field: e.data.field ?? null });
      }
      if (e.data?.type === "tynitales:studio-position" && e.source !== previewFrame.current?.contentWindow) {
        let scene = sceneIdx;
        if (typeof e.data.index === "number") {
          let seen = -1;
          const i = frameStory.scenes.findIndex((s) => !s.hidden && ++seen === e.data.index);
          if (i >= 0) scene = i;
        }
        const curDraft = draftRef.current;
        const s = curDraft.story.scenes[scene];
        if (s) {
          const curPos = s.positions?.[e.data.key] ?? {};
          const nextPositions = {
            ...(s.positions ?? {}),
            [e.data.key]: { ...curPos, ...e.data.pos, locked: false },
          };
          edit(updateScene(curDraft, scene, { positions: nextPositions }), `${scene}-pos-${e.data.key}`);
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [postAll, postPreview, preview, frameStory, sceneIdx]);

  // Keyboard: undo / redo, Escape to step out of an item to its page, Delete for the selected element.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName ?? "");
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (mod && e.key.toLowerCase() === "y" && !typing) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Escape" && !typing) setSel({ scene: sceneIdx, item: null, field: null });
      if ((e.key === "Backspace" || e.key === "Delete") && !typing && !mod) {
        const next = deleteSelected(draft, sel);
        if (!next) return;
        e.preventDefault();
        edit(next.draft);
        setSel(next.sel);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, sceneIdx, draft, sel, edit]);

  function addScene(type: SceneType) {
    const after = sel.scene ?? scenes.length - 1;
    edit(insertScene(draft, after, sceneSchemas[type].create()));
    setSel({ scene: after + 1, item: null, field: null });
    setAdding(false);
  }

  const sceneLabel = isLook(sel.scene) ? "Look" : sceneSchemas[scenes[sceneIdx]?.type ?? "letter"].name;

  return (
    <ImageCropProvider>
      {/* Pinned to the screen and unscrollable (clip, not hidden, so scrollIntoView can't move it), so the top bar never scrolls away. */}
      <div className="fixed inset-0 flex flex-col overflow-clip bg-cream text-ink">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line px-2 sm:gap-2 sm:px-3">
        <Link href={`/templates/${template.slug}`} aria-label="Back to the template" className="grid size-9 place-items-center rounded-lg hover:bg-paper">
          <ArrowLeft className="size-4" />
        </Link>
        <TopButton label="Undo (⌘Z)" onClick={undo} disabled={!canUndo}>
          <Undo2 className="size-4" />
        </TopButton>
        <span className="hidden items-center sm:flex">
          <TopButton label="Redo (⇧⌘Z)" onClick={redo} disabled={!canRedo}>
            <Redo2 className="size-4" />
          </TopButton>
          <TopButton
            label="Start over from the template"
            onClick={() => {
              if (window.confirm("Start over? This clears your changes and goes back to the original template.")) {
                reset(freshDraft(template.slug, initial.name, template.story));
                setSel({ scene: 0, item: null });
              }
            }}
          >
            <RotateCcw className="size-4" />
          </TopButton>
        </span>
        {designs.length > 0 && (
          <button
            type="button"
            onClick={() => setDesignsOpen(true)}
            aria-label="Change design"
            className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium hover:bg-paper sm:rounded-full sm:border sm:border-line sm:px-3"
          >
            <LayoutGrid className="size-4 shrink-0" />
            <span className="whitespace-nowrap">Change design</span>
          </button>
        )}

        <div className="mx-auto flex min-w-0 flex-1 items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setNames("edit")}
            aria-label={`Names: for ${draft.story.recipient}, from ${draft.story.sender}`}
            className="flex h-9 min-w-0 items-center gap-1 rounded-full px-2 text-sm font-medium hover:bg-paper sm:hidden"
          >
            <UserRound className="size-3.5 shrink-0 text-muted" />
            <span className="truncate">{draft.story.recipient}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted" />
          </button>
          <input
            value={draft.name}
            onChange={(e) => edit({ ...draft, name: e.target.value }, "name")}
            aria-label="Gift name"
            className="hidden w-full max-w-[280px] truncate rounded-lg bg-transparent px-2 py-1 text-center text-sm font-medium outline-none hover:bg-paper focus:bg-paper sm:block"
          />
          <span className="hidden sm:inline-flex">
            <TopButton label={`Names: for ${draft.story.recipient}, from ${draft.story.sender}`} onClick={() => setNames("edit")}>
              <UserRound className="size-4" />
            </TopButton>
          </span>
          <span className="type-label hidden shrink-0 items-center gap-1 text-[10px] text-muted md:flex">
            {saved === "saving" ? (
              <>
                <Loader2 className="size-3 animate-spin" /> Saving
              </>
            ) : saved === "failed" ? (
              <span className="text-rose-deep">Couldn’t save · try fewer photos</span>
            ) : (
              <>
                <Check className="size-3" /> Saved on this device
              </>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setPreview(true);
            setRun((r) => r + 1);
          }}
          aria-label="Preview"
          className="grid size-9 place-items-center rounded-full border border-line hover:bg-paper sm:hidden"
        >
          <Eye className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setPreview(true);
            setRun((r) => r + 1);
          }}
          className="hidden h-9 items-center gap-1.5 rounded-full border border-line px-4 text-sm hover:bg-paper sm:flex"
        >
          <Eye className="size-4" /> Preview
        </button>
        <button type="button" onClick={() => setCheckout(true)} className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-rose-deep pl-3 pr-1.5 text-sm font-medium text-paper hover:bg-rose sm:pl-4">
          <span className="sm:hidden">{draft.live?.slug ? "Share" : "Publish"}</span>
          <span className="hidden sm:inline">{draft.live?.slug ? "Share link" : "Make it live"}</span>
          {!draft.live?.slug && <span className="rounded-full bg-paper/20 px-2 py-0.5 text-xs">{formatInr(template.pricePaise)}</span>}
        </button>
      </header>

      {outdated && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-paper px-4 py-2.5 text-sm">
          <p className="flex-1">This template has new pages and words since you started editing.</p>
          <button
            type="button"
            onClick={() => {
              reset(freshDraft(template.slug, initial.name, template.story));
              setSel({ scene: 0, item: null });
            }}
            className="h-8 rounded-full bg-ink px-4 text-paper"
          >
            Use the new version
          </button>
          <button type="button" onClick={() => edit({ ...draft, base: initial.base })} className="h-8 rounded-full border border-line px-4 hover:bg-cream">
            Keep mine
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        {wide === true ? (
          <div className="flex min-h-0 flex-1">
            <LeftPanel draft={draft} sel={sel} setSel={setSel} edit={save} onAddSection={() => setAdding(true)} />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <Canvas frames={frames} device={device} setDevice={setDevice} sceneLabel={sceneLabel} hidden={!!scenes[sceneIdx]?.hidden} onReplay={() => setRun((r) => r + 1)} />
            </div>
            <aside data-lenis-prevent className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-line bg-cream lg:block">
              <Inspector draft={draft} sel={sel} setSel={setSel} edit={save} />
            </aside>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col lg:hidden">
            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto">
              <MobilePreview
                frames={frames}
                sceneLabel={sceneLabel}
                hidden={!!scenes[sceneIdx]?.hidden}
                onPreview={() => {
                  setPreview(true);
                  setRun((r) => r + 1);
                }}
              />
              <div className="sticky top-0 z-20">
                <PageSwitcher draft={draft} sel={sel} setSel={setSel} onAddSection={() => setAdding(true)} />
              </div>
              <MobileEditor draft={draft} edit={save} sel={sel} setSel={setSel} />
            </div>
          </div>
        )}
      </div>

      <ChangeDesign
        open={designsOpen}
        onClose={() => setDesignsOpen(false)}
        currentSlug={template.slug}
        designs={designs}
        to={draft.story.recipient}
        from={draft.story.sender}
      />

      <AddSection
        open={adding}
        onClose={() => setAdding(false)}
        onPick={addScene}
        afterLabel={!isLook(sel.scene) && sel.scene !== null ? sceneSchemas[scenes[sel.scene].type].name : "Look"}
        palette={draft.story.palette}
      />

      <NamesDialog
        open={names !== null}
        to={names === "edit" ? draft.story.recipient : ""}
        from={names === "edit" ? draft.story.sender : (profile?.sign_off ?? "")}
        accent={draft.story.palette.accent}
        submitLabel={names === "edit" ? "Save" : "Start editing"}
        onSave={saveNames}
        onClose={() => setNames(null)}
      />

      <Checkout
        open={checkout}
        onClose={() => setCheckout(false)}
        draft={draft}
        templateSlug={template.slug}
        templateName={template.name}
        pricePaise={template.pricePaise}
        onPublished={(live) => {
          // The gift is out: clear the editor for next time and go to its own page.
          reset(freshDraft(template.slug, initial.name, template.story));
          router.push(`/sent/${live.slug}`);
        }}
      />

      {/* Full-screen preview: plays exactly like the real gift */}
      <AnimatePresence>
        {preview && (
          <motion.div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ink/80 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              type="button"
              onClick={() => setPreview(false)}
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-sm font-medium"
            >
              <X className="size-4" /> Close preview
            </button>
            <div className="h-[min(88vh,844px)] w-[min(92vw,calc(min(88vh,844px)*390/844))] overflow-hidden rounded-[2rem] border-[8px] border-ink bg-paper">
              <iframe ref={previewFrame} src="/studio/frame" title="Preview of your gift" allow="autoplay; encrypted-media" className="size-full border-0" onLoad={postPreview} />
            </div>
            <p className="type-label mt-3 text-[10px] text-paper/70">This is exactly what they’ll see</p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </ImageCropProvider>
  );
}

/** null until measured, so the first paint can follow the CSS breakpoint. */
function useMinLg() {
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return wide;
}

function TopButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className="grid size-9 place-items-center rounded-lg hover:bg-paper disabled:opacity-30">
      {children}
    </button>
  );
}
