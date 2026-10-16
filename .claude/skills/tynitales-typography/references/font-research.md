# Font research (October 2026)

Source: the full Google Fonts catalogue metadata (`https://fonts.google.com/metadata/fonts`),
1,950 families, 1,829 with Latin support. Google Fonts was the pool because every family is
free for commercial use and loads through `next/font/google` with no licence admin.

Filters applied, in order: Latin support → variable font → has a true italic → popularity
(Google's rank, lower = more used) → brand fit (warm, giftable, legible at 375px).

## Serif ("heart") — chose **Fraunces**

47 variable serifs have a true italic. Only **one** in the whole catalogue also has
softness and wonkiness axes: Fraunces (`wght 100–900`, `opsz 9–144`, `SOFT 0–100`, `WONK 0–1`).
That one file produces the heavy wordmark, the elegant accent italic, the rounded "soft" mood
and the quirky "playful" mood, and has the ₹ sign.

| Candidate | Popularity | Why not |
|---|---|---|
| Playfair Display | 17 | Beautiful but swashy/calligraphic; only a weight axis. Previously used for accents; replaced. |
| Instrument Serif | 53 | Static, one weight. Previously used for card text; replaced. |
| DM Serif Display | 73 | Static, one weight. Was a close match for the logo but can't flex. |
| Bodoni Moda | 53 | High contrast falls apart at small sizes on phones. |
| Newsreader / Source Serif 4 | 89 / 39 | Editorial, not warm enough. |
| Lora / EB Garamond / Cormorant | 28 / 29 / 47 | Bookish; italics too classical for a playful gift brand. |

## Sans ("voice") — kept **Inter Tight**

108 variable sans families with italics. Inter Tight (rank 25) is Inter tuned for display
sizes with tighter default spacing, which suits big sentence-case headlines; full 100–900
weights + italic; has ₹ and arrows.

| Candidate | Popularity | Why not |
|---|---|---|
| Inter | 2 | Too loose at headline sizes; Inter Tight is the display cut of the same design. |
| DM Sans | 14 | Lovely, but rounder shapes compete with Fraunces' softness. |
| Plus Jakarta Sans / Figtree | 15 / 31 | Friendly geometric; less crisp at the tight tracking we use. |
| Geist | 32 | Product/dev-tool feel. |

## Mono ("utility") — kept **IBM Plex Mono**

Static 400/500 is enough for labels. Warmer and more humanist than JetBrains Mono or
Roboto Mono; has ₹ and arrows.

## Hindi (Devanagari) — device fallback for now

None of the three brand families cover Devanagari. Of 60 Latin + Devanagari families,
the best pairs are **Tiro Devanagari Hindi** (serif, has italic; pairs with Fraunces) and
**Mukta** (sans; pairs with Inter Tight). They were trialled and removed: Google's CSS
ships Latin ranges for them too, which the browser downloaded for punctuation fallbacks,
adding two families for no visible gain. Phones' own Devanagari fonts render Hindi well.
Revisit if Hindi gifts become a meaningful share.

## Glyph checks

Verified with fontTools against the font files from github.com/google/fonts:

| Glyph | Inter Tight | Fraunces | Plex Mono |
|---|---|---|---|
| ₹ U+20B9 | yes | yes | yes |
| → U+2192 | yes | **no** (falls back) | yes |
| — ’ … | yes | yes | yes |

The ₹ sign is in Google's `latin-ext` subset, not `latin`, hence `subsets: ["latin", "latin-ext"]`.

## Handwriting (added for gifts, Oct 2026)

Gifts needed a "written by someone who loves you" voice for letters, captions and sticky
notes. Shortlist from Google Fonts: **Kalam**, Caveat, Gochi Hand, Patrick Hand, Shadows Into Light.

- **Kalam** won: warm, legible at 15px on phones, 3 static weights (we load 400/700), and it
  covers **Devanagari**, so Hindi notes look handwritten too. Has ₹ (U+20B9); no → or ♡.
- Caveat: prettier at display sizes but gets scratchy below 18px; Latin only.
- Patrick Hand / Gochi Hand: too childlike for anniversary and apology gifts.
- Shadows Into Light: thin strokes vanish on photos and tinted paper.

Loaded with `preload: false`; only gift pages render it.
