# Changelog

## V3.5
- Applied official B-in icon to the in-app header and retained the supplied 192/512 PWA icons.
- Refined popup, form, responsive and mobile styling; added subtle motion with reduced-motion consideration.
- Added email/password Supabase Auth gate and account sign-out.
- Added Supabase PostgreSQL persistence using a per-user, per-month JSONB row.
- Added RLS SQL schema for private per-user data.
- Added cloud sync indicator and first-login V3.4 localStorage migration.
- Added explicit monthly budget Submit action and Draft/Submitted states.
- Added automatic month carry-forward from the immediately previous month when available.
- New month resets paid flags, weekly reports and actual balances.
- Submitted month edits overwrite the current month record, per user decision.
- Updated service worker cache to V3.5 and limited cache cleanup to Budget-in caches.

## V3.4 baseline retained
- Editable monthly income and budget categories, Cash/Cashless, completion checkboxes, pending cash requirement.
- Per-category weekly reports, monthly history, trends, balances, backup/restore and theme toggle.
