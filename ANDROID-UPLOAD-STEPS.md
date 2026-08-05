# Farm Manager V8.4 Android Upgrade

## 1. Activate Workforce & Payroll in Supabase

1. Open **Supabase → SQL Editor → New query**.
2. Open `database-v8-4-workforce-payroll.sql` from this package.
3. Copy the entire file into the SQL Editor and tap **Run** once.
4. Wait for **Success**.

Do not rerun the attendance SQL; your attendance calendar is already active. The V8.4
script preserves every existing farm, employee, attendance, user and production record.

## 2. Upload the app from Android

1. Extract `farm-manager-v8-4-full-workforce-payroll-vercel-flat.zip`.
2. In the existing Farm Manager GitHub repository, tap **Add file → Upload files**.
3. Select all nine extracted files and upload them at the repository's top level.
4. Replace matching files when GitHub asks.
5. Enter `Upgrade Farm Manager to V8.4 Workforce and Payroll`.
6. Commit directly to `main`.
7. Wait for Vercel to show **Ready**, then close and reopen Farm Manager.

## 3. First live check

1. Open **Employees** and complete one employee's wage profile.
2. Create a crew or a multi-field job under **Workforce & Jobs**.
3. Record the employee results and approve the completed work.
4. Open **Payroll**, select the month, generate the draft and review it before approval.

Employees remain internal records only and cannot sign in. Only accounts under
**Users & Access** receive Farm Manager access.
