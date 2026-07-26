-- FARM MANAGER V6.2 DELETE + TRANSPLANT WORKFLOW
-- Run in Supabase SQL Editor.

drop policy if exists "public delete farm blocks" on public.farm_blocks;
create policy "public delete farm blocks" on public.farm_blocks for delete to anon using (true);

drop policy if exists "public delete fields" on public.fields;
create policy "public delete fields" on public.fields for delete to anon using (true);

drop policy if exists "public delete propagation batches" on public.propagation_batches;
create policy "public delete propagation batches" on public.propagation_batches for delete to anon using (true);

drop policy if exists "public delete crop cycles" on public.crop_cycles;
create policy "public delete crop cycles" on public.crop_cycles for delete to anon using (true);

drop policy if exists "public delete field activities" on public.field_activities;
create policy "public delete field activities" on public.field_activities for delete to anon using (true);

drop policy if exists "public delete workers" on public.workers;
create policy "public delete workers" on public.workers for delete to anon using (true);
