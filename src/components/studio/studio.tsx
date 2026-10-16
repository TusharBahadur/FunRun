"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Eye, Loader2, Redo2, RotateCcw, Undo2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StudioFrameMessage } from "@/app/studio/frame/page";
import type { SceneType, Story } from "@/components/story/types";
import { cn, formatInr } from "@/lib/utils";
import { AddSection } from "./add-section";
import { Canvas, type DeviceMode } from "./canvas";
import { Checkout } from "./checkout";
import { freshDraft, useDraft } from "./draft-store";
import { Inspector, type Selection } from "./inspector";
import { LeftPanel } from "./layers";
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
  const [mobilePane, setMobilePane] = useState<"layers" | "canvas" | "edit">("canvas");
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

        <div className="mx-auto flex min-w-0 items-center gap-2">
          <input
            value={draft.name}
            onChange={(e) => edit({ ...draft, name: e.target.value }, "name")}
            aria-label="Gift name"
            className="w-[min(40vw,280px)] truncate rounded-lg bg-transparent px-2 py-1 text-center text-sm font-medium outline-none hover:bg-paper focus:bg-paper"
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
          className="hidden h-9 items-center gap-1.5 rounded-full border border-line px-4 text-sm hover:bg-paper sm:flex"
        >
          <Eye className="size-4" /> Preview
        </button>
        <button type="button" onClick={() => setCheckout(true)} className="flex h-9 items-center gap-2 rounded-full bg-rose-deep pl-4 pr-1.5 text-sm font-medium text-paper hover:bg-rose">
          {draft.live ? "Live" : "Make it live"}
          <span className="rounded-full bg-paper/20 px-2 py-0.5 text-xs">{formatInr(template.pricePaise)}</span>
        </button>
      </header>

      {/* Small screens: one pane at a time */}
      <div className="flex border-b border-line p-1.5 lg:hidden">
        {(["layers", "canvas", "edit"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setMobilePane(p)}
            className={cn("flex-1 rounded-lg py-1.5 text-sm capitalize", mobilePane === p ? "bg-paper font-medium shadow-sm" : "text-muted")}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className={cn("lg:flex", mobilePane === "layers" ? "flex w-full lg:w-auto" : "hidden")}>
          <LeftPanel
            draft={draft}
            sel={sel}
            setSel={(s) => {
              setSel(s);
              if (s.scene !== null) setMobilePane("canvas");
            }}
            edit={edit}
            onAddSection={() => setAdding(true)}
          />
        </div>
        <div className={cn("min-w-0 flex-1 flex-col lg:flex", mobilePane === "canvas" ? "flex" : "hidden")}>
          <Canvas frames={frames} device={device} setDevice={setDevice} sceneLabel={sceneLabel} hidden={!!scenes[sceneIdx]?.hidden} onReplay={() => setRun((r) => r + 1)} />
        </div>
        <aside data-lenis-prevent className={cn("shrink-0 overflow-y-auto border-l border-line bg-cream lg:block lg:w-[340px]", mobilePane === "edit" ? "block w-full" : "hidden")}>
          <Inspector draft={draft} sel={sel} setSel={setSel} edit={edit} />
        </aside>
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

function TopButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className="grid size-9 place-items-center rounded-lg hover:bg-paper disabled:opacity-30">
      {children}
    </button>
  );
}
