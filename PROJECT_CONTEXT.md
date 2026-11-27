# Budget-in V4.3 — Project Context

## Baseline
- Personal-finance PWA hosted on GitHub Pages.
- Frontend: HTML, CSS, Vanilla JavaScript.
- Backend: existing Supabase project and `monthly_budgets` table.
- Exact user-supplied wallet + Budget-in logo is the primary brand source (`brand-mark-source.png`).

## Locked financial rules
1. Monthly paid checkbox means funds have been disbursed/paid, not actual spending.
2. Actual spending is the sum of recorded weekly expenses only.
3. Weekly monitoring is selective and can be toggled per budget category.
4. Disabling weekly monitoring must not erase historical weekly records.
5. Disbursement and actual spending must never be added together.

## Forward-month planning
- New installations open on the next calendar month.
- The next-month action copies monthly income, budget category names and nominal amounts, payment modes, and weekly-monitoring preferences into the next calendar month.
- The new month is a draft. Paid flags, weekly actuals, and actual balance amounts reset.
- Existing destination months are never overwritten; the user can open the existing destination.
- Weekly recommended allowance is recalculated from the target month's number of calendar monitoring periods.

## Visual system
- Exact uploaded logo image is retained unchanged in `brand-mark-source.png`.
- PWA launcher icons and favicon are crops of the wallet mark from that exact image; no logo redraw.
- Refined blue light and dark themes.
- Responsive desktop sidebar, tablet layout, and mobile bottom navigation.
- Safe-area support for iPhone notch, Dynamic Island, and home indicator.
- Motion respects `prefers-reduced-motion`.

## Deployment safety
- Keep `config.js` connected to the existing Supabase project.
- Do not add a service-role key or change the database schema for this release.
- Back up production data before deployment.
- Test authentication, cloud sync, monthly copy, history, weekly monitoring, restore, and PWA installation using a separate test account/device.
