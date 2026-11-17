# Third-party data processors: TyniTales

_Last reviewed: 17 November 2026. **[OWNER]** marks things only the account owner can confirm (regions, contract terms)._

| Provider | What they receive | Why | Role | Safeguards | Retention | International transfer |
|---|---|---|---|---|---|---|
| **Vercel** (hosting, Speed Insights) | All web requests (IP, user agent, URLs), anonymous page-speed numbers | Serving the site | Processor | Vercel DPA (standard terms); HTTPS; no cookies for Speed Insights | Request logs: short, per plan. **[OWNER: check Vercel → Logs retention]** | Yes: US by default (Vercel functions region) **[OWNER: check project region]** |
| **Supabase** (database, sign-in, file storage) | Accounts (email, name, picture), gifts, photos, songs, drafts, payment references, rate-limit hashes | Storing the product | Processor | Row-level security; secret key server-only; HTTPS; scrypt for gift passwords | Until deleted (see retention policy); free plan has **no point-in-time backups** | Depends on project region **[OWNER: Supabase → Project Settings → General → Region]** |
| **Razorpay** (payments) | Email (prefill/receipt), internal account ID and template name in order notes, amount; the buyer enters payment details directly with Razorpay | Taking payments, refunds | Independent controller for payment data; processor for our order data | PCI-DSS (Razorpay); signatures verified; secret server-only | Razorpay's policy (regulatory retention) | India |
| **Resend** (email) | Contact-form email + message; sign-in-code emails (recipient address, code) | Sending email | Processor | API key server-only; rate limits | Resend's logs **[OWNER: Resend → Settings → data retention]** | US |
| **Google** (Sign in with Google; Gmail inbox) | When used: Google identifies the person and shares name, email, picture. Contact messages land in our Gmail | Sign-in; reading enquiries | Independent controller (Google account); Gmail as our mailbox provider | Basic scopes only (`openid email profile`) | Google's policy | Global |
| **YouTube** (song playback) | Recipient's IP and video ID when they press play | Playing a chosen song | Independent controller | `youtube-nocookie.com` privacy-enhanced embed | YouTube's policy | Global |

## Not used
No analytics (Google Analytics etc.), no advertising networks, no error-tracking SaaS, no customer-support tools, no AI/ML APIs on user data.

## Rules
- Send each provider only what its job needs (e.g. Razorpay gets no gift content).
- Don't add a new provider that receives personal data without updating this file, the data inventory and the privacy policy first.
