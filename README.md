# Budget-in V4.3

Budget-in is a personal-finance Progressive Web App built with HTML, CSS, vanilla JavaScript, GitHub Pages, and Supabase.

## V4.3 brand update
- The exact logo image supplied by the user is preserved unchanged as `brand-mark-source.png`.
- PWA launcher icons and favicon use a square crop of the wallet symbol taken directly from that supplied image. No logo redraw or alternate symbol is used.
- Header and sign-in branding use the same wallet symbol asset alongside the Budget-in wordmark text.

## Preserved V4.2 functionality
- Premium blue visual system with refined light and dark modes.
- Responsive desktop/tablet/mobile layouts.
- iPhone notch, Dynamic Island, and home-indicator safe-area handling.
- Forward-month planning: copy income and all budget category names, nominal amounts, payment modes, and weekly-monitoring settings to the following month.
- New drafts reset paid flags, weekly actual records, and actual balance amounts.
- Existing destination months are protected from accidental overwrite.
- Existing Supabase authentication, password recovery, Realtime, and monthly budget schema remain unchanged.
- Motion respects `prefers-reduced-motion`.

## Files
- `index.html` — application shell
- `styles.css` — responsive UI, light/dark themes, safe areas, and motion
- `app.js` — budget logic, forward-month draft, local storage, and Supabase sync
- `config.js` — existing Supabase URL and publishable key; preserve it
- `sw.js` — service worker with V4.3 cache namespace
- `manifest.webmanifest` — PWA metadata
- `icon-192.png`, `icon-512.png` — wallet-symbol launcher icons from the exact supplied logo
- `favicon-32.png`, `favicon-64.png` — browser favicons
- `brand-mark-source.png` — exact original user-supplied logo image, unchanged
- `schema.sql` — reference schema; do not rerun during normal deployment

## Deploy safely
1. Download a fresh backup from the deployed application.
2. Test this candidate build using a separate test account in the existing Supabase project.
3. Verify login, cloud sync, monthly draft copying, weekly records, history, restore, and multi-device refresh.
4. Replace repository root files with the contents of this folder.
5. Commit and wait for GitHub Pages deployment.
6. Reopen the PWA and verify the V4.3 service worker cache and refreshed launcher icon.
7. Keep the previous production commit available for rollback.

Do not change the Supabase URL or publishable key. Never commit a Supabase service-role key.
