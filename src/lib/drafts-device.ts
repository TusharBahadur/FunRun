"use client";

import type { Draft } from "@/components/studio/draft-store";

/**
 * Drafts kept on this device (IndexedDB: room for photos, unlike localStorage).
 * No Supabase here, so light pages (navbar, home) can check for drafts cheaply.
 * See lib/drafts for the account copy.
 */

export type DraftSummary = {
  id: string;
  templateSlug: string;
  /** "Make a Wish for Papa" */
  name: string;
  recipient: string;
  updatedAt: string;
};

const KEEP_DAYS = 60;
export const stale = (iso: string) => Date.now() - new Date(iso).getTime() > KEEP_DAYS * 86_400_000;

export function newDraftId() {
  return crypto.randomUUID();
}

export function summary(d: Draft): DraftSummary {
  return { id: d.id, templateSlug: d.templateSlug, name: d.name, recipient: d.story.recipient, updatedAt: d.updatedAt };
}

/* ───────────── On this device (IndexedDB) ───────────── */

let dbPromise: Promise<IDBDatabase> | null = null;

function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open("tynitales", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("drafts", { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

async function store<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const req = run(d.transaction("drafts", mode).objectStore("drafts"));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** False when the browser refused (private mode, storage full). */
export async function saveOnDevice(d: Draft) {
  try {
    await store("readwrite", (s) => s.put(d));
    return true;
  } catch {
    return false;
  }
}

export async function getOnDevice(id: string): Promise<Draft | null> {
  try {
    return ((await store("readonly", (s) => s.get(id))) as Draft | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function deleteOnDevice(id: string) {
  try {
    await store("readwrite", (s) => s.delete(id));
  } catch {
    /* nothing to remove */
  }
}

export async function allOnDevice(): Promise<Draft[]> {
  try {
    const all = ((await store("readonly", (s) => s.getAll())) as Draft[]) ?? [];
    const keep = all.filter((d) => !stale(d.updatedAt));
    for (const d of all) if (stale(d.updatedAt)) void deleteOnDevice(d.id);
    return keep;
  } catch {
    return [];
  }
}

/** Device drafts only: cheap enough for the home page and navbar (no Supabase). */
export async function deviceDrafts(): Promise<DraftSummary[]> {
  return (await allOnDevice()).map(summary).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

