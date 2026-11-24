# Budget-in V4.0 — QC Report

## Static checks
- JavaScript syntax: pending execution in this environment.
- HTML references: reviewed against repository filenames.
- Manifest: copied unchanged from V3.8.
- Supabase schema: unchanged; no migration included.
- Service worker cache: bumped to `budget-in-v4.0-cache`.

## Implemented checks
- Monthly paid checkbox is excluded from actual spending calculation.
- Weekly actuals include persisted entries even after monitoring is disabled.
- New month key validation checks month range 01–12.
- Restore validates JSON shape and each month, downloads a pre-restore safety snapshot, then uploads restored months sequentially when cloud is active. Cloud-only rows are intentionally not deleted.
- Reduced-motion preference is respected.

## Not yet verified
- Live Supabase authentication and cloud writes.
- Restore against production account.
- Realtime across devices.
- iOS/Android installed PWA behavior.
- Accessibility audit and Core Web Vitals.
- Financial reconciliation against user's real monthly records.

## Release status
Candidate build only. Do not replace production until acceptance tests pass.
