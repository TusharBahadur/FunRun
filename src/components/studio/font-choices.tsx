"use client";

import { accentMoodOrder, accentMoods, accentMoodStyle } from "@/components/experiences/birthday/accent-moods";
import type { AccentFont } from "@/components/experiences/birthday/types";
import { catalogFont, fontCatalog, fontGroups, type FontId } from "@/components/story/font-catalog";
import { giftFontOrder, giftFonts, giftFontStyle, isGiftPreset, type StoryFont } from "@/components/story/gift-fonts";
import { cn } from "@/lib/utils";

/** Gift-wide font and highlight pickers. Large samples, so the choice is obvious on a phone. */
export function FontChoices({
  font,
  accent,
  sample,
  onFont,
  onAccent,
}: {
  font: StoryFont;
  accent: AccentFont;
  sample: string;
  onFont: (font: StoryFont) => void;
  onAccent: (accent: AccentFont) => void;
}) {
  const word = sample.trim();
  const highlight = word.length > 0 && word.length <= 14 ? word : "you";
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">Font for the whole gift</h3>
        <p className="mt-1 text-sm leading-snug text-muted">Headlines, letters and photo captions. You can still override one line later.</p>
        <div className="mt-3 grid gap-2">
          {giftFontOrder.map((id) => {
            const on = font === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => onFont(id)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left",
                  on ? "border-ink bg-paper" : "border-line bg-paper/40",
                )}
              >
                <span className="block text-[1.75rem] leading-none" style={giftFontStyle(id)}>
                  With love
                </span>
                <span className="mt-2 block text-sm font-medium">{giftFonts[id].name}</span>
                <span className="block text-sm leading-snug text-muted">{giftFonts[id].note}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm font-medium">Or one face everywhere</p>
        <FontGrid
          value={isGiftPreset(font) ? undefined : font}
          onChange={(id) => onFont(id ?? "classic")}
          sample="With love"
        />
      </div>

      <div>
        <h3 className="text-base font-medium">Highlight</h3>
        <p className="mt-1 text-sm leading-snug text-muted">
          Wrap a word in *stars* and it shows up in this style.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {accentMoodOrder.map((id) => {
            const on = accent === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => onAccent(id)}
                className={cn(
                  "min-h-16 rounded-2xl border px-3 py-3 text-left",
                  on ? "border-ink bg-paper" : "border-line bg-paper/40",
                )}
              >
                <span className="block text-2xl leading-none" style={{ ...accentMoodStyle(id), color: "var(--color-rose)" }}>
                  {highlight}
                </span>
                <span className="mt-1.5 block text-sm text-muted">{accentMoods[id].name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Fonts for one field. Empty means “use the gift font”. */
export function FieldFontPicker({
  value,
  onChange,
  sample,
}: {
  value?: FontId;
  onChange: (id?: FontId) => void;
  sample: string;
}) {
  const current = catalogFont(value);
  return (
    <details className="mt-3 rounded-2xl border border-line bg-paper/50 px-3 py-2">
      <summary className="cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden">
        Font · {current ? current.name : "Gift font"}
      </summary>
      {value && (
        <button type="button" onClick={() => onChange(undefined)} className="mt-2 text-sm text-muted hover:text-ink">
          Use the gift font
        </button>
      )}
      <FontGrid value={value} onChange={onChange} sample={sample || "Aa"} allowClear />
    </details>
  );
}

function FontGrid({
  value,
  onChange,
  sample,
  allowClear,
}: {
  value?: FontId;
  onChange: (id?: FontId) => void;
  sample: string;
  allowClear?: boolean;
}) {
  const word = sample.trim().slice(0, 18) || "Aa";
  return (
    <div className="mt-2 space-y-3">
      {fontGroups.map((g) => (
        <div key={g.id}>
          <p className="type-label mb-1.5 text-[10px] text-muted">{g.name}</p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {fontCatalog
              .filter((f) => f.group === g.id)
              .map((f) => {
                const on = value === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange(on && allowClear ? undefined : f.id)}
                    className={cn(
                      "min-h-14 rounded-xl border px-2.5 py-2 text-left",
                      on ? "border-ink bg-paper" : "border-line bg-paper/40",
                    )}
                  >
                    <span className="block truncate text-lg leading-none" style={{ fontFamily: f.stack }}>
                      {word}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted">{f.name}</span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
