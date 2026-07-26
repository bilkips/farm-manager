-- Run this in Supabase SQL Editor if inserts are blocked by RLS.
-- This phase uses the public/publishable browser role. Authentication and
-- owner-based policies will replace these prototype policies in the next phase.

alter table public.farms enable row level security;
alter table public.farm_blocks enable row level security;
alter table public.fields enable row level security;

drop policy if exists "public read farms" on public.farms;
drop policy if exists "public insert farms" on public.farms;
drop policy if exists "public update farms" on public.farms;
create policy "public read farms" on public.farms for select to anon using (true);
create policy "public insert farms" on public.farms for insert to anon with check (true);
create policy "public update farms" on public.farms for update to anon using (true) with check (true);

drop policy if exists "public read farm blocks" on public.farm_blocks;
drop policy if exists "public insert farm blocks" on public.farm_blocks;
drop policy if exists "public update farm blocks" on public.farm_blocks;
create policy "public read farm blocks" on public.farm_blocks for select to anon using (true);
create policy "public insert farm blocks" on public.farm_blocks for insert to anon with check (true);
create policy "public update farm blocks" on public.farm_blocks for update to anon using (true) with check (true);

drop policy if exists "public read fields" on public.fields;
drop policy if exists "public insert fields" on public.fields;
drop policy if exists "public update fields" on public.fields;
create policy "public read fields" on public.fields for select to anon using (true);
create policy "public insert fields" on public.fields for insert to anon with check (true);
create policy "public update fields" on public.fields for update to anon using (true) with check (true);
