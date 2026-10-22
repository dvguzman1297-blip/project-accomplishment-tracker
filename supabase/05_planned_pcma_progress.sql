-- Construction section: planned vs actual progress, and the PCMA equivalents.
-- progress_percentage is the "Actual pct".
-- The new percentages take up to two decimal places.
-- Slippage is not stored; it is computed (Actual - Planned) in the app.
-- (Fresh installs: 01_schema.sql already includes this.)
alter table tracker.contracts
  add column if not exists planned_actual_pct numeric(5,2) check (planned_actual_pct between 0 and 100),
  add column if not exists planned_pcma_pct   numeric(5,2) check (planned_pcma_pct between 0 and 100),
  add column if not exists pcma_pct           numeric(5,2) check (pcma_pct between 0 and 100);

-- If an earlier version of this file already ran with integer columns, widen them.
alter table tracker.contracts
  alter column planned_actual_pct type numeric(5,2),
  alter column planned_pcma_pct   type numeric(5,2),
  alter column pcma_pct           type numeric(5,2);

-- Actual pct (progress_percentage) also takes up to two decimal places.
alter table tracker.contracts alter column progress_percentage type numeric(5,2);
