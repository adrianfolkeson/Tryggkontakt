-- RLS smoke test for TryggKontakt initial schema.
-- Runs inside one transaction; rolls back at the end. Safe to re-run.
--
-- Usage (local):
--   supabase db psql -f supabase/tests/rls.sql
-- Or with psql against the local Supabase Postgres:
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
--        -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
--
-- Test users:
--   u1 11111111-… relative          (active)
--   u2 22222222-… staff             (active)
--   u3 33333333-… staff             (valid_to in past — former)
--   u4 44444444-… coordinator       (active)
--
-- Asserts in this script (key cases from PR scope):
--   - staff_former sees zero rows in every table for this circle
--   - coordinator can SELECT profile_contact but cannot UPDATE it
--     for another user
--   - daily_update UPDATE succeeds only when author = self AND
--     membership currently active
--   - circle_member INSERT/UPDATE/DELETE all fail from the
--     authenticated role
--
-- Convention: pg_temp.test_assert raises NOTICE on PASS,
-- raises EXCEPTION on FAIL (so ON_ERROR_STOP=1 makes failures fatal).

begin;

-- ================================================================
-- Helpers
-- ================================================================

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
-- Fixtures (run as superuser; RLS does not apply to postgres)
-- ================================================================

insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, reauthentication_token)
values
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','relative@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('22222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','staff_active@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('33333333-3333-3333-3333-333333333333','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','staff_former@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('44444444-4444-4444-4444-444444444444','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','coordinator@test','', now(),
   '{}','{}', now(), now(), '','','','','','');

insert into public.person (id, display_name)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Testperson 1');

insert into public.circle (id, person_id, name)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Krets 1');

insert into public.circle_member (circle_id, user_id, role, valid_from, valid_to) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '11111111-1111-1111-1111-111111111111', 'relative',
   now() - interval '1 day', null),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '22222222-2222-2222-2222-222222222222', 'staff',
   now() - interval '1 day', null),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '33333333-3333-3333-3333-333333333333', 'staff',
   now() - interval '7 days', now() - interval '1 day'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '44444444-4444-4444-4444-444444444444', 'coordinator',
   now() - interval '1 day', null);

insert into public.profile_public (user_id, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'Testperson 1 förälder'),
  ('22222222-2222-2222-2222-222222222222', 'Testperson 1 personal (aktiv)'),
  ('33333333-3333-3333-3333-333333333333', 'Testperson 1 personal (fd)'),
  ('44444444-4444-4444-4444-444444444444', 'Testperson 1 samordnare');

insert into public.profile_contact (user_id, email, phone) values
  ('11111111-1111-1111-1111-111111111111', 'relative@test',     '0700000001'),
  ('22222222-2222-2222-2222-222222222222', 'staff_active@test', '0700000002'),
  ('33333333-3333-3333-3333-333333333333', 'staff_former@test', '0700000003'),
  ('44444444-4444-4444-4444-444444444444', 'coordinator@test',  '0700000004');

-- All fixture inserts use slot='snabbnotering' which only requires
-- free_text (per the conditional CHECK added in F5). Extra mood and
-- energy values are harmless under that slot. The legacy `sleep`
-- column was dropped in §0.6 cleanup.
insert into public.daily_update
  (id, circle_id, author_user_id, slot, mood, energy, free_text)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '22222222-2222-2222-2222-222222222222',
   'snabbnotering','calm','medium','Update by staff_active'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '11111111-1111-1111-1111-111111111111',
   'snabbnotering','happy','high','Update by relative'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '33333333-3333-3333-3333-333333333333',
   'snabbnotering','tired','low','Update by staff_former while still active');

-- ================================================================
-- Switch into the authenticated role for the remaining checks.
-- ================================================================

set local role authenticated;

-- ================================================================
-- Group A: staff_former (membership expired) sees nothing
-- ================================================================

select pg_temp.become('33333333-3333-3333-3333-333333333333');

select pg_temp.test_assert('staff_former: 0 daily_update rows',
  (select count(*) from public.daily_update
    where circle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 0);

select pg_temp.test_assert('staff_former: 0 circle_member rows',
  (select count(*) from public.circle_member
    where circle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 0);

select pg_temp.test_assert('staff_former: 0 circle rows',
  (select count(*) from public.circle
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 0);

select pg_temp.test_assert('staff_former: 0 person rows',
  (select count(*) from public.person
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 0);

select pg_temp.test_assert(
  'staff_former: cannot see relative profile_contact',
  (select count(*) from public.profile_contact
    where user_id = '11111111-1111-1111-1111-111111111111') = 0);

select pg_temp.test_assert(
  'staff_former: can still see own profile_contact (self row)',
  (select count(*) from public.profile_contact
    where user_id = '33333333-3333-3333-3333-333333333333') = 1);

-- ================================================================
-- Group B: coordinator SELECTs profile_contact, cannot UPDATE others
-- ================================================================

select pg_temp.become('44444444-4444-4444-4444-444444444444');

select pg_temp.test_assert(
  'coordinator: SELECTs relative profile_contact',
  (select count(*) from public.profile_contact
    where user_id = '11111111-1111-1111-1111-111111111111') = 1);

do $$
declare rows_affected int;
begin
  update public.profile_contact
     set phone = '0700099999'
   where user_id = '11111111-1111-1111-1111-111111111111';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 0 then
    raise exception 'FAIL: coordinator UPDATEd relative profile_contact (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: coordinator cannot UPDATE relative profile_contact';
end;
$$;

do $$
declare rows_affected int;
begin
  update public.profile_contact
     set phone = '0700000444'
   where user_id = '44444444-4444-4444-4444-444444444444';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 1 then
    raise exception 'FAIL: coordinator could not UPDATE own profile_contact (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: coordinator can UPDATE own profile_contact';
end;
$$;

-- ================================================================
-- Group C: daily_update UPDATE — only author + currently active
-- ================================================================

select pg_temp.become('22222222-2222-2222-2222-222222222222');  -- staff_active

do $$
declare rows_affected int;
begin
  update public.daily_update
     set free_text = 'edited by staff_active'
   where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 1 then
    raise exception 'FAIL: staff_active could not edit own update (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: staff_active can UPDATE own daily_update';
end;
$$;

do $$
declare rows_affected int;
begin
  update public.daily_update
     set free_text = 'forbidden edit'
   where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 0 then
    raise exception 'FAIL: staff_active edited relative update (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: staff_active cannot UPDATE another author''s daily_update';
end;
$$;

select pg_temp.become('33333333-3333-3333-3333-333333333333');  -- staff_former

do $$
declare rows_affected int;
begin
  update public.daily_update
     set free_text = 'former tries to edit own'
   where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 0 then
    raise exception 'FAIL: former staff UPDATEd own old update (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: former staff cannot UPDATE their own old daily_update';
end;
$$;

-- ================================================================
-- Group D: circle_member writes blocked from authenticated context
-- ================================================================

select pg_temp.become('11111111-1111-1111-1111-111111111111');  -- relative (most privileged)

do $$
begin
  insert into public.circle_member (circle_id, user_id, role)
  values
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '44444444-4444-4444-4444-444444444444', 'staff');
  raise exception 'FAIL: relative INSERTed into circle_member from client';
exception
  when insufficient_privilege then
    raise notice 'PASS: relative blocked from circle_member INSERT (insufficient_privilege)';
  when others then
    if sqlerrm like '%row-level security%' or sqlerrm like '%violates row-level security policy%' then
      raise notice 'PASS: relative blocked from circle_member INSERT (RLS: %)', sqlerrm;
    else
      raise;
    end if;
end;
$$;

do $$
declare rows_affected int;
begin
  update public.circle_member
     set role = 'coordinator'
   where user_id = '22222222-2222-2222-2222-222222222222'
     and circle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 0 then
    raise exception 'FAIL: relative UPDATEd circle_member (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: relative blocked from circle_member UPDATE (rows=0)';
end;
$$;

do $$
declare rows_affected int;
begin
  delete from public.circle_member
   where user_id = '22222222-2222-2222-2222-222222222222'
     and circle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 0 then
    raise exception 'FAIL: relative DELETEd circle_member (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: relative blocked from circle_member DELETE (rows=0)';
end;
$$;

-- ================================================================
-- Group E: positive read counts and daily_update insert/delete behaviour
-- ================================================================

select pg_temp.become('11111111-1111-1111-1111-111111111111');
select pg_temp.test_assert('relative: sees 3 daily_updates',
  (select count(*) from public.daily_update
    where circle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 3);
select pg_temp.test_assert('relative: sees 4 circle_members',
  (select count(*) from public.circle_member
    where circle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 4);

select pg_temp.become('22222222-2222-2222-2222-222222222222');
select pg_temp.test_assert('staff_active: sees 3 daily_updates',
  (select count(*) from public.daily_update
    where circle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 3);
select pg_temp.test_assert('staff_active: sees 4 circle_members',
  (select count(*) from public.circle_member
    where circle_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') = 4);

select pg_temp.become('11111111-1111-1111-1111-111111111111');
do $$
begin
  insert into public.daily_update
    (circle_id, author_user_id, slot, mood, energy, free_text)
  values
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '11111111-1111-1111-1111-111111111111',
     'snabbnotering','calm','high','Second relative update');
  raise notice 'PASS: relative INSERTed own daily_update';
exception when others then
  raise exception 'FAIL: relative could not INSERT own daily_update (%)', sqlerrm;
end;
$$;

do $$
begin
  insert into public.daily_update
    (circle_id, author_user_id, slot, mood, energy, free_text)
  values
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '22222222-2222-2222-2222-222222222222',
     'snabbnotering','happy','medium','spoofed author');
  raise exception 'FAIL: relative INSERTed daily_update with spoofed author_user_id';
exception
  when insufficient_privilege then
    raise notice 'PASS: relative cannot spoof author_user_id (insufficient_privilege)';
  when others then
    if sqlerrm like '%row-level security%' then
      raise notice 'PASS: relative cannot spoof author_user_id (RLS: %)', sqlerrm;
    else raise;
    end if;
end;
$$;

select pg_temp.become('33333333-3333-3333-3333-333333333333');
do $$
begin
  insert into public.daily_update
    (circle_id, author_user_id, slot, mood, energy, free_text)
  values
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '33333333-3333-3333-3333-333333333333',
     'snabbnotering','tired','low','former trying to insert');
  raise exception 'FAIL: former staff INSERTed daily_update';
exception
  when insufficient_privilege then
    raise notice 'PASS: former staff cannot INSERT daily_update (insufficient_privilege)';
  when others then
    if sqlerrm like '%row-level security%' then
      raise notice 'PASS: former staff cannot INSERT daily_update (RLS: %)', sqlerrm;
    else raise;
    end if;
end;
$$;

select pg_temp.become('22222222-2222-2222-2222-222222222222');
do $$
declare rows_affected int;
begin
  delete from public.daily_update
   where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 0 then
    raise exception 'FAIL: staff_active DELETEd relative update (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: staff_active cannot DELETE another author''s daily_update';
end;
$$;

do $$
declare rows_affected int;
begin
  delete from public.daily_update
   where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 1 then
    raise exception 'FAIL: staff_active could not DELETE own update (rows=%)', rows_affected;
  end if;
  raise notice 'PASS: staff_active DELETEs own daily_update';
end;
$$;

reset role;
rollback;
