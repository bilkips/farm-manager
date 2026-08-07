# Supabase note for V8.5

No new SQL is required when V8.4 Workforce & Payroll is already active.

Run `database-v8-4-workforce-payroll.sql` once in Supabase SQL Editor before using
Workforce & Jobs or Payroll only if it was not run for V8.4.

The script extends employee profiles and adds crews, assignments, field/crop links,
individual work results, payroll periods, adjustments, payments and payslip snapshots.
It also adds role-aware access policies and the existing Farm Manager audit trigger to
every new table.

The script preserves all existing attendance, workers, farm records, users and roles.
Do not create a new Edge Function or rename the existing `super-handler`.
