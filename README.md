# Budget-in V3.5 — Personal Finance Management

## Highlights
- Official B-in app icon applied to the in-app header and PWA.
- Refined responsive UI, modal styling, status chips, sync indicator and subtle motion.
- Email/password authentication through Supabase Auth.
- Cloud storage in Supabase PostgreSQL (`monthly_budgets`) with Row Level Security.
- Monthly carry-forward: when a new month is opened, the immediately previous month's budget is copied as a draft when available; paid flags and weekly reports reset, and actual balances start at zero.
- Explicit Submit Budget action. Submitted state is stored in the cloud.
- Editing a submitted month overwrites its current saved record, as selected by the owner.
- Existing V3.4 localStorage data is imported on first login if the cloud account has no budgets; when cloud data exists, only missing local months are imported.

## V3.5.1 hotfix
- `config.js` is prefilled with the Supabase Project URL derived from the dashboard link and the publishable key supplied in the conversation. If Supabase still reports a network/DNS error, copy the Project URL directly from Project Overview and compare it character-for-character with `config.js`.
- Authentication gate layout has been constrained to the viewport to prevent horizontal clipping on narrow mobile screens.

## Setup Supabase

**Cloud connection is not active until you fill `config.js` with your own project URL and publishable/anon key.** The supplied package intentionally contains blank credentials; no live Supabase project or credentials were provided in this conversation.

1. Create a Supabase project.
2. Open `schema.sql` in Supabase Dashboard → SQL Editor and run the complete script.
3. In Supabase Authentication → Providers, enable Email. Configure email confirmation according to your preference.
4. Copy the Project URL and publishable/anon key from Project Settings → API.
5. Edit `config.js`:
   - `url`: your Project URL
   - `anonKey`: your publishable/anon key
6. Do not use the `service_role` key or database password in frontend files.
7. Deploy all files to the root of the existing GitHub Pages repository.
8. Open the site, create an account, and sign in.

## Data model
A single `monthly_budgets` row stores each user's month. The `data` JSONB field preserves the existing V3.4 month structure, including categories, payment modes, weekly reports and balances. RLS restricts every row to `auth.uid() = user_id`.

## Draft and submit behaviour
- New month: carry forward previous month's categories, amounts, income and weekly settings.
- New month resets paid status, weekly usage and balances.
- Draft changes save to the same month row.
- Submit changes status to `submitted` and stores `submitted_at`.
- Editing a submitted month overwrites the same row (no version history), matching the selected overwrite policy.
- Earlier months remain separate rows and are not changed by a new month's edits.

## Local development
Serve the folder over HTTP (not `file://`) because Supabase Auth and the service worker require an HTTP(S) origin. A local static server is sufficient.

## Important limitations / deployment notes
- Supabase credentials have not been supplied in this package; cloud login will remain in setup-required state until `config.js` is filled.
- Browser localStorage is retained as a local cache and first-login migration source. Cloud sync requires a working internet connection.
- Supabase free-plan limits and email delivery settings depend on the project configuration.
- Run a backup from the existing V3.4 app before replacing the production deployment.

## V3.5.2 UI hotfix
- Desktop app shell now expands across the available viewport beside the 252px sidebar.
- Wide desktop dashboard uses a 12-column grid; tablet and mobile retain responsive layouts.
- Material Symbols Rounded icon set used for navigation, account, backup, theme and category icons.
- Service worker cache updated to V3.5.2.

## V3.6 — Password recovery setup (required)
In Supabase Dashboard:
1. Open Authentication → URL Configuration.
2. Set Site URL to `https://ayyunnan.github.io/monthly-budget/`.
3. Add this exact Redirect URL: `https://ayyunnan.github.io/monthly-budget/?auth=reset`.
4. In Authentication → Email Templates, ensure the Reset Password template uses the Supabase confirmation URL (`{{ .ConfirmationURL }}`) or the current default recovery link.
5. Keep Email provider enabled.

In the app, the user selects **Lupa password?**, enters their account email, opens the email link, creates and confirms a new password, and is returned to the login screen after the password is updated.

Password visibility is available through the eye icon beside password fields. Passwords are never displayed unless the user explicitly toggles visibility.

**Email delivery note:** Actual delivery depends on the Supabase project's SMTP/email provider configuration and spam filtering. The app only requests the recovery email; it cannot guarantee inbox delivery.
