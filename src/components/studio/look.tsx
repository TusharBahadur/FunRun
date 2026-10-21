"use client";

import type { FontId } from "@/components/story/font-catalog";
import type { StoryPalette } from "@/components/story/types";
import { themeList } from "@/data/themes";
import { cn } from "@/lib/utils";
import { FontChoices } from "./font-choices";
import { type Draft } from "./draft-store";
import { updateScene } from "./ops";
import { TrackField } from "./track-field";

export const LOOK = -1;

export { themeList };

function samePalette(a: StoryPalette, b: StoryPalette) {
  return a.bg === b.bg && a.fg === b.fg && a.accent === b.accent && a.cream === b.cream;
}

type Edit = (next: Draft, tag?: string) => void;

/** First studio page: names, a colour theme, music, and the font for the whole gift. */
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
                <span className="relative block h-[4.75rem] overflow-hidden px-2.5 pt-2.5" style={{ backgroundColor: t.palette.bg }}>
                  <span className="absolute -right-3 -top-4 size-12 rounded-full" style={{ backgroundColor: t.palette.pink }} />
                  <span
                    className="relative block rounded-xl px-2.5 py-2 shadow-[0_8px_16px_-12px_rgba(27,18,21,.45)]"
                    style={{ backgroundColor: t.palette.cream, color: t.palette.ink }}
                  >
                    <span className="block text-[11px] font-medium leading-none">{t.name}</span>
                    <span className="mt-2 block h-1.5 w-9 rounded-full" style={{ backgroundColor: t.palette.accent }} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-medium">Music</h3>
        <p className="text-sm leading-snug text-muted">
          Plays in the background of the whole gift. Paste a link, upload a file, or leave it and we’ll use the music box.
        </p>
        <TrackField roomy value={story.track} onChange={(track) => setStory({ track }, "music")} />
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
