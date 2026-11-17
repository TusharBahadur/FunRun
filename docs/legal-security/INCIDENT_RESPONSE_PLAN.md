# Security incident and data breach response plan: TyniTales

_Last updated: 17 November 2026. Owner/responder: Tushar Bahadur (support.tynitales@gmail.com). **[OWNER]** add a phone number for emergencies._

## 1. Spot it
Warning signs: unexpected Supabase/Vercel/Razorpay/Resend emails; strange spikes in Vercel logs or Supabase usage; payments you don't recognise; gift links or accounts reported as tampered with; keys showing up in public (GitHub, chats).

## 2. Log it (start straight away)
Keep a running note: time noticed, what was seen, who noticed, every action taken and when. Don't delete logs or evidence.

## 3. Contain it (first hour)
- **Leaked or suspected keys: rotate immediately.**
  - Supabase: Project Settings → API → roll the secret key, then update `SUPABASE_SECRET_KEY` in Vercel and redeploy. Rolling it also invalidates all gift unlock cookies.
  - Razorpay: Account & Settings → API Keys → regenerate, then update Vercel. Rotate the webhook secret too.
  - Resend: delete and recreate the API keys, then update Vercel and Supabase SMTP.
  - `CRON_SECRET`: replace it in Vercel.
- **Compromised accounts:** Supabase → Authentication → Users → sign the user out or delete them. To sign *everyone* out, rotate the JWT secret.
- **Abuse in progress:** temporarily disable the affected route (redeploy without it), or pause payments by removing the Razorpay keys from Vercel. The site then publishes free; disable publishing too if needed.
- **Never** hide or quietly "fix" a suspected breach without logging it.

## 4. Work out what was affected
Which data (see `DATA_INVENTORY.md`), which people, which period, and how (logs in Vercel, Supabase → Logs, Razorpay → Reports).

## 5. Tell people (when required)
- **India (DPDP Act 2023 / DPDP Rules 2025):** a personal data breach must be reported to the **Data Protection Board of India** and to **each affected person**, without delay. A detailed report is due within **72 hours** of becoming aware. **[OWNER: confirm current obligations with a lawyer: the Rules are phasing in.]**
- **CERT-In:** certain cyber incidents must be reported to CERT-In within **6 hours** of noticing them (CERT-In Directions, 2022). **[OWNER: confirm applicability]**
- **Users:** plain-language email: what happened, what data, what we've done, what they should do, who to contact.
- **Payments:** if payment data might be involved, tell Razorpay straight away.

## 6. Recover
Fix the root cause, redeploy, confirm the fix with tests, restore any lost data from provider backups where possible, and watch closely for a week.

## 7. Review
Within two weeks, write up the timeline, the root cause, what worked and what didn't, and the follow-up changes. Update this plan and the audit reports.
