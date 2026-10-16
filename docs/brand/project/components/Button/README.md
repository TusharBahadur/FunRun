Pill buttons that say exactly what happens, with an arrow chip that rolls on hover.

**Provide** a short sentence-case label (2–4 words, may include a ₹ price) and a destination. Source: `ButtonLink` in `src/components/ui/button.tsx`; sizes 40px (sm), 48px (md), 56px (lg), all `radius-pill`.

- **Primary** (`ink` fill, `paper` text): the one main action per view ("Browse templates", "Continue ₹149").
- **Rose**: buying or making a gift ("Make it yours · ₹179"). Fill with `rose-deep` so the label meets 4.5:1; the current site uses `rose` (3.97:1), flagged in the brand book.
- **Ghost** (`ink` text, no fill, no arrow): the secondary action beside a primary.
- Don't put two primary buttons side by side, use exclamation marks, or write "Click here"/"Submit".
