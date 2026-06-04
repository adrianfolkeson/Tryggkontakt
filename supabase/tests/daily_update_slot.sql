-- Slot-based daily_update smoke. Six cases.
-- Wrapped in begin; rollback; — no fixtures linger.

begin;

insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, reauthentication_token)
values
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','slot-relative@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('22222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','slot-staff@test','', now(),
   '{}','{}', now(), now(), '','','','','','');

insert into person (id, display_name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Person A');

insert into circle (id, person_id, name) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Krets A');

insert into circle_member (circle_id, user_id, role, valid_from, valid_to) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111','relative',
   now() - interval '1 day', null),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '22222222-2222-2222-2222-222222222222','staff',
   now() - interval '1 day', null);

\echo '---test 1: INSERT morgon with all required fields (expect INSERT 0 1)---'
savepoint sp1;
insert into daily_update
  (circle_id, author_user_id, slot, mood, sleep, energy, meal_eaten, free_text)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'morgon', 'calm', 'good', 'medium', 'ja', 'Morgon ok');

\echo '---test 2: INSERT morgon without sleep (expect CHECK violation)---'
savepoint sp2;
do $$
begin
  insert into daily_update
    (circle_id, author_user_id, slot, mood, energy, meal_eaten, free_text)
  values
    ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111',
     'morgon', 'calm', 'medium', 'ja', 'Missing sleep');
  raise notice 'unexpectedly succeeded';
exception when others then
  raise notice 'caught: %', sqlerrm;
end;
$$;
rollback to savepoint sp2;

\echo '---test 3: INSERT snabbnotering with only free_text (expect INSERT 0 1)---'
savepoint sp3;
insert into daily_update
  (circle_id, author_user_id, slot, free_text)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'snabbnotering', 'Snabb anteckning');

\echo '---test 4: INSERT snabbnotering with mood/sleep/energy also set (expect INSERT 0 1)---'
savepoint sp4;
insert into daily_update
  (circle_id, author_user_id, slot, mood, sleep, energy, free_text)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'snabbnotering', 'happy', 'good', 'high', 'Snabb med extra fält');

\echo '---test 5: second morgon row same Stockholm day (expect unique-index violation)---'
savepoint sp5;
do $$
begin
  insert into daily_update
    (circle_id, author_user_id, slot, mood, sleep, energy, meal_eaten, free_text)
  values
    ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111',
     'morgon', 'tired', 'poor', 'low', 'nej', 'Dubblerad morgon');
  raise notice 'unexpectedly succeeded';
exception when others then
  raise notice 'caught: %', sqlerrm;
end;
$$;
rollback to savepoint sp5;

\echo '---test 6: relatives_only morgon — staff SELECTs (expect 0 rows)---'
-- Make the morgon row from test 1 relatives_only=true
update daily_update set relatives_only = true
  where slot = 'morgon'
    and circle_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select count(*) as staff_sees_morgon
from daily_update
where circle_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  and slot = 'morgon';

reset role;
rollback;
