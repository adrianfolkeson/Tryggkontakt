-- Tests for revoke_circle_member RPC.
--
-- 4 cases:
--   1. relative revokes staff → valid_to set; revoked user sees 0
--      daily_update rows for the krets
--   2. non-relative (staff) tries to revoke → RPC raises 42501,
--      target unchanged
--   3. relative tries to revoke another relative → RPC raises 42501,
--      target unchanged
--   4. revoked user's authored daily_update rows still visible to a
--      remaining active member (data preserved, only access lost)

begin;

create or replace function pg_temp.test_assert(p_label text, p_cond boolean)
returns void
language plpgsql as $$
begin
  if not p_cond then
    raise exception 'FAIL: %', p_label;
  end if;
  raise notice 'PASS: %', p_label;
end;
$$;

create or replace function pg_temp.become(p_uid uuid)
returns void
language plpgsql as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_uid::text, 'role', 'authenticated')::text,
    true
  );
end;
$$;

-- ================================================================
-- Fixtures
-- ================================================================
-- u_rel_a : relative, krets X      (caller in case 1, 3)
-- u_rel_b : relative, krets X      (second relative — target of case 3)
-- u_staff : staff,    krets X      (target of case 1, caller of case 2)
-- u_coord : coordinator, krets X   (target of case 2)
--
-- daily_update authored by u_staff and u_rel_a so case 1 and case 4
-- can both assert against them.

insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, reauthentication_token)
values
  ('a0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','rel_a@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('a0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','rel_b@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('a0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','staff@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('a0000004-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','coord@test','', now(),
   '{}','{}', now(), now(), '','','','','','');

insert into public.person (id, display_name) values
  ('b0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Testperson X');

insert into public.circle (id, person_id, name) values
  ('c0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'b0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Krets X');

insert into public.circle_member (id, circle_id, user_id, role, valid_from, valid_to) values
  ('d0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'c0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'a0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'relative',
   now() - interval '1 day', null),
  ('d0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'c0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'a0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'relative',
   now() - interval '1 day', null),
  ('d0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'c0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'a0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'staff',
   now() - interval '1 day', null),
  ('d0000004-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'c0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'a0000004-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'coordinator',
   now() - interval '1 day', null);

insert into public.daily_update
  (id, circle_id, author_user_id, slot, free_text)
values
  ('e0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'c0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'a0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'snabbnotering', 'Note authored by staff before revoke'),
  ('e0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'c0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'a0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'snabbnotering', 'Note authored by rel_a');

-- ================================================================
-- Case 2 (run BEFORE case 1 while target is still active):
--   non-relative (staff) tries to revoke coord → 42501.
-- ================================================================

set local role authenticated;
select pg_temp.become('a0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

do $$
begin
  perform public.revoke_circle_member('d0000004-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  raise exception 'FAIL: staff revoked coord without permission';
exception
  when sqlstate '42501' then
    raise notice 'PASS: staff revoke attempt raised 42501';
end;
$$;

reset role;
select pg_temp.test_assert(
  'case 2: coord still active after staff attempt',
  (select valid_to from public.circle_member
    where id = 'd0000004-aaaa-aaaa-aaaa-aaaaaaaaaaaa') is null);

-- ================================================================
-- Case 3 (run BEFORE case 1 while rel_b still active):
--   relative tries to revoke another relative → 42501.
-- ================================================================

set local role authenticated;
select pg_temp.become('a0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

do $$
begin
  perform public.revoke_circle_member('d0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  raise exception 'FAIL: relative revoked another relative';
exception
  when sqlstate '42501' then
    raise notice 'PASS: relative-to-relative revoke raised 42501';
end;
$$;

reset role;
select pg_temp.test_assert(
  'case 3: rel_b still active after rel_a attempt',
  (select valid_to from public.circle_member
    where id = 'd0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa') is null);

-- ================================================================
-- Case 1: relative revokes staff → valid_to set; revoked user sees
-- 0 daily_update rows for the krets.
-- ================================================================

set local role authenticated;
select pg_temp.become('a0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select public.revoke_circle_member('d0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

reset role;
select pg_temp.test_assert(
  'case 1: staff member row has valid_to set',
  (select valid_to from public.circle_member
    where id = 'd0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa') is not null);

set local role authenticated;
select pg_temp.become('a0000003-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select pg_temp.test_assert(
  'case 1: revoked staff sees 0 daily_update rows',
  (select count(*) from public.daily_update
    where circle_id = 'c0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 0);

-- ================================================================
-- Case 4: revoked user's authored row still visible to remaining
-- active member (data preserved; only access lost).
-- ================================================================

select pg_temp.become('a0000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select pg_temp.test_assert(
  'case 4: rel_b still sees staff-authored row after revoke',
  (select count(*) from public.daily_update
    where id = 'e0000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 1);

reset role;
rollback;
