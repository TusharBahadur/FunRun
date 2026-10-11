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
                        VelocityMarquee, Marquee, ScrollRevealText, Magnetic,
                        TiltCard, Typewriter, Cursor, Preloader)
    sections/           landing page sections
    layout/             Navbar, Dock, Footer
    templates/          TemplatePreview, TemplateCard, TemplateGrid, OccasionFilter
    ui/                 Button, RollText, Eyebrow, Logo
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
