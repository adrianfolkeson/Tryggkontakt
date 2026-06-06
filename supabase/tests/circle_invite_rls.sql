-- RLS + accept_invite RPC smoke. Seven cases.
-- Wrapped in begin; rollback; leaves no fixtures behind.

begin;

-- ============================================================
-- Fixtures: two circles, three users
-- u1 active relative in A
-- u2 active staff in A
-- u3 former relative in A (valid_to past)
-- inv: pending invite into A for invitee email "joiner@test"
-- inv_expired: pending invite with expires_at in the past
-- ============================================================

insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, reauthentication_token)
values
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','inv-relative@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('22222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','inv-staff@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('33333333-3333-3333-3333-333333333333','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','inv-former@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('44444444-4444-4444-4444-444444444444','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','joiner@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('55555555-5555-5555-5555-555555555555','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','wrongemail@test','', now(),
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
   now() - interval '1 day', null),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '33333333-3333-3333-3333-333333333333','relative',
   now() - interval '7 days', now() - interval '1 day');

insert into circle_invite
  (id, circle_id, invited_by_user_id, invited_email, role, token,
   status, expires_at)
values
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'joiner@test', 'staff', 'token-valid',
   'pending', now() + interval '5 days'),
  ('22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   -- different email so the seed itself doesn't violate the
   -- 20260605 unique partial index (one live per circle+email).
   'joiner-expired@test', 'staff', 'token-expired',
   'pending', now() - interval '1 day');

-- ============================================================
-- RLS SELECT cases
-- ============================================================
set local role authenticated;

select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
\echo '---test 1: relative SELECTs invites in own circle (expect 2)---'
select count(*) as relative_visible from circle_invite
  where circle_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
\echo '---test 2: staff SELECTs (expect 0; RLS denies non-relative)---'
select count(*) as staff_visible from circle_invite
  where circle_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
\echo '---test 3: former relative SELECTs (expect 0)---'
select count(*) as former_visible from circle_invite
  where circle_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

reset role;

-- ============================================================
-- accept_invite RPC cases. Run as postgres (service_role-equivalent).
-- ============================================================

\echo '---test 4: happy path (matching email, valid token)---'
savepoint sp4;
select public.accept_invite('token-valid',
  '44444444-4444-4444-4444-444444444444');
select
  (select status from circle_invite where token = 'token-valid') as status,
  (select count(*) from profile_public
    where user_id = '44444444-4444-4444-4444-444444444444') as profile_inserted,
  (select count(*) from circle_member
    where circle_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
      and user_id = '44444444-4444-4444-4444-444444444444'
      and valid_to is null) as membership_inserted;
rollback to savepoint sp4;

\echo '---test 5: wrong email (expect email_mismatch)---'
savepoint sp5;
do $$
begin
  perform public.accept_invite('token-valid',
    '55555555-5555-5555-5555-555555555555');
  raise notice 'unexpectedly succeeded';
exception when others then
  raise notice 'caught: %', sqlerrm;
end;
$$;
rollback to savepoint sp5;

\echo '---test 6: expired token (expect invite_expired exception; status stays pending — see migration note)---'
savepoint sp6;
do $$
begin
  perform public.accept_invite('token-expired',
    '44444444-4444-4444-4444-444444444444');
  raise notice 'unexpectedly succeeded';
exception when others then
  raise notice 'caught: %', sqlerrm;
end;
$$;
rollback to savepoint sp6;

\echo '---test 7: already member (expect already_member)---'
savepoint sp7;
-- Make joiner already a member, then attempt accept.
insert into circle_member (circle_id, user_id, role, valid_from, valid_to)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '44444444-4444-4444-4444-444444444444','staff',
   now() - interval '1 day', null);
do $$
begin
  perform public.accept_invite('token-valid',
    '44444444-4444-4444-4444-444444444444');
  raise notice 'unexpectedly succeeded';
exception when others then
  raise notice 'caught: %', sqlerrm;
end;
$$;
rollback to savepoint sp7;

-- ============================================================
-- Unique-index tests (20260605 migration: one live invite per
-- (circle, email))
-- ============================================================

\echo '---test A: second pending insert same (circle, email) (expect unique-index violation)---'
savepoint spA;
do $$
begin
  insert into circle_invite
    (circle_id, invited_by_user_id, invited_email, role, token,
     status, expires_at)
  values
    ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111',
     'joiner@test', 'staff', 'token-dup',
     'pending', now() + interval '7 days');
  raise notice 'unexpectedly succeeded';
exception when others then
  raise notice 'caught: %', sqlerrm;
end;
$$;
rollback to savepoint spA;

\echo '---test B: same (circle, email) AFTER revoking the first (expect INSERT 0 1)---'
savepoint spB;
update circle_invite set status = 'revoked'
  where token = 'token-valid';
insert into circle_invite
  (circle_id, invited_by_user_id, invited_email, role, token,
   status, expires_at)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'joiner@test', 'staff', 'token-after-revoke',
   'pending', now() + interval '7 days');
rollback to savepoint spB;

\echo '---test C: same (circle, email) AFTER accept (expect unique-index violation)---'
savepoint spC;
select public.accept_invite('token-valid',
  '44444444-4444-4444-4444-444444444444');
do $$
begin
  insert into circle_invite
    (circle_id, invited_by_user_id, invited_email, role, token,
     status, expires_at)
  values
    ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111',
     'joiner@test', 'staff', 'token-after-accept',
     'pending', now() + interval '7 days');
  raise notice 'unexpectedly succeeded';
exception when others then
  raise notice 'caught: %', sqlerrm;
end;
$$;
rollback to savepoint spC;

\echo '---test D: same (circle, email) when prior pending is expired but status not flipped (expect unique-index violation; resend goes through UPDATE)---'
savepoint spD;
do $$
begin
  insert into circle_invite
    (circle_id, invited_by_user_id, invited_email, role, token,
     status, expires_at)
  values
    ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111',
     'joiner@test', 'staff', 'token-after-expired',
     'pending', now() + interval '7 days');
  raise notice 'unexpectedly succeeded';
exception when others then
  raise notice 'caught: %', sqlerrm;
end;
$$;
rollback to savepoint spD;

rollback;
