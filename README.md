# Budget-in V4.2

Budget-in is a personal-finance Progressive Web App built with HTML, CSS, vanilla JavaScript, GitHub Pages, and Supabase.

## What's new
- User-selected B-wallet monogram logo and matching PWA icons.
- Premium blue visual system with refined light and dark modes.
- Responsive desktop/tablet/mobile layouts with iPhone notch and Dynamic Island safe-area handling.
- Forward-month planning: copy all income and budget nominal values from the selected month into the following month.
- Paid flags, weekly actual records, and actual balances reset in the new draft.
- Existing destination months are protected from accidental overwrite.

## Files
- `index.html` — application shell
- `styles.css` — responsive UI, themes, safe areas, motion
- `app.js` — budget logic, forward-month draft, local storage and Supabase sync
- `config.js` — existing Supabase URL and publishable key
- `sw.js` — service worker with V4.2 cache namespace
- `manifest.webmanifest` — PWA metadata
- `icon-192.png`, `icon-512.png` — selected B-wallet app icons
- `brand-mark-source.png` — original square brand mark
- `schema.sql` — reference schema; do not rerun during normal deployment

## Deploy safely
1. Download a fresh backup from the deployed application.
2. Test this candidate build using a separate test account in the existing Supabase project.
3. Verify login, cloud sync, monthly draft copying, weekly records, history, restore, and multi-device refresh.
4. Replace repository root files with the contents of this folder.
5. Commit and wait for GitHub Pages deployment.
6. Reopen the PWA and verify the V4.2 service worker cache.
7. Keep the previous production commit available for rollback.

Do not change the Supabase URL or publishable key. Never commit a Supabase service-role key.
