# Data inventory: TyniTales

_Last reviewed: 17 November 2026. Built from the code, the database schema (`supabase/schema.sql`) and the services the site calls. Items marked **[OWNER]** need the owner to confirm._

## Who we're talking about
- **Senders**: people who make a gift (they sign in to make it live).
- **Recipients**: people who open a gift link (no account, nothing asked of them).
- **Visitors**: anyone browsing the site.

## What we hold, and why

| # | Data | About whom | Why | Required? | Where it's stored | Who/what can read it | Shared with | Kept for | User can see / fix / download / delete |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Email address | Sender | Sign-in, receipts, replies | Yes, to make a gift live | Supabase Auth (`auth.users`) | The person; server code | Supabase (host), Resend (sign-in codes), Razorpay (prefill + receipt), Google (if they use Google) | Until account deleted | See ✓ (profile) · Fix: via support · Download ✓ · Delete ✓ |
| 2 | Name, profile picture | Sender (Google sign-in only) | Shown on their profile | No (comes from Google) | `profiles.display_name`, `profiles.avatar_url` | The person; server code | Supabase | Until account deleted | See ✓ · Fix ✓ (name) · Download ✓ · Delete ✓ |
| 3 | Sign-off ("From" line) | Sender | Pre-fills new gifts | No | `profiles.sign_off` | The person | Supabase | Until account deleted | See ✓ · Fix ✓ · Download ✓ · Delete ✓ |
| 4 | Sign-in method, account dates | Sender | Running the account | Yes | Supabase Auth | The person; server code | Supabase | Until account deleted | See ✓ · Download ✓ · Delete ✓ |
| 5 | Gift content: recipient's and sender's names, messages, photos, songs, stickers, schedule | Sender, and people named/pictured in gifts | It **is** the product | Yes, for a gift | `gifts.story` (+ photos/songs in storage bucket `gift-media`) | The sender; anyone with the gift link (+ password if set) | Supabase | Until the gift or account is deleted (gifts don't expire) | See ✓ · Fix ✓ (7 days) · Download ✓ · Delete ✓ (account; single gift by email) |
| 6 | Drafts (gifts in progress, incl. photos) | Sender | Saving work in progress | No | Device: browser IndexedDB. Signed in: `drafts` table + `gift-media/<user>/drafts/` | The person | Supabase (signed-in only) | 60 days untouched, or until sent/deleted | See ✓ (/drafts) · Download ✓ (account copy) · Delete ✓ |
| 7 | Gift password | Sender (set), recipient (types it) | Optional lock | No | `gifts.password_hash` (scrypt hash only) | Server code only | Supabase | With the gift | Can change/remove for 7 days; never shown |
| 8 | Unlock cookie | Recipient | Remembers a gift was unlocked on that device | Only if a gift has a password | Recipient's browser (`tt_gift_<slug>`, HttpOnly, 1 year) | That browser | — | 1 year or until cleared | Clear in browser |
| 9 | Open counts and first/last open time | Recipient (aggregate, not identified) | Lets the sender see it was opened | Automatic | `gifts.open_count`, `first_opened_at`, `last_opened_at` | Sender | Supabase | With the gift | Download ✓ (sender) |
| 10 | Payment references: Razorpay order & payment IDs, amount, date, status | Sender | Confirming payment, refunds, accounting | Yes, to pay | `payments` table; `gifts.razorpay_order_id/payment_id` | Server code only (no browser access) | Razorpay (they hold the payment itself) | Account life; anonymised (unlinked) on deletion and kept for tax/accounting **[OWNER: confirm period, commonly 8 years under Indian tax law]** | Download ✓ · Delete: unlinked, not erased |
| 11 | Card / UPI / bank details | Sender | Payment | Yes, to pay | **Never reaches us.** Entered in Razorpay's window | Razorpay only | Razorpay | Razorpay's policy | Via Razorpay |
| 12 | Contact-form email + message | Visitor | Answering them | Yes, to write to us | Resend (in transit) and our Gmail inbox | Owner | Resend, Google (Gmail) | As long as needed to help **[OWNER: set a period, e.g. 12 months]** | Ask by email |
| 13 | IP address | Everyone | Security, rate limiting, hosting | Automatic | Vercel request logs; `rate_events.key` holds only a **keyed hash** of it, for 1 day | Owner (Vercel dashboard), server code | Vercel, Supabase | Rate-limit hash: 1 day. Vercel logs: per Vercel plan (short) | Not linked to an account by us |
| 14 | Device/browser info, page speed | Visitors | Site speed measurement | Automatic | Vercel Speed Insights (no cookies, no identifiers) | Owner (aggregate only) | Vercel | Vercel's retention | Aggregate only |
| 15 | Device-only preferences | Visitors | UI conveniences | Automatic | Browser localStorage/sessionStorage: sign-in nudge seen, tour seen, "own gift" marker, checkout choices during sign-in, continue-chip hidden | That browser | — | Until cleared | Clear in browser |
| 16 | Supabase session | Senders | Staying signed in | Yes, when signed in | Browser localStorage (`sb-…-auth-token`) | That browser; Supabase | Supabase | Until sign-out/expiry | Sign out |

## Collected indirectly (no form field)
- **Vercel** (hosting): every request's IP, user agent, URL, time, in request logs.
- **Supabase**: API request logs (IP, time) for auth and database calls.
- **Google** (only if "Continue with Google" is used): Google's own sign-in cookies on Google's domain.
- **Razorpay**: its checkout window sets its own cookies and collects payment and device data for fraud checks, under Razorpay's policy.
- **YouTube**: when a recipient presses play on a YouTube song, it loads from `youtube-nocookie.com` (privacy-enhanced mode; YouTube still sees the IP).
- **External song links**: if a sender pastes a direct audio link, the recipient's browser fetches it from that site (that site sees the IP).

## Not collected
No precise location, no phone numbers, no government IDs, no analytics or advertising trackers, no third-party ad cookies, no automated decisions or profiling.
