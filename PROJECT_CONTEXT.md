# Budget-in Project Context

Product: personal finance web app, Indonesian UI, GitHub Pages + PWA.
Repository: https://github.com/ayyunnan/monthly-budget
Production URL: https://ayyunnan.github.io/monthly-budget/
Current package baseline: V3.4 built from the user-uploaded V3.2 source files.

Product principles: make cashflow clear without shaming spending; distinguish budget allocation from actual spending; keep monthly history; simple weekly totals rather than transaction-by-transaction entry; responsive desktop admin and iPhone experience.

Key features: editable monthly income and budget categories, Cash/Cashless, completion checkboxes, automatic pending cash requirement, optional per-category weekly budget sections, weekly reports, monthly history, trends, backup/restore, light/dark theme, PWA.

Storage: localStorage key `mymoney_finance_v3`; data is browser/device local, not cloud-synced. Export backup before updates.

V3.4 specific: Jajan/Bensin weekly sections are independent and only show if weekly tracking is enabled and weekly amount > 0. Editor modal width is capped to avoid desktop overflow and adapts to mobile.

Update discipline: inspect current repository source and backup first; preserve data model and historical months; do not remove existing functionality without user approval; run syntax and functional checks; package complete ZIP and update changelog.
