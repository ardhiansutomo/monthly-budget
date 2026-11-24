# Budget-in V4.0 — Project Context

## Baseline
- Source baseline: user-confirmed V3.8 repository.
- Hosting: GitHub Pages.
- Backend: existing Supabase project and `monthly_budgets` table.
- Frontend: HTML, CSS, Vanilla JavaScript, PWA.

## Locked business rules
1. Monthly paid checkbox means funds have been disbursed/paid, not actual spending.
2. Actual spending is the sum of recorded weekly expenses only.
3. Weekly monitoring remains selective and can be toggled per budget category.
4. Disabling weekly monitoring must not erase historical weekly records.
5. Disbursement and actual spending must never be added together.

## V4.0 implementation
- `paidActual(m)` represents disbursed funds.
- `actual(m)` represents weekly recorded spending only.
- Restore validates the backup structure, downloads a pre-restore snapshot, and uploads every restored month sequentially when cloud sync is active. Cloud-only rows are not deleted automatically to avoid destructive data loss.
- New month keys validate the month range 01–12.
- Motion layer respects `prefers-reduced-motion`.

## Deployment safety
- Do not execute `schema.sql` as part of routine deployment.
- Do not replace Supabase project URL or publishable key.
- Back up production data before deployment.
- Test with a separate user account in the same Supabase project first.
- Candidate build has not yet passed live Supabase acceptance tests.

## Visual system
- V4.0 visual layer is additive CSS over the existing HTML structure.
- Desktop uses a fixed workspace sidebar and wide dashboard grid.
- Mobile retains compact bottom navigation and safe-area handling.
- Light/dark themes share CSS design tokens.
- Motion is restrained and respects `prefers-reduced-motion`.
