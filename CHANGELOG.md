# Budget-in V4.2 — Brand, Responsive UI & Planning Polish

## Brand identity
- Replaced the previous generic wallet mark with the user's selected Budget-in B-wallet monogram.
- Updated PWA icons (192×192 and 512×512), header branding, and authentication branding.
- Unified the visual identity around deep navy, vivid blue, and light blue.

## Light and dark themes
- Refined light mode with clearer contrast, brighter blue actions, cleaner surfaces, and consistent shadows.
- Refined dark mode with layered navy surfaces, improved text contrast, blue focus states, and coordinated chart colors.
- Preserved the theme toggle and local theme preference.

## Responsive and iOS
- Added safe-area handling for iPhone notch, Dynamic Island, and home indicator.
- Kept the viewport-fit=cover configuration and adjusted sticky header, bottom navigation, dialogs, and authentication overlay.
- Added compact layouts for 390px-and-smaller screens, including iPhone 14 and iPhone 14 Pro widths.
- Improved long budget names, amount columns, and action-button wrapping to prevent horizontal overflow.

## Forward-month planning
- The next-month action now clearly says “Salin ke [bulan]”.
- Copies monthly income, all category names and amounts, payment modes, and weekly-monitoring settings.
- Resets paid checkboxes, weekly actual records, and actual balances for the target month.
- Existing target months are never overwritten; the action offers to open the existing month instead.
- New installations continue to start with the next calendar month.

## Motion and accessibility
- Added restrained transitions and entrance motion.
- Preserved `prefers-reduced-motion`.
- Added consistent visible keyboard focus styles.

## Preserved
- Existing Supabase URL, publishable key, authentication, password recovery, Realtime, and monthly budget schema.
- Existing local-first storage and V3.x legacy data normalization.
- Financial definitions: disbursement and weekly actual spending remain separate.
