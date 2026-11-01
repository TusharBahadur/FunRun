"use client";

import type { Draft } from "@/components/studio/draft-store";
import { collectDataUrls, dataUrlToBlob, EXTENSION, mapStrings, MEDIA_BUCKET } from "@/components/studio/publish";
import { getSupabase } from "@/lib/supabase/browser";

/**
 * Drafts: gifts in progress.
 *
 * - Always kept on the device (IndexedDB: room for photos, unlike localStorage).
 * - Also kept in the account when signed in (the `drafts` table; photos go to
 *   the media bucket once, so each save after that is a small JSON write).
 * - Removed when the gift goes live, or after 60 days untouched.
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
const stale = (iso: string) => Date.now() - new Date(iso).getTime() > KEEP_DAYS * 86_400_000;

export function newDraftId() {
  return crypto.randomUUID();
}

function summary(d: Draft): DraftSummary {
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

async function getOnDevice(id: string): Promise<Draft | null> {
  try {
    return ((await store("readonly", (s) => s.get(id))) as Draft | undefined) ?? null;
  } catch {
    return null;
  }
}

async function deleteOnDevice(id: string) {
  try {
    await store("readwrite", (s) => s.delete(id));
  } catch {
    /* nothing to remove */
  }
}

async function allOnDevice(): Promise<Draft[]> {
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

/* ───────────── In the account (Supabase) ───────────── */

/** Photo data URL → its uploaded link, so each photo uploads once. */
const uploaded = new Map<string, string>();

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Uploads any photos still inside the draft, and returns a copy that links to them instead. */
async function withUploadedMedia(d: Draft, userId: string): Promise<Draft> {
  const found = new Set<string>();
  collectDataUrls(d, found);
  const supabase = getSupabase();
  for (const dataUrl of found) {
    if (uploaded.has(dataUrl)) continue;
    const { blob, type } = dataUrlToBlob(dataUrl);
    const ext = EXTENSION[type];
    if (!ext) continue; // left inline; publishing reports odd file types
    const path = `${userId}/drafts/${await sha256(dataUrl)}.${ext}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: type, upsert: false, cacheControl: "31536000" });
    // Same photo, same name: already there from an earlier save.
    if (error && !/exists|duplicate/i.test(error.message)) throw error;
    uploaded.set(dataUrl, supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
  }
  return mapStrings(d, (v) => uploaded.get(v) ?? v);
}

export async function saveToAccount(d: Draft, userId: string) {
  const data = await withUploadedMedia(d, userId);
  const { error } = await getSupabase()
    .from("drafts")
    .upsert({ id: d.id, user_id: userId, template_slug: d.templateSlug, name: d.name, recipient: d.story.recipient, data, updated_at: d.updatedAt });
  if (error) throw error;
}

async function getFromAccount(id: string): Promise<Draft | null> {
  const { data } = await getSupabase().from("drafts").select("data").eq("id", id).maybeSingle();
  return (data?.data as Draft | undefined) ?? null;
}

async function listInAccount(): Promise<DraftSummary[]> {
  const { data } = await getSupabase()
    .from("drafts")
    .select("id, template_slug, name, recipient, updated_at")
    .order("updated_at", { ascending: false });
  return (data ?? [])
    .map((r) => ({ id: r.id as string, templateSlug: r.template_slug as string, name: r.name as string, recipient: (r.recipient as string) ?? "", updatedAt: r.updated_at as string }))
    .filter((d) => !stale(d.updatedAt));
}

/* ───────────── Both ───────────── */

/** Every draft, newest first. Signed in: the device's and the account's, merged. */
export async function listDrafts(signedIn: boolean): Promise<DraftSummary[]> {
  const local = await deviceDrafts();
  if (!signedIn) return local;
  const byId = new Map(local.map((d) => [d.id, d]));
  try {
    for (const d of await listInAccount()) {
      const mine = byId.get(d.id);
      if (!mine || d.updatedAt > mine.updatedAt) byId.set(d.id, d);
    }
  } catch {
    /* offline: the device's list will do */
  }
  return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** One draft, whichever copy is newer. */
export async function getDraft(id: string, signedIn: boolean): Promise<Draft | null> {
  const local = await getOnDevice(id);
  if (!signedIn) return local;
  const online = await getFromAccount(id).catch(() => null);
  if (!online) return local;
  if (!local || online.updatedAt > local.updatedAt) return online;
  return local;
}

export async function deleteDraft(id: string, signedIn: boolean) {
  await deleteOnDevice(id);
  if (signedIn) await getSupabase().from("drafts").delete().eq("id", id);
}

/** Just signed in: put this device's drafts in their account too. */
export async function copyDeviceDraftsToAccount(userId: string) {
  const local = await allOnDevice();
  if (!local.length) return;
  const online = new Map((await listInAccount().catch(() => [])).map((d) => [d.id, d.updatedAt]));
  for (const d of local) {
    const at = online.get(d.id);
    if (at && at >= d.updatedAt) continue;
    await saveToAccount(d, userId).catch(() => {});
  }
}
