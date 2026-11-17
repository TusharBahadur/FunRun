# Security audit report: TyniTales

_Audit date: 17 November 2026. Scope: the whole codebase (Next.js app, 15 API routes, Supabase schema and policies, storage, payments, email, third-party scripts), the live site's public surface (non-destructive checks only), dependencies and git history. Method: OWASP Top 10:2025 and ASVS 5.0 categories, used as a checklist._

## Executive summary
TyniTales has a small attack surface: 11 runtime dependencies, no admin panel, no roles, and no server-side file handling. The core controls were already sound:
- server-side authentication and authorisation on every API that changes data;
- row-level security in the database;
- server-only secrets;
- signature-verified payments, with prices set on the server;
- hashed gift passwords;
- a strict upload type list (no SVG or HTML).

**Fixed in this audit:** missing browser security headers (High), arbitrary media links inside gifts (Medium), unlimited gift-password guessing (Medium), contact-form abuse (Medium), a Next.js advisory (Medium), never-deleted draft photos (Low), and an unlimited song lookup (Low). Earlier in the same week: refunded payments could publish a gift (Medium).

**Remaining launch blockers:**
- the owner must run the SQL and `pnpm install` (see the checklist);
- turn on two-factor authentication for every admin account;
- decide on database backups.

**Assessment: CONDITIONALLY READY.** No known unresolved Critical findings. One High remains and depends on the owner (2FA on infrastructure accounts). The fixes still need to be verified once deployed.

## Architecture (as audited)
- **Hosting:** Next.js 16 on Vercel. **Data, auth and storage:** Supabase (`gifts`, `profiles`, `drafts`, `payments`, `rate_events`; bucket `gift-media`).
- **Auth:** Google (popup ID token, or redirect) and email OTP, both via Supabase. The site stores no passwords; it only hashes optional gift-lock passwords with scrypt.
- **Payments:** Razorpay Standard Checkout plus a webhook. **Email:** Resend (contact form; Supabase SMTP).
- **Public endpoints:**
  - `POST /api/gifts`, `PATCH /api/gifts/[slug]`, `POST /api/gifts/[slug]/unlock`, `POST /api/gifts/[slug]/open`;
  - `POST /api/account/delete`, `GET /api/account/export`;
  - `POST /api/payments/order|verify|webhook`;
  - `POST /api/enquiry`, `GET /api/audio-info`, `GET /api/cron/expire`.

## Vulnerability register

| ID | Vulnerability | Severity | Location | Root cause | Impact | Remediation | Verification | Status |
|---|---|---|---|---|---|---|---|---|
| S1 | Missing security headers (HSTS, anti-clickjacking, nosniff, referrer, permissions) | High | All responses (`next.config.ts`) | Never configured | Clickjacking of sign-in/checkout; downgrade on first visit; MIME sniffing; referrer leaks | Added HSTS (2 y, subdomains), X-Frame-Options SAMEORIGIN, CSP `frame-ancestors 'self'; base-uri 'self'; object-src 'none'`, nosniff, strict-origin-when-cross-origin, Permissions-Policy (mic for our own pages only) | Live check before fix showed all absent. **After deploy: re-check headers (see checklist)** | Fixed: verify after deploy |
| S2 | Arbitrary media URLs in published gifts | Medium | `src/lib/gift-input.ts` (publish/edit) | API accepted any JSON; only the studio limited the links | A crafted gift could load a tracking pixel (recipient IP leak), unwanted content, or a `javascript:`/`data:` link | `src/lib/media-urls.ts`: photos/stickers only from our bucket or own paths; songs any https; dangerous schemes and `//host` rejected | `tests/media-urls.test.ts` (7 tests) | Fixed |
| S3 | Gift password brute force | Medium | `POST /api/gifts/[slug]/unlock` | 0.7 s delay but no limit; parallel requests unthrottled | Guessing weak gift passwords | Supabase-backed limiter (advisory-locked count): 10 tries per IP per gift per 15 min, 60 per gift per hour | Code review; needs SQL applied to take effect (fails open until then) | Fixed: needs SQL |
| S4 | Contact form abuse | Medium | `POST /api/enquiry` | No limit; sends a confirmation to any address | Email-bombing third parties from our domain; burning the Resend quota | 5 per IP per hour, 40 per day in total, 1 confirmation per address per day | Code review; needs SQL | Fixed: needs SQL |
| S5 | Refunded payment could publish a gift | Medium | `POST /api/gifts`, `/api/payments/order` | An order stays "paid" after a refund | A free gift after a refund | Every publish checks a captured, unrefunded INR payment for the exact payment ID (commit `b48524b`) | Code review; signature tests in `tests/payments.test.ts` | Fixed |
| S6 | Next.js advisory GHSA-mfr8-8qww-v76h (information disclosure via `use cache` + `unstable_cache`) | Medium | `next` 16.4.2 | Outdated dependency | Our `use cache` page reads public gift data only, so impact is likely low | `next` → ^16.4.5 | Needs `pnpm install` + lockfile commit, then `pnpm audit` | Fixed: needs install |
| S7 | zod memory exhaustion (GHSA-mrhx-c7xc-m3w5) | Low (dev tooling only) | via `eslint-config-next` | Transitive dev dependency | None in production (lint only) | pnpm override `zod >=4.6.6 <5` | Needs `pnpm install` + `pnpm audit` | Fixed: needs install |
| S8 | Draft photos never deleted | Low | storage `gift-media/<user>/drafts/` | Deleting a draft row didn't remove its photos | Personal photos kept longer than stated | Daily cron removes draft photos older than 60 days that no gift or draft uses (`stale_draft_media()`) | Code review; needs SQL | Fixed: needs SQL |
| S9 | Song lookup unlimited | Low | `GET /api/audio-info` | No limit (only calls YouTube oEmbed, no SSRF) | Minor resource abuse | 120 per IP per hour; URL length capped | Code review | Fixed |
| S10 | minimatch ReDoS (GHSA-g3hv-75wg-m249) | Low | dev tooling only | Transitive dev dependency; the fix is a major version that may break lint plugins | None in production | Accepted; revisit when `eslint-config-next` updates | `pnpm audit` | Open (accepted) |
| S11 | No 2FA confirmed on infrastructure accounts | High | GitHub, Vercel, Supabase, Razorpay, Resend, Google Cloud | Owner setting (Vercel shows "Enable 2FA") | Account takeover = full compromise (code, data, payments) | **Owner: enable 2FA everywhere** | Owner confirms | Open: owner |
| S12 | No full Content-Security-Policy (`script-src`) | Medium | headers | Strict script CSP needs care with Razorpay, Google, YouTube, inline Next scripts | XSS impact not limited by CSP (no XSS found: no raw HTML rendering anywhere) | Follow-up: ship a `Content-Security-Policy-Report-Only` first, then enforce | — | Open (planned) |
| S13 | No database backups (Supabase free plan) | Medium | Supabase | Plan limitation | Data loss on mistake or incident | Owner: upgrade to Pro (daily backups) at launch, or schedule exports | — | Open: owner |
| S14 | Rate limits fail open | Low | `src/lib/rate-limit.ts` | Deliberate: an outage shouldn't lock users out | Limits off if the limiter is down | Accepted; logged as a warning | — | Accepted |
| S15 | Public storage bucket | Low (by design) | `gift-media` | Gifts must load without sign-in | Anyone with an exact file URL can view that file (paths are random/hashed and unlisted) | Documented in the privacy policy | Bucket policy review | Accepted |

## Checks that passed (no change needed)
- **Access control:**
  - edit and delete check the owner on the server;
  - `gifts`, `drafts` and `profiles` have RLS, and `payments`/`rate_events` aren't readable from browsers at all;
  - profile updates are limited to `sign_off` (and now `display_name`) by column grant;
  - the upload policy confines each user to their own folder.
- **Injection:** all database access goes through the Supabase client (parameterised); no raw SQL from input; no `dangerouslySetInnerHTML` except JSON-LD built from our own constants; React escapes all gift text.
- **CSRF:** the APIs authenticate with bearer tokens, not cookies. The only cookie, the gift unlock, is HttpOnly, Secure, SameSite=Lax, and scoped to its path.
- **Secrets:** none in source or git history (scanned for Resend, Razorpay, Supabase and JWT patterns); `.env*` is gitignored; `/.env`, `/.env.local` and `/.git/config` return 404 on the live site; only `NEXT_PUBLIC_*` values reach the browser (URL, publishable key, Razorpay key ID, Google client ID), all public by design.
- **Payments:**
  - price set on the server;
  - HMAC-SHA256 signature compared in constant time;
  - the order is re-fetched and checked for owner, template, currency, amount and paid status;
  - one payment per gift (unique index);
  - the webhook is signature-checked over the raw body.
- **Uploads:** 5 MB limit; images and audio only (no SVG or HTML); no server-side processing of user files.
- **Errors:** generic messages to users; logs hold IDs only, never tokens or payment details.
- **HTTP methods:** unsupported methods return 405.
- **Auth:** Supabase handles sessions and token expiry. Email OTP is rate-limited by Supabase (30 verifications per 5 min per IP; OTP valid for 1 hour). Google sign-in uses a hashed nonce.

## Security tests performed
- Manual code review of every route, library, policy and the schema.
- Unit tests, `pnpm test` (node:test): **13 passing** (media-link rules, payment and webhook signatures, password hashing, unlock cookies).
- Type-check (`tsc`) and lint: pass (warnings pre-date this audit).
- Live, non-destructive checks: response headers, sensitive-path probes, method handling.
- Secret scan of the full git history.
- Dependency audit (`pnpm audit`, run by the owner): 1 high (dev), 2 moderate (1 runtime, 1 dev).

**Not performed** (needs a staging setup): dynamic scanning (DAST/fuzzing) of a running instance; automated authorisation tests against a real database with two test users; re-running `pnpm audit` after the update.

## Recommended production configuration
- Vercel env: all secrets as **Secret**; `NEXT_PUBLIC_*` as Config; Razorpay **live** keys plus webhook secret; `CRON_SECRET` set.
- Supabase: Site URL `https://tynitales.com`; redirect URLs as documented; custom SMTP on; OTP length 6; email rate limit 30/h.
- Razorpay: payment capture Automatic; webhook `order.paid` in live mode.
- 2FA on every admin account; separate, least-privilege API keys (e.g. a "sending only" Resend key).

## Final pre-launch checklist
- [ ] Run the new SQL in `supabase/schema.sql` (rate limits, `stale_draft_media`, `display_name` grant) in Supabase.
- [ ] `pnpm install`, commit `pnpm-lock.yaml`, run `pnpm audit` (expect only the accepted minimatch item) and `pnpm test`.
- [ ] Push and deploy; then check the headers (DevTools → Network → document → Response headers: `strict-transport-security`, `x-frame-options`, `content-security-policy`).
- [ ] Turn on 2FA: GitHub, Vercel, Supabase, Razorpay, Resend, Google.
- [ ] Decide on Supabase backups (Pro plan) before taking real payments.
- [ ] Rotate the Razorpay **test** secret that was shared in chat.
- [ ] Test end to end: sign-in (Google, email), publish with payment, wrong gift password 11× → "Too many tries", download my data, delete a test account.
