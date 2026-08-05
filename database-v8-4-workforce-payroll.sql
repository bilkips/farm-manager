-- FARM MANAGER V8.4: FULL WORKFORCE, JOB ASSIGNMENTS AND PAYROLL
-- Run this entire script once in Supabase SQL Editor after the V8.2 attendance upgrade.
-- It is safe to run again: existing farm, employee, attendance and production records are preserved.

-- Extend employee records without creating login accounts for employees.
alter table public.workers add column if not exists employee_number text;
alter table public.workers add column if not exists id_number text;
alter table public.workers add column if not exists email text;
alter table public.workers add column if not exists hire_date date;
alter table public.workers add column if not exists employment_type text default 'casual';
alter table public.workers add column if not exists wage_type text default 'daily';
alter table public.workers add column if not exists hourly_rate numeric(14,2) not null default 0;
alter table public.workers add column if not exists monthly_salary numeric(14,2) not null default 0;
alter table public.workers add column if not exists piece_rate numeric(14,2) not null default 0;
alter table public.workers add column if not exists piece_unit text;
alter table public.workers add column if not exists normal_hours_per_day numeric(8,2) not null default 8;
alter table public.workers add column if not exists emergency_contact_name text;
alter table public.workers add column if not exists emergency_contact_phone text;
alter table public.workers add column if not exists payment_method text default 'M-Pesa';
alter table public.workers add column if not exists payment_account text;
alter table public.workers add column if not exists notes text;

create unique index if not exists idx_workers_farm_employee_number
  on public.workers (farm_id, employee_number)
  where employee_number is not null and employee_number <> '';

create table if not exists public.work_crews (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  supervisor_id uuid references public.workers(id) on delete set null,
  status text not null default 'active'
    check (status in ('active','inactive')),
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, name)
);

create table if not exists public.work_crew_members (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  crew_id uuid not null references public.work_crews(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  joined_on date not null default current_date,
  status text not null default 'active'
    check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  unique (crew_id, worker_id)
);

create table if not exists public.work_assignments (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  title text not null,
  work_date date not null default current_date,
  due_date date,
  description text,
  status text not null default 'planned'
    check (status in ('planned','in_progress','completed','cancelled')),
  crew_id uuid references public.work_crews(id) on delete set null,
  unit_name text,
  planned_units numeric(14,3) not null default 0,
  overtime_multiplier numeric(6,2) not null default 1.5,
  approval_status text not null default 'pending'
    check (approval_status in ('pending','approved','rejected')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  approval_notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_assignment_fields (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  assignment_id uuid not null references public.work_assignments(id) on delete cascade,
  field_id uuid not null references public.fields(id) on delete cascade,
  crop_cycle_id uuid references public.crop_cycles(id) on delete set null,
  allocation_percent numeric(7,4) not null default 0,
  created_at timestamptz not null default now(),
  unique (assignment_id, field_id)
);

create table if not exists public.work_assignment_workers (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  assignment_id uuid not null references public.work_assignments(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  regular_hours numeric(10,2) not null default 0,
  overtime_hours numeric(10,2) not null default 0,
  completed_units numeric(14,3) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, worker_id)
);

create table if not exists public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  period_month date not null,
  status text not null default 'draft'
    check (status in ('draft','approved','closed')),
  notes text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  closed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, period_month)
);

create table if not exists public.payroll_adjustments (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  period_month date not null,
  adjustment_date date not null default current_date,
  adjustment_type text not null
    check (adjustment_type in ('bonus','advance','deduction')),
  amount numeric(14,2) not null check (amount >= 0),
  description text not null,
  status text not null default 'approved'
    check (status in ('pending','approved','void')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.payroll_items (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  payroll_period_id uuid not null references public.payroll_periods(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  recorded_work_days integer not null default 0,
  present_days integer not null default 0,
  absent_days integer not null default 0,
  regular_pay numeric(14,2) not null default 0,
  overtime_pay numeric(14,2) not null default 0,
  bonus_total numeric(14,2) not null default 0,
  advance_total numeric(14,2) not null default 0,
  deduction_total numeric(14,2) not null default 0,
  gross_pay numeric(14,2) not null default 0,
  net_pay numeric(14,2) not null default 0,
  calculation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payroll_period_id, worker_id)
);

create table if not exists public.payroll_payments (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  payroll_period_id uuid not null references public.payroll_periods(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  period_month date not null,
  payment_date date not null default current_date,
  amount numeric(14,2) not null check (amount > 0),
  method text not null default 'M-Pesa',
  reference text,
  notes text,
  status text not null default 'approved'
    check (status in ('approved','void')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists idx_work_assignments_farm_date
  on public.work_assignments (farm_id, work_date desc);
create index if not exists idx_work_assignment_workers_worker
  on public.work_assignment_workers (worker_id, assignment_id);
create index if not exists idx_work_assignment_fields_field
  on public.work_assignment_fields (field_id, assignment_id);
create index if not exists idx_payroll_adjustments_farm_month
  on public.payroll_adjustments (farm_id, period_month, worker_id);
create index if not exists idx_payroll_payments_farm_month
  on public.payroll_payments (farm_id, period_month, worker_id);

create or replace function public.set_workforce_updated_at()
returns trigger language plpgsql set search_path=public as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'work_crews','work_assignments','work_assignment_workers',
    'payroll_periods','payroll_items'
  ] loop
    execute format('drop trigger if exists set_updated_at_%I on public.%I', t, t);
    execute format('create trigger set_updated_at_%I before update on public.%I for each row execute function public.set_workforce_updated_at()', t, t);
  end loop;
end $$;

-- Operational workforce tables: supervisors may schedule and approve field work.
do $$
declare t text;
begin
  foreach t in array array[
    'work_crews','work_crew_members','work_assignments',
    'work_assignment_fields','work_assignment_workers'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists v84_workforce_read on public.%I', t);
    execute format('drop policy if exists v84_workforce_write on public.%I', t);
    execute format(
      'create policy v84_workforce_read on public.%I for select using (farm_id=public.my_farm_id())', t
    );
    execute format(
      'create policy v84_workforce_write on public.%I for all using (farm_id=public.my_farm_id() and public.my_farm_role() in (''owner'',''manager'',''supervisor'')) with check (farm_id=public.my_farm_id() and public.my_farm_role() in (''owner'',''manager'',''supervisor''))', t
    );
  end loop;
end $$;

-- Payroll amounts are restricted to Owner/Admin and Farm Manager accounts.
do $$
declare t text;
begin
  foreach t in array array[
    'payroll_periods','payroll_adjustments','payroll_items','payroll_payments'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists v84_payroll_read on public.%I', t);
    execute format('drop policy if exists v84_payroll_write on public.%I', t);
    execute format(
      'create policy v84_payroll_read on public.%I for select using (farm_id=public.my_farm_id() and public.my_farm_role() in (''owner'',''manager''))', t
    );
    execute format(
      'create policy v84_payroll_write on public.%I for all using (farm_id=public.my_farm_id() and public.my_farm_role() in (''owner'',''manager'')) with check (farm_id=public.my_farm_id() and public.my_farm_role() in (''owner'',''manager''))', t
    );
  end loop;
end $$;

grant select, insert, update, delete on
  public.work_crews,
  public.work_crew_members,
  public.work_assignments,
  public.work_assignment_fields,
  public.work_assignment_workers,
  public.payroll_periods,
  public.payroll_adjustments,
  public.payroll_items,
  public.payroll_payments
to authenticated;

-- Reuse the existing Farm Manager audit trail for every workforce and payroll change.
do $$
declare t text;
begin
  foreach t in array array[
    'work_crews','work_crew_members','work_assignments','work_assignment_fields',
    'work_assignment_workers','payroll_periods','payroll_adjustments',
    'payroll_items','payroll_payments'
  ] loop
    execute format('drop trigger if exists audit_%I on public.%I', t, t);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_farm_audit()', t, t);
  end loop;
end $$;

notify pgrst, 'reload schema';
