# Privacy audit report: TyniTales

_Audit date: 17 November 2026. Inputs: the code, the schema, the third-party integrations, and the live site. Companion documents: `DATA_INVENTORY.md`, `THIRD_PARTY_DATA_PROCESSORS.md`, `DATA_RETENTION_POLICY.md`, `COOKIE_POLICY.md`, `INCIDENT_RESPONSE_PLAN.md`, `PRIVACY_POLICY.md`, `TERMS_AND_CONDITIONS.md`. This isn't legal advice; a qualified lawyer should review it before launch._

## Findings

| ID | Issue | Severity | What changed | Status |
|---|---|---|---|---|
| P1 | No self-serve way to get a copy of your data | Medium | Profile → "Download my data" (`GET /api/account/export`): authenticated, own data only, built on request, never stored or linked, `no-store`, rate-limited, logged by user ID | Fixed |
| P2 | Name couldn't be corrected | Low | Profile → "Your name" (column grant on `display_name`) | Fixed: needs SQL |
| P3 | Privacy policy missing: abuse-prevention IP use, international transfers, breach notice, rights detail, unlock cookie | Medium | /privacy updated (also mirrored in `PRIVACY_POLICY.md`) | Fixed |
| P4 | Under-18s allowed "with permission": DPDP needs *verifiable* parental consent for children's data | Medium | Accounts are now 18+ only (privacy and terms). Self-declared, with no age check | Fixed (policy); age check: needs legal review |
| P5 | Deleting an account left drafts in that browser | Low | Delete now clears the device's draft store; the dialog lists what's deleted and what's kept | Fixed |
| P6 | Draft photos kept past the stated 60 days | Low | Daily cleanup of unused draft photos | Fixed: needs SQL |
| P7 | Payment-record retention period not stated | Medium | Documented as "as tax law requires" | **Open: owner + CA to set a period** |
| P8 | Full postal address and legal entity not shown | Medium | City shown; flagged in policy and terms | **Open: owner** |
| P9 | Gifts contain third parties' data (recipients' names and photos) | Medium | Terms require permission; privacy asks for a parent's okay for children | Open: legal review |
| P10 | No self-serve email change | Low | Via support (documented) | Accepted |
| P11 | Contact-message retention not set | Low | Flagged | **Open: owner** |
| P12 | Anyone with a gift link can see the gift | Info | By design, and disclosed; optional password; unlisted, not indexed | Accepted |
| P13 | Cookie consent banner | Info | **Not needed:** no non-essential cookies or trackers exist. Cookie policy explains this. Add consent before ever adding analytics | Not applicable |

## Phase 10: answers
1. **What personal information is collected?** Email; name and picture (Google only); sign-off; gift content (including people named or pictured in gifts); drafts; payment references (not payment details); contact messages; IP and browser data in hosting logs; a one-day keyed-hash IP for rate limits.
2. **Anything unnecessary?** No. Raw IPs aren't stored by us (only a hash, for one day); there are no analytics or ad trackers; Razorpay gets no gift content.
3. **Where is it stored?** Supabase (database and storage), the user's own browser (drafts and session), and provider logs (Vercel, Resend). Regions: **owner to confirm the Supabase project region**; Vercel and Resend are US by default.
4. **Which third parties receive it?** Vercel, Supabase, Razorpay, Resend, Google, YouTube (see the processors file).
5. **Can users see their data?** Yes: profile → Your data, gifts and drafts.
6. **Can users download it?** Yes: Download my data (JSON).
7. **Can users delete their account and data?** Yes, self-serve. Payment references stay, unlinked; third-party copies follow those providers' policies, and the dialog says so.
8. **Are consent and cookie preferences respected?** No optional cookies or trackers exist, so there's nothing to consent to. Necessary storage is disclosed.
9. **Are the privacy policy and terms accurate?** Yes, as of 17 November 2026, matched to the code. Items marked [OWNER] need facts only the owner has.
10. **Remaining gaps:** P7, P8, P9, P11; a lawyer's review of the DPDP obligations as they phase in (notices, children, breach reporting timelines); GDPR/CCPA are likely not applicable (India-focused service, INR pricing, below the CCPA thresholds), but confirm if you market abroad.

## Applicable law (to confirm with a lawyer)
- **India, DPDP Act 2023 and DPDP Rules 2025 (phased in):** notice, consent, rights (access, correction, erasure, grievance), children (verifiable parental consent), security safeguards, and breach notification to the Board and to affected people.
- **IT Act 2000 / SPDI Rules 2011:** reasonable security practices; grievance officer.
- **Consumer Protection (E-Commerce) Rules 2020:** seller details, grievance officer (48-hour acknowledgement, one-month resolution), refund policy, price including taxes.
- **CERT-In Directions 2022:** report certain incidents within 6 hours.

**Verdict: no claim of compliance is made.** The technical controls and disclosures are in place; owner facts and a legal review are outstanding.
