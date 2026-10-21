import type { Scene } from "@/components/story/types";
import type { Draft } from "./draft-store";
import { childField, sceneSchemas } from "./schema";

type Sel = { scene: number | null; item: number | null; field?: string | null };

/** Pure edits on a draft's scenes. Each returns a new draft. */

type Rec = Record<string, unknown>;

export function setScenes(d: Draft, scenes: Scene[]): Draft {
  return { ...d, story: { ...d.story, scenes } };
}

export function updateScene(d: Draft, i: number, patch: Rec): Draft {
  return setScenes(d, d.story.scenes.map((s, j) => (j === i ? ({ ...s, ...patch } as Scene) : s)));
}

export function moveScene(d: Draft, from: number, to: number): Draft {
  const scenes = [...d.story.scenes];
  if (to < 0 || to >= scenes.length) return d;
  const [s] = scenes.splice(from, 1);
  scenes.splice(to, 0, s);
  return setScenes(d, scenes);
}

export function duplicateScene(d: Draft, i: number): Draft {
  const scenes = [...d.story.scenes];
  scenes.splice(i + 1, 0, structuredClone(scenes[i]));
  return setScenes(d, scenes);
}

export function deleteScene(d: Draft, i: number): Draft {
  return setScenes(d, d.story.scenes.filter((_, j) => j !== i));
}

export function insertScene(d: Draft, after: number, scene: Scene): Draft {
  const scenes = [...d.story.scenes];
  scenes.splice(after + 1, 0, scene);
  return setScenes(d, scenes);
}

/* ───────────── Items inside a scene's list field ───────────── */

function list(scene: Scene, key: string): unknown[] {
  return ((scene as unknown as Rec)[key] as unknown[]) ?? [];
}

export function updateItem(d: Draft, i: number, key: string, j: number, value: unknown): Draft {
  const scene = d.story.scenes[i];
  return updateScene(d, i, { [key]: list(scene, key).map((x, k) => (k === j ? value : x)) });
}

export function moveItem(d: Draft, i: number, key: string, from: number, to: number): Draft {
  const items = [...list(d.story.scenes[i], key)];
  if (to < 0 || to >= items.length) return d;
  const [x] = items.splice(from, 1);
  items.splice(to, 0, x);
  return updateScene(d, i, { [key]: items });
}

export function addItem(d: Draft, i: number, key: string, value: unknown): Draft {
  return updateScene(d, i, { [key]: [...list(d.story.scenes[i], key), value] });
}

export function duplicateItem(d: Draft, i: number, key: string, j: number): Draft {
  const items = [...list(d.story.scenes[i], key)];
  items.splice(j + 1, 0, structuredClone(items[j]));
  return updateScene(d, i, { [key]: items });
}

export function deleteItem(d: Draft, i: number, key: string, j: number): Draft {
  return updateScene(d, i, { [key]: list(d.story.scenes[i], key).filter((_, k) => k !== j) });
}

export function readItems(scene: Scene, key: string) {
  return list(scene, key);
}

/**
 * Delete the selected thing on a page (a note, sticker, reaction…), not the page.
 * Returns null when there isn’t a removable element, or when it’s the last list item.
 */
export function deleteSelected(d: Draft, sel: Sel): { draft: Draft; sel: Sel } | null {
  if (sel.scene == null || sel.scene < 0) return null;
  const i = sel.scene;
  const scene = d.story.scenes[i];
  const listField = childField(scene.type);

  if (sel.item != null && listField) {
    const items = readItems(scene, listField.key);
    if (items.length <= 1) return null;
    const j = sel.item;
    return {
      draft: deleteItem(d, i, listField.key, j),
      sel: { scene: i, item: Math.max(0, j - 1), field: listField.key },
    };
  }

  const stickerAt = sel.field?.match(/^sticker-(\d+)$/)?.[1];
  if (stickerAt !== undefined) {
    const next = (scene.stickers ?? []).filter((_, n) => n !== Number(stickerAt));
    return {
      draft: updateScene(d, i, { stickers: next.length ? next : undefined }),
      sel: { scene: i, item: null, field: null },
    };
  }

  if (sel.field === "reaction" && scene.reaction) {
    return {
      draft: updateScene(d, i, { reaction: undefined }),
      sel: { scene: i, item: null, field: null },
    };
  }

  if (sel.field === "stamp" && scene.type === "spotlight") {
    return {
      draft: updateScene(d, i, { stamp: null } as Rec),
      sel: { scene: i, item: null, field: null },
    };
  }

  if (sel.field) {
    const f = sceneSchemas[scene.type].fields.find((x) => x.key === sel.field);
    if (f && "optional" in f && f.optional) {
      const value = (scene as unknown as Rec)[f.key];
      if (value !== undefined && value !== "" && value !== null) {
        return {
          draft: updateScene(d, i, { [f.key]: f.kind === "image" ? undefined : "" }),
          sel: { scene: i, item: null, field: null },
        };
      }
    }
  }

  return null;
}
