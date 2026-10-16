TyniTales makes **tiny pages for big feelings**: a birthday, an apology, a "missing you", turned into a small interactive gift one person opens on their phone. Everything in the brand should feel like a handwritten note you find in a coat pocket: personal, warm, a little playful, never loud.

**Tagline:** Gift a feeling.

## Brand idea

- **Audience.** People in India, mostly 18–35, sending a gift to a partner, a best friend, a sibling or a parent. They are good at feelings and bad at words; we make them look like poets.
- **Promise.** In ten minutes you can make something they'll keep forever.
- **Personality.** Warm, intimate, playful, considered. Think candlelight, not confetti cannon: celebration is earned at the payoff moment (unwrapping, blowing out candles), not sprayed everywhere.
- **What we are not.** Not a greeting-card aisle (no glitter clip-art), not a dating app (no flirty neon), not corporate (no stock-photo smiles).

## Name and logo

- Write the name **TyniTales**: one word, capital *T*, capital *T*. Never "Tynitales", "Tiny Tales", "TYNITALES" or "Tyni Tales". The second capital lets people read the invented word as *tiny tales*.
- The **wordmark** is "TyniTales" in Fraunces Black Italic with the quirky letterforms switched off (`SOFT 0`, `WONK 0`), followed by a round **rose full stop**: the seal on the envelope, the tale finished. Use the `Logos` assets; never re-type the logo in another font or drop the full stop.
- The **monogram** is the italic *T* with the full stop, on a rose or ink rounded tile. Use it where the wordmark is too wide: app icon, favicon, social avatar, stickers.
- **Colour combinations.** `tynitales-wordmark.svg` (ink + rose) on `cream`, `paper`, `blush` and occasion grounds. `tynitales-wordmark-cream.svg` (cream + rose) on `ink`, `wine` and photography darker than 40% grey. Monogram: `tynitales-monogram.svg` (rose tile) by default, `tynitales-monogram-ink.svg` on rose or busy backgrounds.
- **Clear space** around the wordmark equals the height of its lowercase *a*. **Minimum size**: wordmark 72px wide on screen (18mm in print), monogram 16px.
- **Don't** stretch, outline, add shadows, change the full stop's colour (except the monogram, which uses ink), rotate, or put the wordmark on rose.

## Colour

The brand palette is the stationery: cream envelope, paper letter, ink, a rose wax seal.

| Token | Role |
| --- | --- |
| `cream` | The page. Default background everywhere. |
| `paper` | Raised surfaces on cream: inputs, letters, cards. |
| `ink` | Text, primary buttons, the footer. |
| `rose` | The brand accent: highlighted words, the logo's full stop, hearts. |
| `blush` | Soft tint; the highlight colour on `ink` and `wine`. |
| `wine` | Deep romantic surface. |
| `gold` | Candle flames, sparkle and confetti only. |

- **Ratio.** Roughly 60% `cream`/`paper`, 30% `ink`, 10% `rose`. Rose is the wax seal, not the envelope: one rose moment per screen.
- **Small rose text** (under 24px, e.g. step numbers "01", links) uses `rose-deep`; `rose` on `cream` is 3.68:1, fine for large accent words but not small text.
- **Flagged:** cream text on a `rose` fill is 3.97:1. It passes for 24px+ headlines but not for button labels or body copy. Proposed fix: rose buttons and the rose call-to-action panel should fill with `rose-deep` (5.52:1) or set their small text at 19px bold+.
- **Occasion palettes** (`occasion-*`) colour individual gifts: Frosting (Make a Wish), Butter (Candle), Midnight (The Party), plus Mint, Lavender, Ocean and Noir. They live inside gifts, never on the marketing site's chrome.

## Typography

Three brand families, one job each, plus a handwriting face used only inside gifts. Full rules live in the `tynitales-typography` skill in the codebase.

- **Inter Tight** (`sans`) is the *voice*: headlines, body and interface. Headlines are sentence case, regular weight, tight (`display-*` styles); lead with one semibold word when it helps ("**Say** …").
- **Fraunces** (`serif`) is the *heart*: the wordmark, highlighted words (`accent`) and the text inside gift cards (`card-serif`). One variable file gives every serif look we need through its softness and wonk axes.
- **IBM Plex Mono** (`mono`) is the *utility*: small uppercase labels and short captions (`label`, `copy`). Never larger than 16px or longer than three lines.
- **One accent per headline**, four words at most: "Three small steps to *someone's whole heart.*"
- Long reading on the site is `letter`: Inter Tight, sentence case, generous line height.
- **Kalam** (`hand`) is the sender's *handwriting*, inside gifts only: letters, photo captions, sticky notes, signatures. Never on the marketing site or in buttons. It has ₹ but no ♡ or →; use a Lucide icon instead.
- Prices always show **₹** in the brand font: load each family's `latin-ext` subset.
- Hindi text uses the reader's device font; never put Hindi inside an italic accent.

## Voice

We write like the friend who is good with words, helping you say it.

- **Second person, warm, short.** "Pick a template, pour your heart in, and send it in the next ten minutes."
- **Specific beats generic.** "You make ordinary Tuesdays feel like holidays" beats "You're amazing".
- **Sentence case** everywhere, including buttons: "Start gifting", "Make it yours", "Unwrap it again".
- **Buttons say what happens**: "Send Sam a thank-you", "Download keepsake", "Unlock with The Party · ₹179".
- **Prices** as "₹149", never "Rs." or "INR 149" in the interface.
- **Emoji**: allowed inside people's own messages; never in our interface chrome, headings or buttons.
- **Light English, Indian context**: "chai", "Diwali lights", "Goa, finally" in sample content; avoid Americanisms like "holiday season" or "mom" in our own copy (people may write what they like).
- **Don't** use guilt or urgency ("Don't let them down!"), clichés ("Express your love like never before"), or exclamation marks in interface copy.

| Do | Don't |
| --- | --- |
| Say *I miss you* beautifully. | Create stunning personalised e-cards! |
| Wish sent. | Your wish has been successfully submitted. |
| Couldn't save. Try fewer photos. | Error 507: storage quota exceeded. |

## Imagery and moodboard

See the **Moodboard** page for the full board.

- **Photography** (when we use it): candid, close, warm light, a little film grain; hands, handwriting, candles, polaroids on a fridge, chai cups, wrapped gifts. Real Indian homes and streets. No stock smiles, no pointing at laptops, no couples posed against sunsets.
- **Illustration**: flat shapes cut from the palette, with the `Motifs` set (heart, candle, cake, envelope with wax seal, polaroid, sparkle). No outlines except the candle's ink stroke; no gradients except flame glow.
- **Texture**: a 5% film-grain overlay over the whole site; paper (`paper`) for anything you'd hold.
- **Placeholders** for people's photos are soft two-colour gradients with a single white icon, never grey boxes.

## Motion

- Ease everything out with `cubic-bezier(0.22, 1, 0.36, 1)` (expo out); sections rise 16–28px and fade over 0.8–0.9s.
- Headlines reveal word by word from below a mask; give Fraunces descenders room (`y`, `g` are deep).
- **Confetti only at a payoff**: unwrapping, blowing out candles. Never on page load.
- Ambient motion (floating cards, glows) must stay under 1 frame of work: animate `transform` and `opacity` of gradients, never animate CSS `filter: blur()`.
- Respect `prefers-reduced-motion`: keep the content, drop the movement.

## Layout and shape

- Side gutter `space-gutter` on phones; content max width 1280px.
- Shapes are soft: inputs `radius-input`, cards `radius-card`, gift sections `radius-panel`, buttons and chips `radius-pill`.
- Elevation is a long, soft, ink-tinted shadow (`shadow-card`, `shadow-float`), never grey drop shadows.
- Design phone-first: most gifts are opened on a phone; check every gift screen at 375px.

## Iconography

- Use **Lucide** icons at 16–20px with the default 2px stroke and round caps; colour with the text colour beside them.
- Use the `Motifs` SVGs for illustration, not icons.
- No emoji as icons.
