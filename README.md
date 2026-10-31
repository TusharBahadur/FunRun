# Tynitales

Gift beautiful, personalized digital templates to the people you love.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router, React 19, Partial Prerendering) | Server components + streaming; one codebase for marketing, app, API and webhooks |
| Language | TypeScript | |
| Styling | Tailwind CSS v4 | Design tokens live in `src/app/globals.css` (`@theme`) |
| Animation | Motion (`motion/react`) + Lenis smooth scroll | |
| Icons | lucide-react | |

### Planned additions (slot in without restructuring)

- **Database:** Postgres (Neon / Supabase) + Drizzle ORM → replace the bodies of `src/lib/templates.ts`
- **Auth:** Better Auth (or Auth.js) → `src/app/(auth)/*`, provider in `src/components/providers.tsx`
- **Payments:** Stripe Checkout + webhooks → `src/app/api/stripe/*`; prices already stored as `priceCents`
- **Gift pages:** `src/app/(gift)/for/[slug]` for the recipient-facing experience
- **Hosting:** Vercel

## Structure

```
src/
  app/
    (marketing)/        landing page + /templates, shares Navbar/Footer/Dock
    (auth)/sign-in      placeholder for the auth flow
    layout.tsx          fonts, metadata, providers, cursor, grain
    globals.css         design tokens & keyframes
  components/
    motion/             reusable animation primitives (SplitText, RotatingWords,
                        Marquee, ScrollRevealText, Magnetic,
                        TiltCard, Typewriter, Cursor, Preloader)
    sections/           landing page sections
    layout/             Navbar, Dock, Footer
    templates/          TemplatePreview, TemplateCard, TemplateGrid, OccasionFilter
    ui/                 Button, Eyebrow, Logo
  config/site.ts        nav, occasions, site metadata
  data/                 seed data (templates, love notes) — shaped like future DB rows
  lib/                  data access layer, motion tokens, utils
  hooks/
```

## Develop

```bash
pnpm install
pnpm dev
```

## Where data lives

| What | Where | Why |
| --- | --- | --- |
| Templates, page designs, drawn stickers, fonts | Code (`src/data`, `src/components`) | Pre-rendered into static pages: fastest load, best SEO, reviewed in git |
| Sticker images, demo photos | `assets/` → fingerprinted WebP in `public/a/` | Served from the CDN, cached forever |
| Drafts being edited | The sender's browser | Try the editor without an account; abandoned drafts cost nothing |
| Accounts, profiles, published gifts, open counts | Supabase Postgres | Shared, private per sender |
| Photos and songs in published gifts | Supabase Storage (`gift-media`) | Uploaded only when a gift goes live |

### Published gifts never change

A published gift is a frozen copy of the sender's story (`gifts.story`). To keep it that way:

- **Images are fingerprinted.** `npm run assets` turns `assets/stickers/*` and `assets/photos/*` into
  `public/a/<name>.<hash>.webp`, where the hash comes from the source file. Replacing a source makes a
  new file; old files are never deleted. Templates reference images through `asset("photos/cat.jpg")`.
- **Board stickers are pinned at publish.** A gift saves `"pin-149@3fa9c1ab0d"` (id + hash), not just
  `"pin-149"`, so it keeps the exact image it was made with.
- **Sticker ids are permanent.** Never delete or rename one in `src/data/stickers.json`; set
  `"retired": true` to hide it from the picker. Drawn stickers are code: never redraw one in place,
  add a new id instead.
- **Scene components are versioned.** Each gift stores `schema_version` (`GIFT_SCHEMA_VERSION` in
  `src/lib/gift-links.ts`). If a change would make older gifts look different, bump it and keep the old
  behaviour for lower versions.

Adding a sticker: drop the file in `assets/stickers/`, add a line to `src/data/stickers.json`, run
`npm run assets` (also runs before `npm run dev`), and commit the new files in `public/a/`.
`npm run build` fails if you forget.

## Accounts & gift links

Senders build gifts for free in the studio (saved on their device). **Make it live** asks them to
sign in with Google, uploads their photos and songs to Supabase Storage, saves the gift, and
returns a share link: `/for/<name>-<6 random chars>`.

- Every gift costs the same and its link works for a fixed time from when it unlocks: both set in
  `giftPricing` in `src/config/site.ts`. Payments aren't connected yet, so publishing is free.
- Gifts can't be edited once live. Senders find theirs, with open counts, at `/profile`.
- After a link closes, `/for/<slug>` shows a "wrapped up" page. A daily job
  (`/api/cron/expire`, scheduled in `vercel.json`) deletes the content and photos.

### Setup

1. Create a Supabase project, then run `supabase/schema.sql` in its SQL Editor (safe to re-run after updates).
2. Turn on Google under Authentication → Sign In / Providers, and add `http://localhost:3000/**`
   (plus your live domain) under Authentication → URL Configuration → Redirect URLs.
3. Copy `.env.example` to `.env.local` and fill it in.

| Where | What |
| --- | --- |
| `src/lib/supabase/browser.ts` | Browser client, `useUser()`, Google sign-in |
| `src/lib/supabase/admin.ts` | Server-only client (secret key) |
| `src/components/studio/publish.ts` | Upload media + publish |
| `src/app/api/gifts/route.ts` | Saves a gift, makes its link |
| `src/app/for/[slug]/page.tsx` | What the recipient opens |
