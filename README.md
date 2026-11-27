# Budget-in V4.1

Personal-finance PWA using HTML, CSS, vanilla JavaScript, GitHub Pages, and the existing Supabase project.

## Deploy
1. Back up production data first.
2. Keep `config.js` connected to the existing Supabase project; do not replace its URL or publishable key. Never add a service-role key.
3. Upload the contents of this folder to the repository root.
4. Commit and wait for GitHub Pages.
5. Reopen the app and allow the V4.1 service worker cache to activate.
6. Test authentication, sync, monthly history, weekly records, backup/restore, and multi-device refresh using a separate test account before production use.

## Forward-month planning
- A new installation opens on the next calendar month. Existing saved active-month selections remain unchanged.
- The button `Buat [bulan berikutnya]` copies the selected month's income, budget category names and amounts, payment methods, and weekly-monitoring preferences into the next month.
- The new month is a draft. Paid checkboxes, weekly actuals, and actual balance amounts reset.
- Existing destination months are never overwritten.

## Financial definitions
- Allocated budget: planned category amounts.
- Disbursed funds: categories marked as paid.
- Actual spending: weekly recorded expenses only.
- The monthly paid checkbox is not added to actual spending.

## Files
`index.html`, `styles.css`, `app.js`, `config.js`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, and `schema.sql`.
