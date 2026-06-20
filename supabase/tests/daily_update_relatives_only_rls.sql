-- daily_update relatives_only SELECT predicate smoke.
-- Fixture: 4 users active in circle A (relative author, relative
-- co-member, staff, coordinator). Two updates by the relative author:
-- one with relatives_only=true, one with relatives_only=false.
-- Wrapped in begin; rollback; leaves no fixtures.

begin;

insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, reauthentication_token)
values
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','ro-author@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('22222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','ro-corel@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('33333333-3333-3333-3333-333333333333','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','ro-staff@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('44444444-4444-4444-4444-444444444444','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','ro-coord@test','', now(),
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
   '22222222-2222-2222-2222-222222222222','relative',
   now() - interval '1 day', null),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '33333333-3333-3333-3333-333333333333','staff',
   now() - interval '1 day', null),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '44444444-4444-4444-4444-444444444444','coordinator',
   now() - interval '1 day', null);

-- Two updates by the relative author.
-- Both use slot='snabbnotering' because the conditional CHECK only
-- requires free_text on that slot. Extra mood and energy values are
-- harmless under that slot. The legacy `sleep` column was dropped
-- in §0.6 cleanup.
insert into daily_update
  (id, circle_id, author_user_id, slot, mood, energy, free_text, relatives_only)
values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'snabbnotering','calm','medium','Restricted', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'snabbnotering','happy','high','Open', false);

set local role authenticated;

\echo '---test 1: co-relative SELECTs relatives_only row (expect 1)---'
select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select count(*) as corel_sees
from daily_update
where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

\echo '---test 2: staff SELECTs relatives_only row (expect 0)---'
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select count(*) as staff_sees
from daily_update
where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

\echo '---test 3: coordinator SELECTs relatives_only row (expect 0)---'
select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);
select count(*) as coord_sees
from daily_update
where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

\echo '---test 4: staff SELECTs the non-restricted row (control, expect 1)---'
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select count(*) as staff_sees_open
from daily_update
where id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

\echo '---test 5: author (relative) SELECTs own relatives_only row (expect 1)---'
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select count(*) as author_sees
from daily_update
where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

reset role;
rollback;
