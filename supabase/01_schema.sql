-- =====================================================================
-- Project Accomplishment Tracker — Supabase schema (modeled on the
-- "Maintenance File" sheet of the tracker workbook)
-- Run in: Supabase Dashboard > SQL Editor
-- If you ran the earlier draft schema, first run:  drop schema tracker cascade;
-- =====================================================================
create extension if not exists "pgcrypto";
create schema if not exists tracker;

do $$ begin
  create type tracker.project_status as enum
    ('not_started', 'in_progress', 'completed', 'on_hold', 'delayed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tracker.impact_level as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

create or replace function tracker.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One row per contract / component (a row of the workbook) -------------
create table if not exists tracker.contracts (
  id                     uuid primary key default gen_random_uuid(),
  item_no                integer,                         -- "No."
  contract_id            text,                            -- "Contract ID" (blank for some rows)
  component_id           text,                            -- "Component ID"
  contract_name          text not null check (length(trim(contract_name)) > 0),
  municipality           text,
  type                   text,                            -- Bridge, Road, BEFF, MPB, ...
  coordinates_new        text,                            -- "COORDINATES (NEW)"
  coordinates_original   text,                            -- "COORDINATES (ORIGINAL)"
  old_latitude           numeric(10, 8) check (old_latitude  between -90  and 90),
  old_longitude          numeric(11, 8) check (old_longitude between -180 and 180),
  new_latitude           numeric(10, 8) check (new_latitude  between -90  and 90),
  new_longitude          numeric(11, 8) check (new_longitude between -180 and 180),
  contractor             text,
  contractor_address     text,
  abc                  numeric(16,2) check (abc >= 0),  -- Approved Budget for the Contract
  bid_amount             numeric(16,2) check (bid_amount >= 0),

  -- Contract authorities
  pi_in_pcma             text,                            -- "PI in PCMA"
  pe_contractor          text,                            -- "PE (Contractor)"
  me                     text,                            -- "ME"
  me_focal_person        text,                            -- "ME (FOCAL PERSON)"
  project_engineer       text,
  project_inspector      text,

  -- Pre-construction data
  bid_out                date,
  noa                    date,                            -- Notice of Award
  ntp                    date,                            -- Notice to Proceed
  contract_approval_date date,
  contract_duration      integer check (contract_duration >= 0),  -- "CD" (calendar days)

  -- Construction data (same formulas as the workbook: Start = NTP, Expiry = NTP + CD - 1)
  start_date             date generated always as (ntp) stored,
  expiry_date            date generated always as (ntp + (contract_duration - 1)) stored,

  -- Accomplishment tracking
  status                 tracker.project_status not null default 'not_started',
  progress_percentage    integer not null default 0 check (progress_percentage between 0 and 100),
  actual_completion_date date,
  remarks                text,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists tracker.accomplishments (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references tracker.contracts(id) on delete cascade,
  title           text not null check (length(trim(title)) > 0),
  details         text,
  impact          tracker.impact_level not null default 'medium',
  date_completed  date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_contracts_status       on tracker.contracts (status);
create index if not exists idx_contracts_municipality on tracker.contracts (municipality);
create index if not exists idx_contracts_type         on tracker.contracts (type);
create index if not exists idx_contracts_expiry       on tracker.contracts (expiry_date);
create index if not exists idx_accomplishments_project on tracker.accomplishments (project_id);
create index if not exists idx_accomplishments_date    on tracker.accomplishments (date_completed);

drop trigger if exists trg_contracts_updated_at on tracker.contracts;
create trigger trg_contracts_updated_at before update on tracker.contracts
  for each row execute function tracker.set_updated_at();

drop trigger if exists trg_accomplishments_updated_at on tracker.accomplishments;
create trigger trg_accomplishments_updated_at before update on tracker.accomplishments
  for each row execute function tracker.set_updated_at();

-- Single-role (Admin) RLS: any authenticated user has full access; anon has none
alter table tracker.contracts       enable row level security;
alter table tracker.accomplishments enable row level security;

drop policy if exists "admin full access" on tracker.contracts;
create policy "admin full access" on tracker.contracts
  for all to authenticated using (true) with check (true);

drop policy if exists "admin full access" on tracker.accomplishments;
create policy "admin full access" on tracker.accomplishments
  for all to authenticated using (true) with check (true);

grant usage on schema tracker to authenticated, service_role;
revoke all on schema tracker from anon;
grant select, insert, update, delete on all tables in schema tracker to authenticated, service_role;
alter default privileges in schema tracker
  grant select, insert, update, delete on tables to authenticated, service_role;

-- AFTER RUNNING: Project Settings > API > "Exposed schemas" > add `tracker`.
-- Then Authentication > Providers > Email: turn off "Allow new users to sign up".
