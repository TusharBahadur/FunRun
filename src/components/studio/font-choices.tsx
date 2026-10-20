"use client";

import { accentMoodOrder, accentMoods, accentMoodStyle } from "@/components/experiences/birthday/accent-moods";
import type { AccentFont } from "@/components/experiences/birthday/types";
import { giftFontOrder, giftFonts, giftFontStyle, type GiftFont } from "@/components/story/gift-fonts";
import { cn } from "@/lib/utils";

/** Gift-wide font and highlight pickers. Large samples, so the choice is obvious on a phone. */
export function FontChoices({
  font,
  accent,
  sample,
  onFont,
  onAccent,
}: {
  font: GiftFont;
  accent: AccentFont;
  sample: string;
  onFont: (font: GiftFont) => void;
  onAccent: (accent: AccentFont) => void;
}) {
  const word = sample.trim();
  const highlight = word.length > 0 && word.length <= 14 ? word : "you";
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">Font</h3>
        <p className="mt-1 text-sm leading-snug text-muted">Headlines, letters and photo captions.</p>
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
