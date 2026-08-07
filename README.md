# Farm Manager V8.5 — Farm Command Dashboard & Approved-work Labour

V8.5 is built on the stable V8.4 release. It preserves multi-field operations,
one-time inventory deductions, attendance, workforce approvals, payroll, password
recovery, the scrollable mobile sidebar and every earlier farm module.

## Farm command dashboard

- A clearer operational view of active fields, acres, today's work and overdue tasks
- Workforce attendance, planned jobs and pending approvals at a glance
- Nursery, inventory and equipment pulse checks
- Owner/Manager financial position with revenue, costs, result and payroll balance
- Fast actions for field activities, job assignments, irrigation and harvests
- Mobile-first priority inbox and field/crop overview

## Workforce

- Complete employee profiles, employment type, hire date and payment details
- Daily, hourly, monthly and piece-rate wage profiles
- Reusable work crews with a named supervisor
- One job assigned to individuals or a crew
- One assignment linked to one or many fields and their active crop cycles
- Individual regular hours, overtime hours and completed units
- Completed-work approval or rejection by Owner, Manager or Field Supervisor
- Employee productivity summaries and CSV-ready field labour reports

## Approved-work payroll

- Daily employees: approved hours × (daily wage ÷ normal daily hours)
- Monthly employees: approved hours × (monthly salary ÷ 26 standard days ÷ normal daily hours)
- Hourly employees: approved hours × hourly wage
- Piece-rate employees: approved completed units × piece rate
- Overtime: approved overtime hours × hourly equivalent × assignment multiplier
- Bonuses, salary advances and deductions
- Draft, approved and closed payroll periods
- Partial and full payments with automatic outstanding balances
- Payment history, printable payslips and monthly payroll CSV

Attendance remains an audit cross-check. Once completed work is approved, its recorded
hours or units remain payable even when the attendance register needs correction.

## Field and crop costing

Approved assignment earnings are automatically distributed across linked fields using
acreage share. If the same field and date already contain a manual activity labour
estimate, that estimate is replaced by the approved employee earnings. It is not added
again. Input costs remain posted.

Payroll payments settle the employee balance and are shown as cash settlements. They
do not create a second operating expense. The Financial Dashboard includes an employee-
by-assignment labour ledger showing hours, overtime and the exact amount accrued.

## Permissions and audit

- Owner/Admin and Farm Manager: full workforce and payroll access
- Field Supervisor: employees, crews, assignments, results and work approval
- Payroll amounts and payments remain hidden from non-financial roles
- Every workforce and payroll change uses the existing Farm Manager audit trail
- Employees remain records only; they do not receive login accounts

## One-time upgrade

If V8.4 Workforce & Payroll is already working, no new SQL is required. Upload the
extracted deployment files to the GitHub repository root. Vercel detects the Vite
project, runs `npm run build` and publishes the generated `dist` app. The entry files
remain at repository root, so no `/src/main.jsx` move is required.

For a new installation that has not run the workforce upgrade, run
`database-v8-4-workforce-payroll.sql` once in Supabase SQL Editor first.
