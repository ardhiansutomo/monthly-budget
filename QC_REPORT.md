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

## Visual modernization checks
- CSS parsed with tinycss2: 0 syntax errors.
- Existing HTML structure and event IDs preserved.
- Responsive breakpoints reviewed for desktop, tablet, and mobile.
- Dark mode uses shared theme tokens and explicit component overrides.
- Visual regression on real browsers/devices remains pending.

## Salary-cycle/calendar checks
- December 2026 resolves to five periods: 1–6, 7–13, 14–20, 21–27, and 28–31 December.
- Weekly selector and history cards now render the calculated period count rather than a fixed four weeks.
- Draft-next-month action avoids overwriting an existing month and resets actual-use fields.
- Dark-mode chart and surface tokens updated.
- Browser-level UI interaction, Supabase write behavior, and multi-device acceptance tests remain pending.


## V4.1 checks
- Blue app icon generated from the user-approved Budget-in B monogram and resized to 192px and 512px.
- PWA manifest and service-worker cache namespace updated.
- New-install default planning month is computed dynamically as the next calendar month; saved active months are preserved.
- Next-month draft copies income and all budget setup fields, resets actual-use fields, and refuses to overwrite an existing destination.
- JavaScript syntax and package contents require final automated checks before deployment. Live Supabase acceptance testing remains required.
