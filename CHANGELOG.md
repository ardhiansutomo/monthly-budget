# Budget-in V4.4

## Added
- Mobile-first app layout across phones, tablets, and desktop browsers. Desktop now presents a centered app-like workspace rather than a wide admin dashboard.
- Safe-area padding retained for iPhone notch, Dynamic Island, and home indicator.
- Weekly actual tracking now follows the linked usage month (`weeklyMonthKey`), one calendar month after the planning month for new plans.
- November plan therefore tracks December actuals; a December plan tracks January actuals.
- Existing legacy weekly history without a month mapping is preserved against its original month during migration.
- Weekly allowance calculation uses the number of calendar periods in the linked usage month.
- Trend visualization upgraded to grouped bars for budget vs weekly actual, with a utilization percentage line and plan→usage month labels.
- Service worker cache namespace bumped to V4.4.

## Branding
- `brand-mark-source.png` is a byte-for-byte copy of the exact logo image supplied by the user. No redraw, recoloring, or regeneration.
- Existing app icon crops are retained to keep the wallet mark recognizable at launcher sizes.

## Preserved
- Supabase URL, publishable key, authentication, RLS schema, realtime sync, and local-first storage architecture.
- Existing financial definitions: paid flags represent disbursement; actual spending is weekly records only.
- Forward-month draft behavior, with the next draft tracking its own following usage month.

## Validation
- Static JavaScript/CSS/HTML/manifest checks performed.
- Live Supabase and real iPhone/Android browser acceptance tests remain required before production deployment.
