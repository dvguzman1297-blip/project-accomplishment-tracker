-- Expiry date becomes an editable column. Existing values are kept.
-- When left blank it is suggested as Start date + CD - 1.
-- (Fresh installs: 01_schema.sql already includes this.)
alter table tracker.contracts add column expiry_tmp date;
update tracker.contracts set expiry_tmp = expiry_date;
alter table tracker.contracts drop column expiry_date;
alter table tracker.contracts rename column expiry_tmp to expiry_date;
create index if not exists idx_contracts_expiry on tracker.contracts (expiry_date);

create or replace function tracker.default_start_date()
returns trigger language plpgsql as $$
begin
  new.start_date  = coalesce(new.start_date, new.ntp);
  new.expiry_date = coalesce(new.expiry_date, new.start_date + (new.contract_duration - 1));
  return new;
end;
$$;
