# Data retention and deletion policy: TyniTales

_Last updated: 17 November 2026. **[OWNER]** = confirm or set._

| Data | Kept for | How it's removed | Exceptions |
|---|---|---|---|
| Account (email, name, picture, sign-off) | While the account exists | **Delete account** (profile) removes it immediately; sessions revoked | — |
| Live gifts (content, photos, songs) | While the account exists (gifts don't expire) | Deleted with the account; single gifts on request by email | Copies in provider backups expire on the provider's schedule |
| Account drafts and their photos | 60 days after last edit | Daily job deletes draft rows; then deletes their photos if no gift or draft uses them | — |
| Device drafts | 60 days after last edit | Removed by the site in that browser; or when the account is deleted on that device | Lives only in the browser |
| Payment references | Account life, then kept **unlinked** from the person | `user_id` set to null when the account is deleted | Indian tax/accounting law. **[OWNER: confirm period with your CA, commonly 8 years]** |
| Rate-limit records (keyed IP hashes) | 1 day | Daily job | — |
| Contact-form messages | **[OWNER: e.g. 12 months]** | Delete from Gmail / Resend | Ongoing disputes |
| Hosting/request logs | Provider defaults (short) | Automatic at the provider | — |
| Backups | Supabase free plan: none user-restorable. **[OWNER: if you upgrade, note backup retention here]** | Expire automatically | — |

**Rules:** don't keep personal data "just in case"; if a new kind of data is added, add a row here first.

**Deletion completeness:** the delete-account endpoint removes uploaded files in the user's storage folder, then the auth user (which cascades to profile, gifts and drafts). Its result is returned to the user. Third-party copies (Razorpay, Resend, Gmail) follow those providers' policies, and the deletion message says so.
