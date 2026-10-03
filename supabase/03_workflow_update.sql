-- Migration for databases created from the earlier 01_schema.sql.
-- (Fresh installs: 01_schema.sql already includes all of this.)
-- Run in: Supabase Dashboard > SQL Editor

-- 1. Status: four values only. delayed -> ongoing, not_started -> nys, in_progress -> ongoing, on_hold -> suspended
alter table tracker.contracts alter column status drop default;
alter table tracker.contracts alter column status type text using status::text;
update tracker.contracts set status = case status
  when 'not_started' then 'nys'
  when 'in_progress' then 'ongoing'
  when 'delayed'     then 'ongoing'
  when 'on_hold'     then 'suspended'
  else status end;
drop type if exists tracker.project_status;
create type tracker.project_status as enum ('nys', 'ongoing', 'completed', 'suspended');
alter table tracker.contracts alter column status type tracker.project_status using status::tracker.project_status;
alter table tracker.contracts alter column status set default 'nys';

-- 2. Start date becomes editable (defaults to NTP); expiry = start + CD - 1
alter table tracker.contracts drop column if exists expiry_date;
alter table tracker.contracts drop column if exists start_date;
alter table tracker.contracts add column start_date date;
update tracker.contracts set start_date = ntp;
alter table tracker.contracts
  add column expiry_date date generated always as (start_date + (contract_duration - 1)) stored;
create index if not exists idx_contracts_expiry on tracker.contracts (expiry_date);

create or replace function tracker.default_start_date()
returns trigger language plpgsql as $$
begin
  new.start_date = coalesce(new.start_date, new.ntp);
  return new;
end;
$$;
drop trigger if exists trg_contracts_start_date on tracker.contracts;
create trigger trg_contracts_start_date before insert or update on tracker.contracts
  for each row execute function tracker.default_start_date();

-- 3. Attachments
alter table tracker.contracts
  add column if not exists as_built_request_form_path text,
  add column if not exists as_built_plan_path text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('as-builts', 'as-builts', false, 10485760)
on conflict (id) do nothing;
drop policy if exists "as-builts admin access" on storage.objects;
create policy "as-builts admin access" on storage.objects
  for all to authenticated using (bucket_id = 'as-builts') with check (bucket_id = 'as-builts');

-- 4. Notification de-duplication log
create table if not exists tracker.notification_log (
  contract_id uuid not null references tracker.contracts(id) on delete cascade,
  kind        text not null,
  sent_at     timestamptz not null default now(),
  primary key (contract_id, kind)
);
alter table tracker.notification_log enable row level security;
grant select, insert, update, delete on tracker.notification_log to authenticated, service_role;

-- 5. Drop the separate numeric coordinate columns if an earlier draft added them;
--    coordinates now live in coordinates_original / coordinates_new (one "LABEL: lat, lng" per line).
alter table tracker.contracts
  drop column if exists old_latitude, drop column if exists old_longitude,
  drop column if exists new_latitude, drop column if exists new_longitude;
