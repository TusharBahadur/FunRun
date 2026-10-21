"use client";

import { palettes } from "@/data/stories/shared";
import type { FontId } from "@/components/story/font-catalog";
import type { StoryPalette } from "@/components/story/types";
import { cn } from "@/lib/utils";
import { FontChoices } from "./font-choices";
import { type Draft } from "./draft-store";
import { updateScene } from "./ops";

export const LOOK = -1;

const themeNames: Record<keyof typeof palettes, string> = {
  frosting: "Frosting",
  butter: "Butter",
  midnight: "Midnight",
  mint: "Mint",
  lavender: "Lavender",
  ocean: "Ocean",
  noir: "Noir & gold",
  lilac: "Lilac",
  peach: "Peach",
  blush: "Blush",
  wine: "Wine",
};

export const themeList = (Object.keys(palettes) as (keyof typeof palettes)[]).map((id) => ({
  id,
  name: themeNames[id],
  palette: palettes[id],
}));

function samePalette(a: StoryPalette, b: StoryPalette) {
  return a.bg === b.bg && a.fg === b.fg && a.accent === b.accent && a.cream === b.cream;
}

type Edit = (next: Draft, tag?: string) => void;

/** First studio page: names, a colour theme, and the font for the whole gift. */
export function LookSettings({ draft, edit }: { draft: Draft; edit: Edit }) {
  const { story } = draft;
  const selected = themeList.find((t) => samePalette(t.palette, story.palette));

  function setStory(patch: Partial<typeof story>, tag?: string) {
    edit({ ...draft, story: { ...story, ...patch } }, tag);
  }

  return (
    <div className="space-y-8">
      <p className="text-sm leading-snug text-muted">This is how the whole gift looks. You can still change one line’s font later.</p>

      <section className="space-y-3">
        <h3 className="text-base font-medium">Who’s it for?</h3>
        <label className="block">
          <span className="text-sm font-medium">To</span>
          <input
            value={story.recipient}
            maxLength={30}
            autoComplete="off"
            onChange={(e) => setStory({ recipient: e.target.value }, "names-to")}
            className="mt-1.5 block min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus:border-ink/40"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">From</span>
          <input
            value={story.sender}
            maxLength={30}
            autoComplete="off"
            onChange={(e) => setStory({ sender: e.target.value }, "names-from")}
            className="mt-1.5 block min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus:border-ink/40"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-medium">Theme</h3>
        <p className="text-sm leading-snug text-muted">Colours for every page. A page can still have its own colours.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {themeList.map((t) => {
            const on = selected?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => setStory({ palette: t.palette }, "theme")}
                className={cn(
                  "overflow-hidden rounded-2xl border text-left",
                  on ? "border-ink" : "border-line",
                )}
              >
                <span className="flex h-14">
                  <span className="flex-1" style={{ backgroundColor: t.palette.bg }} />
                  <span className="w-8" style={{ backgroundColor: t.palette.accent }} />
                  <span className="w-6" style={{ backgroundColor: t.palette.cream }} />
                </span>
                <span className="block px-3 py-2 text-sm font-medium">{t.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <FontChoices
        font={story.font ?? "classic"}
        accent={story.accentFont ?? "classic"}
        sample={story.recipient}
        onFont={(font) => setStory({ font }, "font")}
        onAccent={(accentFont) => setStory({ accentFont }, "accent")}
      />
    </div>
  );
}

export function setFieldFont(draft: Draft, i: number, key: string, id?: FontId) {
  const fonts = { ...draft.story.scenes[i].fonts };
  if (id) fonts[key] = id;
  else delete fonts[key];
  return updateScene(draft, i, { fonts: Object.keys(fonts).length ? fonts : undefined });
}

export function isLook(scene: number | null | undefined) {
  return scene == null || scene === LOOK;
}
