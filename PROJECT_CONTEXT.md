# Budget-in Project Context — V3.5

Product: Indonesian personal finance web app / PWA.
Repository: https://github.com/ayyunnan/monthly-budget
Production URL: https://ayyunnan.github.io/monthly-budget/
Baseline: user-supplied V3.4 files; V3.5 builds on that implementation.

## Confirmed decisions
- Database: Supabase PostgreSQL.
- Workflow: automatic carry-forward from previous month as a draft.
- Authentication: email/password.
- Post-submit revision: overwrite the current month record (no revision history).

## V3.5 behaviour
- Each user/month has one `monthly_budgets` row.
- Existing V3.4 month object is stored in JSONB to preserve the current data model.
- On first login, if cloud has no rows, existing local months are imported.
- If cloud already has data, cloud rows are canonical and only local months absent from cloud are imported.
- Creating a new month carries income, categories, amounts, payment modes and weekly settings from the immediately previous month if it exists; if not, the most recent earlier month is used.
- New month resets paid flags, weekly reports, submitted status and actual balances.
- Drafts autosave to cloud.
- Submit marks the month as submitted and records the timestamp.
- Editing a submitted month overwrites the same record.
- RLS restricts all rows to the authenticated owner.

## Setup required
- Run `schema.sql` in Supabase SQL Editor.
- Fill `config.js` with the Supabase Project URL and publishable/anon key.
- Enable Email provider in Supabase Auth.
- Deploy on HTTPS/GitHub Pages.
- Never put service_role key or database password in frontend.

## Source files
`index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `config.js`, `schema.sql`, `icon-192.png`, `icon-512.png`, `README.md`, `CHANGELOG.md`.

## V3.5.1 hotfix
- Supabase URL and publishable key filled from user-provided project details.
- Authentication card constrained to viewport width to fix mobile horizontal overflow.

## V3.5.2 UI hotfix
- Restored full desktop width; previous V3.5.1 global max-width caused a 760px shell cap on desktop.
- Wide desktop uses a 12-column grid; medium desktop/tablet uses single-column flow; mobile retains bottom navigation.
- Material Symbols Rounded icons added for common controls and categories.
- Service worker cache key: `budget-in-v3.5.2-cache`.

## V3.6 — Account recovery
- Forgot Password uses Supabase `resetPasswordForEmail` and redirects to `https://ayyunnan.github.io/monthly-budget/?auth=reset`.
- Recovery page validates new password (minimum 8 chars) and confirmation, then calls `auth.updateUser({password})`.
- On success, signs out, clears recovery URL, and returns to sign-in.
- Password visibility toggle available on login, registration and reset forms.
- Supabase Auth URL Configuration must allow the exact GitHub Pages redirect URL.
- Service worker cache: `budget-in-v3.6-cache`.

## V3.7 — Trend & iOS PWA usability
- Responsive line chart with budget, recorded actual, and planned free-money series.
- Account dialog contains theme switch, backup shortcut, and two-step logout confirmation.
- Direct topbar theme control remains.
- iOS safe-area insets for standalone display.
- Standalone PWA hides Add to Home Screen hint.
- Supabase config retained from user's confirmed working config.
- Service worker cache: `budget-in-v3.7-cache`.
