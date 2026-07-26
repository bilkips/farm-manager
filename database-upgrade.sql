-- FARM MANAGER V5 DATABASE UPGRADE
-- Run the whole script in Supabase SQL Editor.

alter table public.propagation_batches
  add column if not exists farm_id uuid references public.farms(id) on delete cascade,
  add column if not exists crop_name text,
  add column if not exists variety text,
  add column if not exists sowing_date date,
  add column if not exists trays integer default 0,
  add column if not exists cells_per_tray integer default 0,
  add column if not exists seeds_sown integer default 0,
  add column if not exists germinated integer default 0,
  add column if not exists losses integer default 0,
  add column if not exists expected_transplant_date date,
  add column if not exists status text default 'sown',
  add column if not exists notes text;

alter table public.crop_cycles
  add column if not exists field_id uuid references public.fields(id) on delete cascade,
  add column if not exists crop_name text,
  add column if not exists variety text,
  add column if not exists source_batch_id uuid references public.propagation_batches(id) on delete set null,
  add column if not exists planting_date date,
  add column if not exists expected_harvest_date date,
  add column if not exists status text default 'planned',
  add column if not exists area_acres numeric,
  add column if not exists notes text;

alter table public.propagation_batches enable row level security;
alter table public.crop_cycles enable row level security;

drop policy if exists "public read propagation batches" on public.propagation_batches;
drop policy if exists "public insert propagation batches" on public.propagation_batches;
drop policy if exists "public update propagation batches" on public.propagation_batches;
create policy "public read propagation batches" on public.propagation_batches for select to anon using (true);
create policy "public insert propagation batches" on public.propagation_batches for insert to anon with check (true);
create policy "public update propagation batches" on public.propagation_batches for update to anon using (true) with check (true);

drop policy if exists "public read crop cycles" on public.crop_cycles;
drop policy if exists "public insert crop cycles" on public.crop_cycles;
drop policy if exists "public update crop cycles" on public.crop_cycles;
create policy "public read crop cycles" on public.crop_cycles for select to anon using (true);
create policy "public insert crop cycles" on public.crop_cycles for insert to anon with check (true);
create policy "public update crop cycles" on public.crop_cycles for update to anon using (true) with check (true);

alter table public.propagation_batches
  alter column batch_code set default ('PB-' || to_char(now(),'YYYYMMDDHH24MISS'));
update public.propagation_batches
set batch_code='PB-' || to_char(coalesce(created_at,now()),'YYYYMMDDHH24MISS')
where batch_code is null;
