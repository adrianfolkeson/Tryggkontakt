-- RLS smoke test for schedule_item.
-- Mirrors the daily_update smoke pattern. Wraps in begin; rollback;
-- so it leaves no fixtures behind.
--
-- Cases:
--   1) author = self into own circle             → INSERT 0 1
--   2) spoof author = stranger into own circle   → RLS violation
--   3) author = self into stranger circle        → RLS violation
--   4) former staff SELECTs in circle A          → 0 rows
--   5) co-member (active, not author) UPDATEs    → 0 rows
--      (protects the schedule_item_update USING
--      clause: created_by_user_id = auth.uid())

begin;

insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, reauthentication_token)
values
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','sched-author@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('22222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','sched-comember@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('33333333-3333-3333-3333-333333333333','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','sched-former@test','', now(),
   '{}','{}', now(), now(), '','','','','','');

insert into person (id, display_name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Person A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Person B');

insert into circle (id, person_id, name) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Krets A'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Krets B');

-- u1 (author) and u2 (co-member) both active relatives in A;
-- u3 (former) was a relative in A but valid_to is in the past.
insert into circle_member (circle_id, user_id, role, valid_from, valid_to) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111','relative',
   now() - interval '1 day', null),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '22222222-2222-2222-2222-222222222222','relative',
   now() - interval '1 day', null),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '33333333-3333-3333-3333-333333333333','relative',
   now() - interval '7 days', now() - interval '1 day');

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

\echo '---test 1: author=self + own circle (expect INSERT 0 1)---'
savepoint sp1;
insert into schedule_item (id, circle_id, created_by_user_id, title, starts_at)
values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'Skola', now() + interval '1 day');

\echo '---test 2: spoof author=stranger into own circle (expect RLS violation)---'
savepoint sp2;
insert into schedule_item (circle_id, created_by_user_id, title, starts_at)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '22222222-2222-2222-2222-222222222222',
   'Spoofed', now() + interval '1 day');
rollback to savepoint sp2;

\echo '---test 3: own author into stranger circle (expect RLS violation)---'
savepoint sp3;
insert into schedule_item (circle_id, created_by_user_id, title, starts_at)
values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd',
   '11111111-1111-1111-1111-111111111111',
   'Wrong circle', now() + interval '1 day');
rollback to savepoint sp3;

\echo '---test 4: former staff SELECTs schedule_item in circle A (expect 0 rows)---'
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select count(*) as former_visible
from schedule_item
where circle_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

\echo '---test 5: co-member (active, not author) UPDATEs author row (expect 0 rows)---'
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
do $$
declare rows_affected int;
begin
  update schedule_item
     set title = 'hijacked'
   where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 0 then
    raise exception 'FAIL: co-member UPDATEd author row (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: co-member cannot UPDATE author row (rows=0)';
end;
$$;

reset role;
rollback;
