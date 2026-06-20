-- Tests for delete_user_account RPC (GDPR Art 17 hard erasure).
--
-- Runs inside one transaction; rolls back at the end. Safe to re-run.
--
-- Usage (local):
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
--        -v ON_ERROR_STOP=1 -f supabase/tests/delete_user_account.sql
--
-- Test users:
--   u_solo  aaaaaaa1-…  relative   (sole member of krets_solo)
--   u_pair_a bbbbbbb1-…  relative   (member of krets_pair)
--   u_pair_b bbbbbbb2-…  staff      (member of krets_pair)
--
-- 7 cases:
--   1. self-delete cascades all author/profile/member rows for caller
--   2. cross-user delete (auth.uid <> p_user_id) raises SQLSTATE 42501
--      AND leaves victim's rows intact
--   3. auth.users row gone after self-delete
--   4. orphan circle: u_solo deletes self → krets_solo row gone
--   5. paired circle: u_pair_a deletes self → krets_pair row remains
--   6. paired circle: u_pair_b's data untouched by u_pair_a's delete
--   7. permission_denied early-exits before any DELETE runs (atomicity:
--      the EXCEPTION on the auth check fires before any row is touched)

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

insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, reauthentication_token)
values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','u_solo@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','u_pair_a@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','u_pair_b@test','', now(),
   '{}','{}', now(), now(), '','','','','','');

insert into public.person (id, display_name) values
  ('1aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Testperson solo'),
  ('1bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Testperson pair');

insert into public.circle (id, person_id, name) values
  ('2aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '1aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Krets solo'),
  ('2bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '1bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Krets pair');

insert into public.circle_member (circle_id, user_id, role, valid_from, valid_to) values
  ('2aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'relative',
   now() - interval '1 day', null),
  ('2bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'relative',
   now() - interval '1 day', null),
  ('2bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'staff',
   now() - interval '1 day', null);

insert into public.profile_public (user_id, display_name) values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Solo förälder'),
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Pair förälder'),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Pair personal');

insert into public.profile_contact (user_id, email, phone) values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'u_solo@test',   '0700000001'),
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'u_pair_a@test', '0700000002'),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'u_pair_b@test', '0700000003');

-- `meal_eaten` column was dropped in §0.6 cleanup.
insert into public.daily_update
  (id, circle_id, author_user_id, slot, mood, energy, free_text)
values
  ('11111111-1111-1111-1111-aaaaaaaaaaaa',
   '2aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'snabbnotering', null, null, 'solo note'),
  ('11111111-1111-1111-1111-bbbbbbbbbbbb',
   '2bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'snabbnotering', null, null, 'pair_a note'),
  ('11111111-1111-1111-1111-cccccccccccc',
   '2bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'snabbnotering', null, null, 'pair_b note');

-- ================================================================
-- Case 2 (must run first while victim still exists):
--   cross-user delete raises 42501 AND leaves victim untouched.
-- ================================================================

set local role authenticated;
select pg_temp.become('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

do $$
begin
  perform public.delete_user_account('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
  raise exception 'FAIL: cross-user delete did not raise';
exception
  when sqlstate '42501' then
    raise notice 'PASS: cross-user delete raised 42501';
  when others then
    raise exception 'FAIL: cross-user delete raised unexpected SQLSTATE %: %', sqlstate, sqlerrm;
end;
$$;

reset role;
select pg_temp.test_assert(
  'cross-user attempt left victim profile_public intact',
  (select count(*) from public.profile_public
    where user_id = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 1);
select pg_temp.test_assert(
  'cross-user attempt left victim daily_update intact',
  (select count(*) from public.daily_update
    where author_user_id = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 1);

-- Case 7: anonymous (no jwt) → 42501 before any DELETE runs.
set local role authenticated;
select set_config('request.jwt.claims', null, true);

do $$
begin
  perform public.delete_user_account('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  raise exception 'FAIL: anonymous caller did not raise';
exception
  when sqlstate '42501' then
    raise notice 'PASS: anonymous caller raised 42501 (early-exit before DELETEs)';
end;
$$;

reset role;
select pg_temp.test_assert(
  'anonymous attempt left solo profile_public intact',
  (select count(*) from public.profile_public
    where user_id = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 1);

-- ================================================================
-- Case 4 + 1: u_solo deletes self → all solo rows gone,
--             krets_solo gone (orphan circle cleanup).
-- ================================================================

set local role authenticated;
select pg_temp.become('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select public.delete_user_account('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

reset role;
select pg_temp.test_assert(
  'self-delete: 0 daily_update for u_solo',
  (select count(*) from public.daily_update
    where author_user_id = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 0);
select pg_temp.test_assert(
  'self-delete: 0 profile_public for u_solo',
  (select count(*) from public.profile_public
    where user_id = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 0);
select pg_temp.test_assert(
  'self-delete: 0 profile_contact for u_solo',
  (select count(*) from public.profile_contact
    where user_id = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 0);
select pg_temp.test_assert(
  'self-delete: 0 circle_member for u_solo',
  (select count(*) from public.circle_member
    where user_id = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 0);

-- Case 3: auth.users row gone.
select pg_temp.test_assert(
  'self-delete: auth.users row gone for u_solo',
  (select count(*) from auth.users
    where id = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 0);

-- Case 4: orphan krets gone.
select pg_temp.test_assert(
  'orphan cleanup: krets_solo row gone',
  (select count(*) from public.circle
    where id = '2aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 0);

-- ================================================================
-- Case 5 + 6: u_pair_a deletes self → krets_pair remains,
--             u_pair_b's data untouched.
-- ================================================================

set local role authenticated;
select pg_temp.become('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
select public.delete_user_account('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

reset role;
select pg_temp.test_assert(
  'paired delete: u_pair_a gone from auth.users',
  (select count(*) from auth.users
    where id = 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 0);
select pg_temp.test_assert(
  'paired delete: krets_pair still exists',
  (select count(*) from public.circle
    where id = '2bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 1);
select pg_temp.test_assert(
  'paired delete: u_pair_b membership intact',
  (select count(*) from public.circle_member
    where user_id = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
      and circle_id = '2bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 1);
select pg_temp.test_assert(
  'paired delete: u_pair_b daily_update intact',
  (select count(*) from public.daily_update
    where author_user_id = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 1);
select pg_temp.test_assert(
  'paired delete: u_pair_b profile_public intact',
  (select count(*) from public.profile_public
    where user_id = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 1);
select pg_temp.test_assert(
  'paired delete: u_pair_a daily_update gone',
  (select count(*) from public.daily_update
    where author_user_id = 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 0);

rollback;
