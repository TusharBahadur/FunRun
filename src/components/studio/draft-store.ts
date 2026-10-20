"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { Story } from "@/components/story/types";

/** A gift being made in the studio. Lives on this device until it's paid for. */
export type Draft = {
  v: 1;
  id: string;
  templateSlug: string;
  name: string;
  story: Story;
  /** Fingerprint of the template this draft started from; tells us when the template changed. */
  base?: string;
  /** Uploaded images, reusable across scenes. */
  assets: { id: string; name: string; src: string }[];
  /** Set once "Make it live" is completed on this device. */
  live?: { link: string; unlockAt?: string; publishedAt: string; paid: false };
  updatedAt: string;
};

const key = (id: string) => `tynitales:studio:${id}`;

export function draftIdFor(slug: string) {
  return `draft-${slug}`;
}

export function loadDraft(id: string): Draft | null {
  try {
    const raw = localStorage.getItem(key(id));
    const d = raw ? (JSON.parse(raw) as Draft) : null;
    return d?.v === 1 ? d : null;
  } catch {
    return null;
  }
}

/** False when the browser refused (usually: photos too large for storage). */
export function saveDraft(d: Draft) {
  try {
    localStorage.setItem(key(d.id), JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
}

/** A short fingerprint of a template's content (not for security, just change detection). */
export function storyFingerprint(story: Story) {
  const text = JSON.stringify(story);
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function freshDraft(slug: string, name: string, story: Story): Draft {
  return {
    v: 1,
    id: draftIdFor(slug),
    templateSlug: slug,
    name,
    base: storyFingerprint(story),
    story: structuredClone(story),
    assets: [],
    updatedAt: new Date().toISOString(),
  };
}

/* ───────────── Undo / redo ───────────── */

type History = { past: Draft[]; present: Draft; future: Draft[]; lastPush: number; lastTag?: string };
type Action =
  | { type: "edit"; next: Draft; tag?: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "replace"; draft: Draft };

const MERGE_MS = 700;

function reducer(h: History, a: Action): History {
  switch (a.type) {
    case "edit": {
      const now = Date.now();
      // Typing in the same field within a moment counts as one undo step.
      const merge = a.tag && a.tag === h.lastTag && now - h.lastPush < MERGE_MS;
      return {
        past: merge ? h.past : [...h.past.slice(-60), h.present],
        present: { ...a.next, updatedAt: new Date().toISOString() },
        future: [],
        lastPush: now,
        lastTag: a.tag,
      };
    }
    case "undo":
      if (!h.past.length) return h;
      return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], lastPush: 0 };
    case "redo":
      if (!h.future.length) return h;
      return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1), lastPush: 0 };
    case "replace":
      return { past: [], present: a.draft, future: [], lastPush: 0 };
  }
}

/** The studio's working copy: edit, undo, redo, and autosave on this device. */
export function useDraft(initial: Draft) {
  const [h, dispatch] = useReducer(reducer, { past: [], present: initial, future: [], lastPush: 0 });
  const [saved, setSaved] = useState<"saved" | "saving" | "failed">("saved");
  const dirty = useRef(false);

  // Pick up an earlier draft of this template from this device.
  useEffect(() => {
    const existing = loadDraft(initial.id);
    if (existing) dispatch({ type: "replace", draft: existing });
  }, [initial.id]);

  // Only real changes are saved, so opening a template never pins an old copy of it.
  useEffect(() => {
    if (!dirty.current) return;
    const id = setTimeout(() => setSaved(saveDraft(h.present) ? "saved" : "failed"), 400);
    return () => clearTimeout(id);
  }, [h.present]);

  const edit = useCallback((next: Draft, tag?: string) => {
    dirty.current = true;
    setSaved("saving");
    dispatch({ type: "edit", next, tag });
  }, []);

  return {
    draft: h.present,
    edit,
    undo: () => {
      dirty.current = true;
      dispatch({ type: "undo" });
    },
    redo: () => {
      dirty.current = true;
      dispatch({ type: "redo" });
    },
    reset: (d: Draft) => {
      setSaved("saving");
      dispatch({ type: "replace", draft: d });
      saveDraft(d);
      setSaved("saved");
    },
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
    saved,
  };
}

/** Shrinks an image so drafts stay small enough to keep on this device. */
export async function imageToDataUrl(file: File, maxSide = 1100) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bitmap.width * scale);
  c.height = Math.round(bitmap.height * scale);
  c.getContext("2d")!.drawImage(bitmap, 0, 0, c.width, c.height);
  bitmap.close();
  return c.toDataURL("image/jpeg", 0.8);
}
