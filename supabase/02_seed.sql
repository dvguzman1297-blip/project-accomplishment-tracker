-- Seed data from the "Maintenance File" sheet (9 contract rows, values as in the workbook).
-- Status/progress are not in the workbook: rows with an NTP are set to in_progress, the rest not_started.
-- The accomplishments at the bottom are SAMPLE entries for demo charts; delete them freely.

insert into tracker.contracts
  (item_no, contract_id, component_id, contract_name, municipality, type,
   coordinates_new, coordinates_original, contractor, contractor_address, abc, bid_amount,
   pi_in_pcma, pe_contractor, me, me_focal_person, project_engineer, project_inspector,
   bid_out, noa, ntp, contract_approval_date, contract_duration, status, progress_percentage)
values
 (1, '26SE0099', 'P01000842LZ - CW1', 'Bridge Program - Widening of Permanent Bridges - Ilog Baliwag Br.',
  'Santo Domingo', 'Bridge', null, null, 'GRACE CONSTRUCTION CORPORATION', 'Grace Compd.',
  121000000, 119572088.14, 'Juan Dela Cruz', 'John Doe', 'Padua', 'Derwin Gatchalian', 'RR', 'Mary',
  '2026-08-26', '2026-09-28', '2026-01-01', null, 300, 'in_progress', 40),
 (2, '26SE0152', 'P01037921LZ - CW1', 'Construction of Road, Barangay Macapabellag',
  'Guimba', 'Road',
  E'START: 15.699075, 120.788852\nEND: 15.698886, 120.791714',
  E'START: 15.66662126, 120.85408746\nEND: 15.66725605, 120.85327273',
  'GRACE CONSTRUCTION CORPORATION', 'GRACE CONSTRUCTION CORPORATION', null, null,
  null, null, null, null, null, 'Mary',
  '2026-08-18', '2026-09-28', null, null, 60, 'not_started', 0),
 (3, '26SE0153', 'P01037894LZ - CW1', 'Construction of Road, Barangay Camiing',
  'Guimba', 'Road', null, null, null, null, null, null,
  null, null, null, null, null, 'Mary',
  '2026-08-18', null, null, null, 60, 'not_started', 0),
 (4, '26SE0171', 'P01037892LZ - CW1', 'Construction of Road, Barangay Banitan',
  'Guimba', 'Road', null, null, null, null, null, null,
  null, null, null, null, null, 'Mary',
  '2026-09-08', null, null, null, 60, 'not_started', 0),
 (5, null, 'P01015007LZ - CW1', 'Network Development Program - Construction of By-Pass and Diversion Roads',
  'Quezon', 'Bridge', null, null, null, null, null, null,
  null, null, null, null, null, 'Mary',
  null, null, null, null, null, 'not_started', 0),
 (6, '26SE0223 (Cluster 10)', 'P01044824LZ - CW1', 'Construction (Completion) of Multi Purpose Building, Banitan Elementary School',
  'Guimba', 'BEFF', null, null, null, null, null, null,
  null, null, null, null, null, 'Mary',
  null, null, null, null, null, 'not_started', 0),
 (7, '26SE0223 (Cluster 10)', 'P01044828LZ - CW1', 'Construction (Completion) of Multi-Purpose Building, Barangay Naglabrahan',
  'Guimba', 'MPB', null, null, null, null, null, null,
  null, null, null, null, null, 'Mary',
  null, null, null, null, null, 'not_started', 0),
 (8, '26SE0223 (Cluster 10)', 'P01044872LZ - CW1', 'Construction (Completion) of Multi-Purpose Building, Barangay Balingog West',
  'Guimba', 'MPB', null, null, null, null, null, null,
  null, null, null, null, null, 'Mary',
  null, null, null, null, null, 'not_started', 0),
 (9, null, 'P01044884LZ - CW1', 'Construction (Completion) of Multi-Purpose Building, Barangay Maturanoc',
  'Guimba', 'MPB', null, null, null, null, null, null,
  null, null, null, null, null, 'Mary',
  null, null, null, null, null, 'not_started', 0);

-- SAMPLE accomplishments (not from the workbook)
insert into tracker.accomplishments (project_id, title, details, impact, date_completed)
select id, v.title, v.details, v.impact::tracker.impact_level, v.d::date
from tracker.contracts c
cross join (values
  ('Mobilization completed',        'Sample entry: equipment and materials on site.',        'medium', '2026-02-10'),
  ('Abutment excavation finished',  'Sample entry: excavation for both abutments completed.', 'high',   '2026-04-22'),
  ('Pile foundation accepted',      'Sample entry: piles tested and accepted by the ME.',     'critical','2026-07-15')
) as v(title, details, impact, d)
where c.component_id = 'P01000842LZ - CW1';
