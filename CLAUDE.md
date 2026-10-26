# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Amore: a marketing site + template gallery for personalized digital gift templates. Next.js 16.4 (App Router, React 19.3), TypeScript (strict), Tailwind CSS v4, Motion (`motion/react`), Lenis, lucide-react.

**Next.js 16 differs from older versions** (see AGENTS.md). Read `node_modules/next/dist/docs/` before using Next APIs. Notable in this repo:
- `next.config.ts` enables `cacheComponents` and `partialPrefetching`. Dynamic data (e.g. awaiting `searchParams`) must sit inside a `<Suspense>` boundary. See `src/app/(marketing)/templates/page.tsx`, where `Results` awaits `searchParams` under Suspense with a skeleton fallback.
- Page/layout props use the global generated types `PageProps<"/route">` and `LayoutProps<"/route">`. `searchParams` is a Promise.
- Tailwind runs through the `@tailwindcss/turbopack` loader configured in `next.config.ts`. There is no PostCSS config.

## Commands

Package manager is pnpm (`packageManager: pnpm@11.5.1`; `corepack enable` if `pnpm` is missing).

```bash
pnpm install
pnpm dev            # dev server (also re-writes the Next.js block in AGENTS.md)
pnpm build          # production build; also the main type/route check
pnpm lint           # eslint (flat config: next core-web-vitals + typescript)
pnpm exec tsc --noEmit
```

No test framework is set up.

## Architecture

- **Route groups:** `src/app/(marketing)/` holds `/` and `/templates` and shares Navbar/Footer/Dock via its layout. `src/app/(auth)/sign-in` is a placeholder. The root `layout.tsx` sets up fonts (Geist, Geist Mono, Instrument Serif as CSS variables), metadata from `src/config/site.ts`, `<Providers>`, the custom `<Cursor>` and the grain overlay.
- **Data layer:** UI never imports `src/data/*` directly for templates. It goes through the async functions in `src/lib/templates.ts` (`getTemplates`, `getTemplateBySlug`). These currently read static seed data shaped like future DB rows, and are meant to become DB queries (Drizzle + Postgres) with the same signatures. Keep new data access behind this layer. Prices are stored in `priceCents`.
- **Occasions** are the canonical list in `src/config/site.ts`. `OccasionId` is derived from it, and `isOccasionId` validates untrusted input like query params.
- **Server vs. client:** pages and data fetching are server components. Animation and interactive pieces (`components/motion/*`, most `sections/*`, `layout/*`) are `"use client"` and receive data as props.
- **Motion system:** shared easing curves and `INTRO_DELAY` live in `src/lib/motion.ts`. The home-page `Preloader` lifts after `INTRO_DELAY`, so the hero and navbar entrance animations are offset by it (the navbar only on `/`). Keep these in sync when changing intro timing. `Providers` starts Lenis smooth scroll (skipped under `prefers-reduced-motion`) and wraps the app in `MotionConfig reducedMotion="user"`.
- **Styling:** design tokens (colors `cream`/`ink`/`rose`/etc., keyframes, `animate-*` utilities, `no-scrollbar`) are defined in `@theme` in `src/app/globals.css`. Use these token classes, not raw hex. The exception is per-template palettes, which are inline styles from data. Merge classes with `cn()` from `src/lib/utils.ts`.
- **Template previews** (`components/templates/template-preview.tsx`) are pure SVG/CSS renderings driven by each template's `palette`, `motif` and `preview` text, sized with container query units (`cqw`).
- Import alias: `@/*` → `src/*`.

## Data & assets (read before touching stickers, photos or scenes)

- Where each kind of data lives, and the rules that keep published gifts unchanged, are in README → "Where data lives". Short version: never edit a published-asset in place; images are fingerprinted (`npm run assets`), board stickers are pinned `id@hash` at publish, sticker ids are permanent (retire, don't delete), and scene rendering changes need a `GIFT_SCHEMA_VERSION` bump.
- Template image paths go through `asset()` in `src/lib/assets.ts` (server-only; never import it from a client component).
- Marketing and template pages must stay static: don't read `searchParams` or cookies in them. Read `?to`/`?from` in the browser (`components/templates/with-names.tsx`).

## Planned (from README)

Each of these has a reserved place in the codebase:
- Auth: `src/app/(auth)/*`, with its provider in `src/components/providers.tsx`
- Stripe: `src/app/api/stripe/*`
- Recipient gift pages: `src/app/(gift)/for/[slug]`
- Hosting: Vercel
