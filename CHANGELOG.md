# Changelog

## V3.5
- Applied official B-in icon to the in-app header and retained the supplied 192/512 PWA icons.
- Refined popup, form, responsive and mobile styling; added subtle motion with reduced-motion consideration.
- Added email/password Supabase Auth gate and account sign-out.
- Added Supabase PostgreSQL persistence using a per-user, per-month JSONB row.
- Added RLS SQL schema for private per-user data.
- Added cloud sync indicator and first-login V3.4 localStorage migration.
- Added explicit monthly budget Submit action and Draft/Submitted states.
- Added automatic month carry-forward from the immediately previous month when available.
- New month resets paid flags, weekly reports and actual balances.
- Submitted month edits overwrite the current month record, per user decision.
- Updated service worker cache to V3.5 and limited cache cleanup to Budget-in caches.

## V3.4 baseline retained
- Editable monthly income and budget categories, Cash/Cashless, completion checkboxes, pending cash requirement.
- Per-category weekly reports, monthly history, trends, balances, backup/restore and theme toggle.

## V3.5.1 — Supabase URL and mobile layout hotfix
- Corrected `config.js` to use the project reference from the supplied Supabase dashboard URL.
- Filled the Supabase publishable key supplied by the user (no secret/service-role key).
- Fixed authentication card horizontal overflow on narrow viewports, including iPhone 14 Pro width (393px).
- Added explicit min-width/max-width constraints to auth form, inputs, app shell and page containers.
- Kept mobile login card centered with safe viewport-based sizing.

## V3.5.2 — Desktop layout and responsive UI hotfix
- Fixed desktop shell width regression caused by the V3.5.1 global 760px max-width rule.
- Restored full-width desktop workspace with fixed 252px sidebar and full-width topbar.
- Added 12-column desktop dashboard composition for wide displays (1280px and above).
- Kept medium desktop/tablet in a comfortable single-column layout and mobile navigation below 1000px.
- Added Material Symbols Rounded icons for account, theme, backup, navigation and budget categories.
- Added explicit balance section grid placement and responsive typography/spacing.
- Bumped service-worker cache to `budget-in-v3.5.2-cache`.

## V3.6 — Account Recovery & Authentication Upgrade
- Added Forgot Password action on the sign-in screen.
- Added Supabase `resetPasswordForEmail()` flow with a dedicated recovery redirect.
- Added password recovery screen with new-password and confirmation fields.
- Added password update through Supabase Auth `updateUser({ password })`.
- After successful reset, the app signs out and returns to the sign-in screen with a success message.
- Added show/hide password controls for sign-in, sign-up and password recovery fields.
- Added validation for minimum 8-character recovery password and matching confirmation.
- Corrected Supabase Project URL to match the project reference in the user's dashboard URL.
- Bumped service-worker cache to `budget-in-v3.6-cache`.

## V3.7 — Trend & iOS PWA usability upgrade
- Rebuilt financial trend visualization as a responsive multi-series line chart with an actual-spending area, grid, compact value axis, point tooltips and three summary KPIs.
- Added an account/settings dialog accessible from the account icon.
- Added reliable in-app theme control, backup shortcut and two-step logout confirmation inside the account dialog, avoiding reliance on browser-native confirm dialogs in iOS standalone mode.
- Kept direct theme toggle in the topbar and forced action controls to remain visible on narrow iPhone widths.
- Added iOS safe-area handling for topbar and bottom navigation.
- Refined mobile header spacing and hid the sync label on narrow screens to preserve room for action buttons.
- Hid the install hint when the app is already running in standalone/PWA mode.
- Preserved Supabase URL and publishable key from the user's confirmed working configuration.
- Bumped service-worker cache to `budget-in-v3.7-cache`.

## Release packaging
- Full package: `Budget-in-V3.7-FULL.zip`.
- Existing Supabase configuration retained as supplied by the user and confirmed working.
