-- FARM MANAGER V6.1 EDITING UPGRADE
-- Run in Supabase SQL Editor.

drop policy if exists "public update farms" on public.farms;
create policy "public update farms" on public.farms for update to anon using (true) with check (true);

drop policy if exists "public update farm blocks" on public.farm_blocks;
create policy "public update farm blocks" on public.farm_blocks for update to anon using (true) with check (true);

drop policy if exists "public update fields" on public.fields;
create policy "public update fields" on public.fields for update to anon using (true) with check (true);

drop policy if exists "public update propagation batches" on public.propagation_batches;
create policy "public update propagation batches" on public.propagation_batches for update to anon using (true) with check (true);

drop policy if exists "public update crop cycles" on public.crop_cycles;
create policy "public update crop cycles" on public.crop_cycles for update to anon using (true) with check (true);

drop policy if exists "public update field activities" on public.field_activities;
create policy "public update field activities" on public.field_activities for update to anon using (true) with check (true);

drop policy if exists "public update workers" on public.workers;
create policy "public update workers" on public.workers for update to anon using (true) with check (true);
