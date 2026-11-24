# Budget-in V4.0 — Financial Engine & Experience Modernization

## Added
- Separated monthly disbursement status from actual weekly spending.
- Actual spending now comes from recorded weekly entries only.
- Weekly history remains included in actuals when monitoring is later disabled.
- Added stricter month-key validation for new month creation.
- Added safer restore validation, pre-restore safety download, and sequential cloud upload of restored months.
- Added motion and interaction polish with reduced-motion support.
- Updated service worker cache namespace to V4.0.

## Preserved
- Existing Supabase project configuration and monthly_budgets schema.
- Existing authentication, password recovery, Realtime, and local-first UI architecture.
- Existing V3.8 stored month structure and legacy weekly fields.

## Important
This is a candidate build. Test with a separate test user in the existing Supabase project before replacing production files.

## Visual modernization pass
- Rebuilt the visual token layer for a more consistent premium finance dashboard.
- Refined desktop sidebar, wide-screen dashboard grid, mobile spacing, cards, forms, charts, and navigation.
- Improved dark-mode surfaces and contrast using shared design tokens.
- Added restrained hover, elevation, entrance, and press interactions.
- Preserved reduced-motion accessibility support.

## Salary Cycle & Calendar Monitoring update
- Added calendar-derived weekly periods using Monday-to-Sunday weeks with partial periods at month boundaries.
- Added selectable calendar week chips and date ranges in weekly monitoring.
- Submitting or editing a budget recalculates weekly recommended allowance from each enabled category's monthly amount and the number of calendar periods.
- Added `Draft bulan berikutnya` action. It copies budget categories and settings into the next month while resetting weekly records, paid flags, and actual balances.
- Refined dark-mode palette, surface contrast, chart colors, grid lines, and calendar states.
- Replaced application icons with a minimal wallet-calendar checkmark identity.
