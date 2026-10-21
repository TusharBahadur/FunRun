import type { Scene, Story } from "@/components/story/types";

export type GiftNames = { recipient: string; sender: string };

/** Copy as the sender will read it: real names instead of {to} / {from}. */
export function showNames(text: string, names: GiftNames) {
  return text.replaceAll("{to}", names.recipient).replaceAll("{from}", names.sender);
}

/** Typed names go back to placeholders, so renaming someone later updates every line. */
export function keepNames(text: string, names: GiftNames) {
  const swaps = [
    { name: names.recipient.trim(), token: "{to}" },
    { name: names.sender.trim(), token: "{from}" },
  ]
    .filter((s) => s.name.length >= 2)
    .sort((a, b) => b.name.length - a.name.length);
  return swaps.reduce((out, { name, token }) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return out.replace(new RegExp(`(?<![\\p{L}\\p{N}{])${escaped}(?![\\p{L}\\p{N}}])`, "gu"), token);
  }, text);
}

function keepDeep(value: unknown, names: GiftNames): unknown {
  if (typeof value === "string") {
    if (/^(https?:|data:|\/)/.test(value)) return value;
    return keepNames(value, names);
  }
  if (Array.isArray(value)) return value.map((v) => keepDeep(v, names));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = keepDeep(v, names);
    return out;
  }
  return value;
}

/** Turn leftover demo names in scene copy into {to} / {from} tokens. */
export function bindStoryNames(story: Story, names: GiftNames): Story {
  const to = names.recipient.trim();
  const from = names.sender.trim();
  if (to.length < 2 && from.length < 2) return story;
  return { ...story, scenes: story.scenes.map((s) => keepDeep(s, names) as Scene) };
}

/** Rewrite copy that still has the old (or seed) names, then store the new To / From. */
export function storyWithNames(story: Story, next: GiftNames, seed?: GiftNames): Story {
  let scenes = bindStoryNames(story, { recipient: story.recipient, sender: story.sender }).scenes;
  if (seed) scenes = bindStoryNames({ ...story, scenes }, seed).scenes;
  return { ...story, scenes, recipient: next.recipient, sender: next.sender };
}
