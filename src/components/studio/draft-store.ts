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
  /**
   * Set once "Make it live" is done, or when a live gift is opened again to
   * change it. `slug` is the real online link (/for/<slug>); older drafts made
   * before gifts went online don't have one.
   */
  live?: {
    link: string;
    slug?: string;
    unlockAt?: string;
    /** Old gifts only: links used to close after 60 days. */
    expiresAt?: string;
    /** Changes can be saved until then (7 days after going live). */
    editUntil?: string;
    hasPassword?: boolean;
    publishedAt: string;
    paid: false;
  };
  updatedAt: string;
};

const key = (id: string) => `tynitales:studio:${id}`;

/** Demo photos we retired. Old drafts still store the old path. */
const PHOTO_MOVES: Record<string, string> = {
  "/demo/birthday/chai-hands.jpg": "/demo/birthday/cat.jpg",
};

function migratePhotos(d: Draft): Draft {
  let json = JSON.stringify(d);
  let changed = false;
  for (const [from, to] of Object.entries(PHOTO_MOVES)) {
    if (!json.includes(from)) continue;
    json = json.replaceAll(from, to);
    changed = true;
  }
  return changed ? (JSON.parse(json) as Draft) : d;
}

export function draftIdFor(slug: string) {
  return `draft-${slug}`;
}

export function loadDraft(id: string): Draft | null {
  try {
    const raw = localStorage.getItem(key(id));
    const d = raw ? (JSON.parse(raw) as Draft) : null;
    if (d?.v !== 1) return null;
    const migrated = migratePhotos(d);
    if (migrated !== d) saveDraft(migrated);
    return migrated;
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

export function removeDraft(id: string) {
  try {
    localStorage.removeItem(key(id));
  } catch {
    /* nothing to clean up */
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
export function useDraft(initial: Draft, resume: () => boolean = () => false) {
  const [h, dispatch] = useReducer(reducer, { past: [], present: initial, future: [], lastPush: 0 });
  const [saved, setSaved] = useState<"saved" | "saving" | "failed">("saved");
  const dirty = useRef(false);
  const resumeRef = useRef(resume);

  // The studio opens on the template exactly as Preview shows it. An earlier
  // draft is only picked up automatically when asked (e.g. back from sign-in
  // mid-checkout); otherwise the studio offers it as a choice.
  useEffect(() => {
    if (!resumeRef.current()) return;
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
export async function imageToDataUrl(file: File, maxSide = 1100, type: "image/jpeg" | "image/webp" = "image/jpeg") {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bitmap.width * scale);
  c.height = Math.round(bitmap.height * scale);
  c.getContext("2d")!.drawImage(bitmap, 0, 0, c.width, c.height);
  bitmap.close();
  return c.toDataURL(type, 0.8);
}

/** Songs stay as data URLs so they travel with the draft. Keep them small enough for this device. */
const AUDIO_MAX_BYTES = 4 * 1024 * 1024;

export async function audioToDataUrl(file: File) {
  const audio = file.type.startsWith("audio/") || /\.(mp3|m4a|aac|wav|ogg|opus|webm|flac)$/i.test(file.name);
  if (!audio) throw new Error("Choose an audio file (mp3, m4a, wav).");
  if (file.size > AUDIO_MAX_BYTES) {
    throw new Error("Keep songs under 4 MB so they save with the gift. Or paste a link instead.");
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}
