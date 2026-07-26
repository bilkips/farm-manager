-- FARM MANAGER V7 DATABASE UPGRADE
-- Run this entire script in Supabase SQL Editor after previous upgrades.

create table if not exists public.equipment (
 id uuid primary key default gen_random_uuid(), farm_id uuid not null references public.farms(id) on delete cascade,
 name text not null, category text, model text, serial_number text, status text default 'active',
 service_interval_hours numeric default 0, current_hours numeric default 0,
 last_service_date date, next_service_date date, notes text, created_at timestamptz default now()
);

create table if not exists public.irrigation_records (
 id uuid primary key default gen_random_uuid(), farm_id uuid not null references public.farms(id) on delete cascade,
 field_id uuid not null references public.fields(id) on delete cascade,
 crop_cycle_id uuid references public.crop_cycles(id) on delete set null,
 irrigation_date date not null, water_source text, system_type text,
 equipment_id uuid references public.equipment(id) on delete set null,
 start_time time, end_time time, duration_hours numeric default 0, pressure_bar numeric default 0,
 water_volume_m3 numeric default 0, fuel_litres numeric default 0, cost numeric default 0,
 notes text, created_at timestamptz default now()
);

create table if not exists public.spray_records (
 id uuid primary key default gen_random_uuid(), farm_id uuid not null references public.farms(id) on delete cascade,
 field_id uuid not null references public.fields(id) on delete cascade,
 crop_cycle_id uuid references public.crop_cycles(id) on delete set null,
 spray_date date not null, product_name text not null, active_ingredient text, target_problem text,
 dose text, unit text, quantity_used numeric default 0, phi_days integer default 0, rei_hours integer default 0,
 weather text, worker_id uuid references public.workers(id) on delete set null, cost numeric default 0,
 notes text, created_at timestamptz default now()
);

create table if not exists public.inventory_items (
 id uuid primary key default gen_random_uuid(), farm_id uuid not null references public.farms(id) on delete cascade,
 item_name text not null, category text, unit text, quantity_on_hand numeric default 0,
 reorder_level numeric default 0, unit_cost numeric default 0, supplier text, notes text,
 created_at timestamptz default now()
);

create table if not exists public.harvest_records (
 id uuid primary key default gen_random_uuid(), farm_id uuid not null references public.farms(id) on delete cascade,
 field_id uuid not null references public.fields(id) on delete cascade,
 crop_cycle_id uuid references public.crop_cycles(id) on delete set null,
 harvest_date date not null, grade text, quantity numeric default 0, unit text,
 waste_quantity numeric default 0, buyer text, price_per_unit numeric default 0,
 notes text, created_at timestamptz default now()
);

alter table public.equipment enable row level security;
alter table public.irrigation_records enable row level security;
alter table public.spray_records enable row level security;
alter table public.inventory_items enable row level security;
alter table public.harvest_records enable row level security;

do $$
declare t text;
begin
 foreach t in array array['equipment','irrigation_records','spray_records','inventory_items','harvest_records']
 loop
   execute format('drop policy if exists "public read %s" on public.%I', t, t);
   execute format('drop policy if exists "public insert %s" on public.%I', t, t);
   execute format('drop policy if exists "public update %s" on public.%I', t, t);
   execute format('drop policy if exists "public delete %s" on public.%I', t, t);
   execute format('create policy "public read %s" on public.%I for select to anon using (true)', t, t);
   execute format('create policy "public insert %s" on public.%I for insert to anon with check (true)', t, t);
   execute format('create policy "public update %s" on public.%I for update to anon using (true) with check (true)', t, t);
   execute format('create policy "public delete %s" on public.%I for delete to anon using (true)', t, t);
 end loop;
end $$;
