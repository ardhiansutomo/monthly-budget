

## V3.8 — Smart Refresh & iOS Experience
- Active baseline is V3.8, built directly on the user-confirmed V3.7 HOTFIX files.
- Local edits render immediately; no browser reload is used for ordinary budget changes.
- Manual refresh fetches all authenticated user's monthly rows from Supabase, updates local state, and preserves local-only months by importing them.
- Supabase Realtime watches changes to the authenticated user's monthly_budgets rows and schedules a debounced refresh.
- Returning to the app after 45 seconds and regaining network connectivity trigger a silent refresh attempt.
- iOS topbar reserves env(safe-area-inset-top); bottom navigation reserves env(safe-area-inset-bottom).
- Service worker cache key: budget-in-v3.8-cache.
