"use client";

import { accentMoods } from "@/components/experiences/birthday/accent-moods";
import { Fold } from "@/components/editor/fields";
import type { FontId } from "@/components/story/font-catalog";
import { catalogFont } from "@/components/story/font-catalog";
import type { StoryPalette } from "@/components/story/types";
import { giftFonts, isGiftPreset } from "@/components/story/gift-fonts";
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
export function LookSettings({ draft, edit, fold }: { draft: Draft; edit: Edit; fold?: boolean }) {
  const { story } = draft;
  const selected = themeList.find((t) => samePalette(t.palette, story.palette));
  const font = story.font ?? "classic";
  const accent = story.accentFont ?? "classic";
  const fontName = isGiftPreset(font) ? giftFonts[font].name : (catalogFont(font)?.name ?? "Gift font");

  function setStory(patch: Partial<typeof story>, tag?: string) {
    edit({ ...draft, story: { ...story, ...patch } }, tag);
  }

  const names = (
    <>
      <label className="block">
        <span className="type-heading text-base font-semibold text-ink">To</span>
        <input
          value={story.recipient}
          maxLength={30}
          autoComplete="off"
          onChange={(e) => setStory({ recipient: e.target.value }, "names-to")}
          className="mt-1.5 block min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus:border-ink/40"
        />
      </label>
      <label className="block">
        <span className="type-heading text-base font-semibold text-ink">From</span>
        <input
          value={story.sender}
          maxLength={30}
          autoComplete="off"
          onChange={(e) => setStory({ sender: e.target.value }, "names-from")}
          className="mt-1.5 block min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus:border-ink/40"
        />
      </label>
    </>
  );

  const themes = (
    <>
      <p className="text-sm leading-snug text-muted">Colours for every page. A page can still have its own colours.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {themeList.map((t) => {
          const on = selected?.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              // Notebook is the one theme that also brings the graph-paper pages.
              onClick={() => setStory({ palette: t.palette, paper: t.id === "notebook" }, "theme")}
              className={cn(
                "overflow-hidden rounded-2xl border text-left",
                on ? "border-ink" : "border-line",
              )}
            >
              <span
                className="relative block h-[4.75rem] overflow-hidden px-2.5 pt-2.5"
                style={{
                  backgroundColor: t.palette.bg,
                  ...(t.id === "notebook" && {
                    backgroundImage: `linear-gradient(${t.palette.accent}22 1px, transparent 1px), linear-gradient(90deg, ${t.palette.accent}22 1px, transparent 1px)`,
                    backgroundSize: "10px 10px",
                  }),
                }}
              >
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
    </>
  );

  const music = (
    <>
      <p className="text-sm leading-snug text-muted">
        Plays in the background of the whole gift. Paste a link, upload a file, or leave it and we’ll use the music box.
      </p>
      <TrackField roomy value={story.track} onChange={(track) => setStory({ track }, "music")} />
    </>
  );

  const fonts = (
    <FontChoices
      font={font}
      accent={accent}
      sample={story.recipient}
      onFont={(next) => setStory({ font: next }, "font")}
      onAccent={(accentFont) => setStory({ accentFont }, "accent")}
    />
  );

  if (fold) {
    const who = [story.recipient, story.sender && `from ${story.sender}`].filter(Boolean).join(" · ");
    const song = story.track?.fileName || story.track?.link || "Music box";
    return (
      <div className="space-y-3">
        <p className="text-sm leading-snug text-muted">This is how the whole gift looks. You can still change one line’s font later.</p>
        <Fold title="Who’s it for?" preview={who}>
          <div className="space-y-3">{names}</div>
        </Fold>
        <Fold title="Theme" preview={selected?.name ?? "Custom colours"}>
          <div className="space-y-3">{themes}</div>
        </Fold>
        <Fold title="Music" preview={song}>
          <div className="space-y-3">{music}</div>
        </Fold>
        <Fold title="Font & highlight" preview={`${fontName} · ${accentMoods[accent].name}`}>
          {fonts}
        </Fold>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm leading-snug text-muted">This is how the whole gift looks. You can still change one line’s font later.</p>
      <section className="space-y-3">
        <h3 className="text-base font-medium">Who’s it for?</h3>
        {names}
      </section>
      <section className="space-y-3">
        <h3 className="text-base font-medium">Theme</h3>
        {themes}
      </section>
      <section className="space-y-3">
        <h3 className="text-base font-medium">Music</h3>
        {music}
      </section>
      {fonts}
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
