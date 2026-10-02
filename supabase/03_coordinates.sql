-- Latitude/longitude pairs for the original and updated contract locations.
-- Run in: Supabase Dashboard > SQL Editor (safe to re-run)
alter table tracker.contracts
  add column if not exists old_latitude  numeric(10, 8) check (old_latitude  between -90  and 90),
  add column if not exists old_longitude numeric(11, 8) check (old_longitude between -180 and 180),
  add column if not exists new_latitude  numeric(10, 8) check (new_latitude  between -90  and 90),
  add column if not exists new_longitude numeric(11, 8) check (new_longitude between -180 and 180);
