-- When were Actual pct and PCMA pct last changed?
-- Each stamp moves only when that percentage's value changes, not on any other edit.
-- (Fresh installs: 01_schema.sql already includes this.)
alter table tracker.contracts
  add column if not exists progress_updated_at timestamptz,
  add column if not exists pcma_updated_at     timestamptz;

-- Existing rows: best available answer is the row's last update
update tracker.contracts set progress_updated_at = updated_at where progress_updated_at is null;
update tracker.contracts set pcma_updated_at     = updated_at where pcma_updated_at is null and pcma_pct is not null;

create or replace function tracker.stamp_pct_updates()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.progress_updated_at = now();
    new.pcma_updated_at     = case when new.pcma_pct is null then null else now() end;
  else
    if new.progress_percentage is distinct from old.progress_percentage then new.progress_updated_at = now();
    else new.progress_updated_at = old.progress_updated_at; end if;
    if new.pcma_pct is distinct from old.pcma_pct then new.pcma_updated_at = case when new.pcma_pct is null then null else now() end;
    else new.pcma_updated_at = old.pcma_updated_at; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_contracts_pct_stamp on tracker.contracts;
create trigger trg_contracts_pct_stamp before insert or update on tracker.contracts
  for each row execute function tracker.stamp_pct_updates();
