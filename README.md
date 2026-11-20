# Budget-in V3.8 — Smart Refresh & iOS Experience

Budget-in is an Indonesian personal-finance PWA hosted as a static site on GitHub Pages. Supabase provides email/password authentication and per-user monthly budget storage.

## V3.8 highlights
- Instant local UI updates after edits; ordinary changes do not reload the page.
- Manual cloud refresh button in the top header.
- Supabase Realtime listener for changes to the signed-in user's monthly budgets, with a debounced refresh.
- Silent refresh when the app returns to the foreground after 45 seconds and when the network comes back online.
- iOS safe-area support for Dynamic Island/notch and the Home Indicator.
- Updated service worker cache and network-first strategy for the HTML/CSS/JS app shell, with offline fallback.
- Existing account, password recovery, monthly budgets, weekly reports, history, trend chart, backup and theme features retained.

## Files
- `index.html` — application shell (GitHub Pages entry point)
- `styles.css` — responsive UI and iOS safe-area styles
- `app.js` — budget logic, local-first rendering, Supabase sync and Realtime refresh
- `config.js` — Supabase project URL and publishable key
- `schema.sql` — PostgreSQL table and Row Level Security policies
- `sw.js` — PWA service worker
- `manifest.webmanifest` — PWA metadata
- `icon-192.png`, `icon-512.png` — official B-in icons
- `CHANGELOG.md`, `PROJECT_CONTEXT.md`, `QC_REPORT.md` — project documentation and test record

## Deploy to the existing GitHub repository
1. Back up the current production data using the app's Backup & Pemulihan feature.
2. Extract this ZIP.
3. Upload the contents of this folder to the root of `ayyunnan/monthly-budget`, replacing the matching app files. Keep the file named exactly `index.html`.
4. Commit with message `Budget-in V3.8 Smart Refresh & iOS UX`.
5. Wait for GitHub Pages deployment to finish.
6. Open the website, sign in, tap the refresh icon once, and verify the sync status becomes `Tersinkron`.
7. On iPhone, close the installed PWA completely and reopen it. If the old shell remains, remove the old Home Screen shortcut and add the current website again after the deployment has updated.

## Supabase setup and security
- The frontend uses the Supabase publishable key in `config.js`. A publishable/anon key is intended for browser clients when Row Level Security is correctly enabled.
- Never place a `service_role` key, database password, or other privileged secret in frontend code.
- The `monthly_budgets` table must have RLS enabled and policies restricting rows to `auth.uid() = user_id`.
- Supabase Realtime must be enabled for `public.monthly_budgets` in the project's Realtime/replication settings for push updates to work. If it is not enabled, manual refresh and foreground/online refresh remain available.
- GitHub Pages is static hosting; the database and authentication are provided by Supabase.

## Refresh behaviour
- Local changes are rendered immediately from application state and saved to localStorage.
- Cloud writes are queued to avoid out-of-order writes from rapid edits.
- Manual refresh waits for queued local writes, fetches cloud rows, then updates the in-memory state and local cache.
- Local-only months are preserved and uploaded; they are not silently deleted during refresh.
- Realtime updates are debounced to avoid repeated rendering during bursts of database events.

## Notes
This package is based on the user-confirmed V3.7 HOTFIX source files. The supplied `config.js` values are retained unchanged. Test the deployment with the existing Supabase account before making further schema changes.
