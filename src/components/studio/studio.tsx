"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Eye, Loader2, Redo2, RotateCcw, Undo2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StudioFrameMessage } from "@/app/studio/frame/page";
import type { SceneType, Story } from "@/components/story/types";
import { formatInr } from "@/lib/utils";
import { AddSection } from "./add-section";
import { Canvas, type DeviceMode } from "./canvas";
import { Checkout } from "./checkout";
import { freshDraft, useDraft } from "./draft-store";
import { Inspector, type Selection } from "./inspector";
import { LeftPanel } from "./layers";
import { MobileEditor, MobileNav, type MobilePane } from "./mobile-editor";
import { MobilePreview } from "./mobile-preview";
import { insertScene } from "./ops";
import { sceneSchemas } from "./schema";

export type StudioTemplate = { slug: string; name: string; pricePaise: number; story: Story };

/** The workspace: layers on the left, live artboards in the middle, inspector on the right. */
export function Studio({ template }: { template: StudioTemplate }) {
  const initial = useMemo(() => freshDraft(template.slug, `${template.name} for ${template.story.recipient}`, template.story), [template]);
  const { draft, edit, undo, redo, reset, canUndo, canRedo, saved } = useDraft(initial);
  const [sel, setSel] = useState<Selection>({ scene: 0, item: null });
  const [device, setDevice] = useState<DeviceMode>("phone");
  const [run, setRun] = useState(0);
  const [adding, setAdding] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [preview, setPreview] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>("edit");
  const wide = useMinLg();
  // A draft saved before the template was rewritten would hide the new version.
  const outdated = draft.base !== initial.base;
  const frames = useRef(new Map<string, HTMLIFrameElement>());
  const previewFrame = useRef<HTMLIFrameElement>(null);

  const scenes = draft.story.scenes;
  const sceneIdx = sel.scene !== null && scenes[sel.scene] ? sel.scene : 0;

  // The canvas always shows the selected page, even if it's hidden in the gift.
  const frameStory = useMemo<Story>(
    () => ({ ...draft.story, scenes: draft.story.scenes.map((s, i) => (i === sceneIdx ? { ...s, hidden: false } : s)) }),
    [draft.story, sceneIdx],
  );
  const visibleIndex = frameStory.scenes.slice(0, sceneIdx).filter((s) => !s.hidden).length;

  const postAll = useCallback(() => {
    const msg: StudioFrameMessage = { type: "tynitales:studio", story: frameStory, slug: template.slug, index: visibleIndex, run, mode: "edit" };
    frames.current.forEach((f) => f.contentWindow?.postMessage(msg, window.location.origin));
  }, [frameStory, template.slug, visibleIndex, run]);

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
        if (i >= 0 && i !== sceneIdx) setSel({ scene: i, item: null });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [postAll, postPreview, preview, frameStory, sceneIdx]);

  // Keyboard: undo / redo, Escape to select the page.
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
      if (e.key === "Escape" && !typing) setSel({ scene: null, item: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  function addScene(type: SceneType) {
    const after = sel.scene ?? scenes.length - 1;
    edit(insertScene(draft, after, sceneSchemas[type].create()));
    setSel({ scene: after + 1, item: null });
    setMobilePane("edit");
    setAdding(false);
  }

  const sceneLabel = sceneSchemas[scenes[sceneIdx]?.type ?? "letter"].name;

  return (
    <div className="flex h-svh flex-col bg-cream text-ink">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
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

        <div className="mx-auto flex min-w-0 flex-1 items-center justify-center gap-2">
          <input
            value={draft.name}
            onChange={(e) => edit({ ...draft, name: e.target.value }, "name")}
            aria-label="Gift name"
            className="w-full max-w-[9rem] truncate rounded-lg bg-transparent px-2 py-1 text-center text-sm font-medium outline-none hover:bg-paper focus:bg-paper sm:max-w-[280px]"
          />
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
          <span className="sm:hidden">{draft.live ? "Live" : "Publish"}</span>
          <span className="hidden sm:inline">{draft.live ? "Live" : "Make it live"}</span>
          <span className="rounded-full bg-paper/20 px-2 py-0.5 text-xs">{formatInr(template.pricePaise)}</span>
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
            <LeftPanel draft={draft} sel={sel} setSel={setSel} edit={edit} onAddSection={() => setAdding(true)} />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <Canvas frames={frames} device={device} setDevice={setDevice} sceneLabel={sceneLabel} hidden={!!scenes[sceneIdx]?.hidden} onReplay={() => setRun((r) => r + 1)} />
            </div>
            <aside data-lenis-prevent className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-line bg-cream lg:block">
              <Inspector draft={draft} sel={sel} setSel={setSel} edit={edit} />
            </aside>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col lg:hidden">
            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto">
              <MobilePreview frames={frames} sceneLabel={sceneLabel} hidden={!!scenes[sceneIdx]?.hidden} />
              <MobileEditor
                draft={draft}
                edit={edit}
                sel={sel}
                setSel={(s) => {
                  setSel(s);
                  setMobilePane("edit");
                }}
                pane={mobilePane}
                onAddSection={() => setAdding(true)}
              />
            </div>
            <MobileNav pane={mobilePane} onChange={setMobilePane} />
          </div>
        )}
      </div>

      <AddSection
        open={adding}
        onClose={() => setAdding(false)}
        onPick={addScene}
        afterLabel={sel.scene !== null ? sceneSchemas[scenes[sel.scene].type].name : "the last page"}
        palette={draft.story.palette}
      />

      <Checkout
        open={checkout}
        onClose={() => setCheckout(false)}
        draft={draft}
        templateName={template.name}
        pricePaise={template.pricePaise}
        onPublished={(live) => edit({ ...draft, live })}
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
              <iframe ref={previewFrame} src="/studio/frame" title="Preview of your gift" className="size-full border-0" onLoad={postPreview} />
            </div>
            <p className="type-label mt-3 text-[10px] text-paper/70">This is exactly what they’ll see</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
