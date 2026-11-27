# Budget-in V4.4 Project Context

- PWA hosted on GitHub Pages; Supabase authentication and per-user monthly budgets retained.
- Planning month is the month in which the user prepares/submits the budget.
- Weekly actual-use calendar is stored separately in `weeklyMonthKey`. New planning month M tracks actual usage in M+1.
- Example: plan November → actual December; plan December → actual January.
- `weeks` remains keyed by week number within `weeklyMonthKey`; each month has a distinct plan record.
- Legacy records with weekly data and no `weeklyMonthKey` are migrated to their own original month to avoid silently moving historical actuals. New/empty records default to the following month.
- `Draft bulan berikutnya` copies budget inputs into the next planning month and resets paid flags, weekly actuals, and balances; its actual tracking month is one month after that new plan.
- The exact supplied logo is retained byte-for-byte as `brand-mark-source.png`.
- Desktop uses a centered app-like width; mobile retains bottom navigation and safe-area insets for iOS notch/Dynamic Island.
- Existing Supabase config/schema are unchanged; do not rerun schema.sql for deployment.
