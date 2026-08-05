-- FARM MANAGER V8.2: BASIC EMPLOYEE ATTENDANCE
-- Run this entire script once in Supabase SQL Editor.
-- Workers remain ordinary employee records; this does not create login accounts.

create table if not exists public.worker_attendance (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present', 'absent')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint worker_attendance_one_mark_per_day
    unique (farm_id, worker_id, attendance_date)
);

create index if not exists idx_worker_attendance_farm_date
  on public.worker_attendance (farm_id, attendance_date desc);

create index if not exists idx_worker_attendance_worker_date
  on public.worker_attendance (worker_id, attendance_date desc);

alter table public.worker_attendance enable row level security;

drop policy if exists v82_attendance_read on public.worker_attendance;
create policy v82_attendance_read on public.worker_attendance
  for select
  using (farm_id = public.my_farm_id());

drop policy if exists v82_attendance_write on public.worker_attendance;
create policy v82_attendance_write on public.worker_attendance
  for all
  using (
    farm_id = public.my_farm_id()
    and public.my_farm_role() in ('owner', 'manager', 'supervisor')
  )
  with check (
    farm_id = public.my_farm_id()
    and public.my_farm_role() in ('owner', 'manager', 'supervisor')
  );

-- Add attendance changes to the existing Farm Manager audit trail.
drop trigger if exists audit_worker_attendance on public.worker_attendance;
create trigger audit_worker_attendance
  after insert or update or delete on public.worker_attendance
  for each row execute function public.write_farm_audit();

-- Refresh PostgREST's schema cache so the new table is available immediately.
notify pgrst, 'reload schema';
