# Farm Manager V8 — Smart Farm

This Android-friendly package upgrades the working V7.3 system to V8 without changing
the existing database structure, user accounts, permissions or farm records.

## What is new

- Smart Planner automatically prioritizes overdue field work, today's activities,
  transplant dates, approaching harvest windows, low stock and equipment service
- A practical seven-day work plan is created from the existing Work Calendar records
- Automatic inventory reorder suggestions and equipment service warnings
- Live irrigation overview for recorded operating hours, fuel use and average pressure
- Field-by-field performance analytics for revenue, costs and estimated profit
- Print-friendly farm report that can be saved as PDF from the browser
- Downloadable field-performance CSV
- Faster Android navigation with a fixed Home, Planner, Calendar and More bar
- Clear online/offline connection indicator
- Activity-list duplicate buttons from V7.3 have been corrected

All V7.3 modules remain available, including secure sign-in, role permissions,
Users & Access, nursery, fields, crop cycles, activities, irrigation, sprays,
inventory, harvests, equipment, financials and the audit log.

## Upgrade

1. Extract `farm-manager-v8-smart-farm-android-flat.zip`.
2. Upload every extracted file to the top level of the existing GitHub repository.
3. Replace files with the same names and commit to the `main` branch.
4. Wait for Netlify to finish deploying.
5. Sign in normally. Existing records and users will load automatically.

Do not upload the ZIP itself. Upload the extracted files.

## Supabase

V8 requires no new SQL and no new Edge Function. It continues using the working
`super-handler` function from V7.3. Do not recreate or rename that function.

## Reports

Open **Analytics & Reports**:

- Tap **Print / Save PDF**, then choose the phone's Save as PDF option.
- Tap **Download field CSV** for a spreadsheet-ready field profitability report.

Smart Planner recommendations depend on dates, stock reorder levels and service details
entered in the existing modules. More complete records produce a more useful plan.
