# Budget-in V4.4 QC Report

## Static validation
- JavaScript syntax: passed (Node.js check).
- CSS syntax: passed (tinycss2 parser).
- HTML references and manifest JSON: passed.
- Logo source SHA-256 matches the user-supplied source exactly.
- Service worker cache namespace: V4.4.

## Logic checks
- New plan `2026-11` resolves weekly actual period `2026-12` (5 calendar periods).
- New plan `2026-12` resolves weekly actual period `2027-01` (5 calendar periods).
- Existing historical records with `weeks` and no mapping retain their original plan month as the legacy actual month.
- Next-plan copy resets weekly actuals and paid flags and links to the following calendar month.

## Not verified
- Live Supabase authentication, writes, realtime, and multi-device synchronization.
- Actual rendering on physical iPhone 14/14 Pro, Android devices, and desktop browsers.
- Production financial reconciliation.

Candidate build only; test before production deployment.
