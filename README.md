# Budget-in V4.0

Budget-in is a personal-finance PWA hosted on GitHub Pages. Supabase provides authentication and per-user monthly budget storage.

## Files
- `index.html` — application shell
- `styles.css` — responsive UI, themes, motion
- `app.js` — financial logic, local-first rendering, Supabase sync
- `config.js` — existing Supabase URL and publishable key
- `sw.js` — service worker
- `manifest.webmanifest` — PWA metadata
- `schema.sql` — reference schema; do not rerun during normal deployment
- `icon-192.png`, `icon-512.png` — app icons

## V4.0 financial definitions
- Allocated budget: planned category amounts.
- Disbursed funds: sum of categories whose monthly checkbox is checked.
- Actual spending: sum of weekly recorded expenses only.
- Weekly monitoring remains selective. Historical entries remain counted when monitoring is disabled.

## Deployment
1. Download a fresh backup from the currently deployed application.
2. Test this candidate build using a separate test account in the existing Supabase project.
3. Confirm login, cloud sync, weekly records, monthly history, restore, and multi-device refresh.
4. Replace repository root files with the contents of this folder.
5. Commit and wait for GitHub Pages deployment.
6. Reopen the PWA and verify the new service worker cache.
7. Keep the previous V3.8 commit available for rollback.

## Security
- The frontend publishable key is intended for browser use when RLS is correctly configured.
- Never commit a Supabase secret/service-role key.
- Keep user-specific financial values out of public source defaults.
