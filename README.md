# Budget-in V4.4

Mobile-first personal-finance PWA. See `PROJECT_CONTEXT.md` for the planning-month vs actual-use-month model and `CHANGELOG.md` for updates.

## Deploy
1. Back up current production data and source.
2. Test this candidate using a separate Supabase test account.
3. Upload the contents of this folder to the GitHub Pages repository root.
4. Wait for deployment, then hard-refresh/close and reopen the PWA to activate the V4.4 service worker.
5. Verify login, cloud sync, planning month, next-month actual tracking, weekly reports, trends, restore, and iPhone safe areas.

Do not rerun `schema.sql`, and do not replace `config.js` with a service-role key.
