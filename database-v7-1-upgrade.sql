-- FARM MANAGER V7.1 PERFORMANCE UPGRADE
create index if not exists idx_field_activities_farm_date on public.field_activities (farm_id, scheduled_date);
create index if not exists idx_propagation_batches_farm_status on public.propagation_batches (farm_id, status);
create index if not exists idx_inventory_items_farm_category on public.inventory_items (farm_id, category);
create index if not exists idx_irrigation_records_farm_date on public.irrigation_records (farm_id, irrigation_date);
create index if not exists idx_spray_records_farm_date on public.spray_records (farm_id, spray_date);
create index if not exists idx_harvest_records_farm_date on public.harvest_records (farm_id, harvest_date);
create index if not exists idx_equipment_farm_service on public.equipment (farm_id, next_service_date);
