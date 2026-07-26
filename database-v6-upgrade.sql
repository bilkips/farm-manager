-- FARM MANAGER V6 DATABASE UPGRADE
-- Run this entire script in Supabase SQL Editor after the V5.2 upgrade.

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  full_name text not null,
  phone text,
  role text,
  daily_rate numeric default 0,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.field_activities (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  field_id uuid not null references public.fields(id) on delete cascade,
  crop_cycle_id uuid references public.crop_cycles(id) on delete set null,
  activity_type text not null,
  scheduled_date date not null,
  completed_date date,
  status text default 'planned',
  worker_id uuid references public.workers(id) on delete set null,
  input_name text,
  quantity numeric,
  unit text,
  labour_cost numeric default 0,
  input_cost numeric default 0,
  notes text,
  created_at timestamptz default now()
);

alter table public.workers enable row level security;
alter table public.field_activities enable row level security;

drop policy if exists "public read workers" on public.workers;
drop policy if exists "public insert workers" on public.workers;
drop policy if exists "public update workers" on public.workers;
create policy "public read workers" on public.workers for select to anon using (true);
create policy "public insert workers" on public.workers for insert to anon with check (true);
create policy "public update workers" on public.workers for update to anon using (true) with check (true);

drop policy if exists "public read field activities" on public.field_activities;
drop policy if exists "public insert field activities" on public.field_activities;
drop policy if exists "public update field activities" on public.field_activities;
create policy "public read field activities" on public.field_activities for select to anon using (true);
create policy "public insert field activities" on public.field_activities for insert to anon with check (true);
create policy "public update field activities" on public.field_activities for update to anon using (true) with check (true);
