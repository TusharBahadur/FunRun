---
name: tynitales-typography
description: TyniTales type system and font rules. Use whenever writing or changing any text styling in this project — headlines, labels, body copy, buttons, gift templates, the editor, emails, social or print assets — and whenever someone asks to change, add or compare fonts. Covers the three brand families (Inter Tight, Fraunces, IBM Plex Mono), the gift-only handwriting face (Kalam), the type-* utilities, highlight "moods" for gifts, the wordmark, rupee and Hindi handling, and the bar a new font must clear.
---

# TyniTales typography

TyniTales uses **three brand font families, each with one job**, plus **one handwriting
face that lives only inside gifts**. Do not add another without following "Adding a font" below. Most "we need a new font" requests are solved by a
Fraunces axis setting or an existing utility.

| Role | Family | Loaded as | Used for |
|---|---|---|---|
| **Voice** | Inter Tight (variable 100–900 + italic) | `--font-inter-tight` → `font-sans` | Headlines, body, buttons, navigation, long reading text |
| **Heart** | Fraunces (variable: `wght`, `opsz`, `SOFT`, `WONK`, italic) | `--font-fraunces` → `font-serif`, `type-accent`, `type-wordmark` | The wordmark, highlighted words, gift card text |
| **Utility** | IBM Plex Mono (400, 500) | `--font-plex-mono` → `font-mono` | Small uppercase labels, eyebrows, meta, short captions |
| **Hand** (gifts only) | Kalam (400, 700; Latin + Devanagari) | `--font-kalam` → `type-hand`, `preload: false` | Handwritten letters, photo captions, sticky notes, signatures |

Fonts are loaded once in `src/app/layout.tsx` via `next/font/google`. Tokens live in
`src/app/globals.css` (`@theme inline` + the `type-*` utilities).

## Use the utilities, not raw font classes

| Utility | Spec | Use for |
|---|---|---|
| `type-display` | Inter Tight 400, line-height 0.95, tracking −0.04em, sentence case | Every headline. Size per context with `text-[clamp(...)]`. Add `font-semibold` to the lead word for emphasis (hero "Say", "Happy birthday,"). |
| `type-accent` | Fraunces italic 400, tracking −0.02em, axes from `--accent-axes` | The highlighted phrase inside a headline. In headlines write `<span className="type-accent text-rose">`. In editable copy, users write `*stars*` and `<Accented>` renders it. |
| `type-wordmark` | Fraunces italic 900, `SOFT 0, WONK 0`, tracking −0.035em | The name **TyniTales.** only. Use `<Logo>` in UI; use `public/brand/*.svg` anywhere outside the app. |
| `type-heading` | Inter Tight 500, line-height 1.05, tracking −0.03em | Card titles, step titles, list headings |
| `type-copy` | Plex Mono 14px uppercase, line-height 1.35 | Short supporting copy (≤ 3 lines) under headlines |
| `type-label` | Plex Mono 12px uppercase, tracking 0.02em | Eyebrows, tags, meta, counters, button-like links |
| `type-hand` | Kalam 400, line-height 1.25 | Inside gifts only: anything that should feel written by the sender. `font-bold` for greetings and sign-offs. |
| `font-serif` | Fraunces upright, `SOFT 30, WONK 0` (set globally) | Text *inside* gift cards and template previews |

Long-form reading on the site is **Inter Tight in sentence case**, never mono. Inside a gift,
the sender's own words (the letter, captions, notes) are `type-hand`; headlines stay `type-display`.

## Rules

1. **One accent per headline**, at most four words. The accent carries the feeling
   ("*someone's whole heart.*"); the sans carries the information.
2. **Headlines are sentence case.** Uppercase is reserved for `type-copy` and `type-label`.
3. **Mono is small.** Never set Plex Mono above 16px or for more than three lines.
4. **Never fake a style.** Every weight and italic we use is a real font file. Don't apply
   `italic` to Plex Mono, and don't use weights outside what layout.tsx loads.
5. **Wordmark is sacred.** Write the name as **TyniTales** in copy (capital T, capital T, one
   word). The logo always ends with the rose full stop. Never re-letter it in another font.
6. **Highlight colour** is `text-rose` on light backgrounds, `text-blush` on ink/wine. In gift
   experiences, use the palette's `accent` (or `pink` when the background is dark).
7. **Rupees:** every family is loaded with `subsets: ["latin", "latin-ext"]` because the ₹
   sign lives in latin-ext. Keep that subset if you touch the font config, or prices fall
   back to the system font.
8. **Hindi:** none of the three families cover Devanagari. Hindi text falls back to the
   device font (Kohinoor/Noto Devanagari), which is fine. Don't wrap Hindi in `type-accent`;
   the browser would synthesize a slanted italic. If Hindi gifts become common, add
   *Tiro Devanagari Hindi* with `subsets: ["devanagari"], preload: false` — see the research notes.

9. **Hand stays in the gift.** Never use `type-hand` on marketing pages, the studio UI or
   buttons. Kalam has ₹ but no ♡ or →: use a lucide icon instead of those characters.

## Gift customisation: moods, not fonts

Senders pick a highlight **mood**, defined in
`src/components/experiences/birthday/accent-moods.ts`. Three moods are the same Fraunces file
with different axes, so variety costs zero extra downloads:

| Mood | Family | Axes | Weight |
|---|---|---|---|
| Classic | Fraunces italic | `SOFT 0, WONK 0` | 400 |
| Soft | Fraunces italic | `SOFT 100, WONK 0` | 350 |
| Playful | Fraunces italic | `SOFT 50, WONK 1` | 500 |
| Modern | Inter Tight italic | — | 500 |

To offer a new look, add a mood with new axis values before reaching for a new family.

## Adding a font (the bar)

Kalam is the worked example: it passed because no brand family could look handwritten,
it writes Hindi too, has ₹, and only gift pages load it. Any further family needs **all** of these, written down in the PR:

1. A job none of the existing four can do, even with Fraunces axes (e.g. a script for a specific occasion).
2. Free for commercial use and available through `next/font/google` (or self-hosted with a licence file).
3. Variable or ≤ 2 static files, and loaded only where used (route-level, `preload: false` if rare).
4. Contains ₹ (check with fontTools: `0x20b9 in TTFont(path).getBestCmap()`).
5. Tested on the hero, a template card and a gift at 375px width.

Shortlists and why the alternatives lost are in [references/font-research.md](references/font-research.md).

## Before you ship text changes

- [ ] Only `type-*` utilities or `font-sans/serif/mono`; no inline `fontFamily` outside accent-moods.
- [ ] At most one accent phrase per headline.
- [ ] Headline still fits at 375px (long words like "HAPPY BIRTHDAY" have overflowed before).
- [ ] ₹ renders in the brand font (check computed `font-family` in the browser).
- [ ] Descenders aren't clipped by `SplitText` / reveal masks (Fraunces italic `y` is deep).
