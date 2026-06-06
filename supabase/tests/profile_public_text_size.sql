-- Tests for profile_public.text_size column + RLS + CHECK.
--
-- 3 cases:
--   1. user updates own text_size with valid enum value → success
--   2. user updates another user's text_size → 0 rows affected (RLS)
--   3. CHECK constraint rejects 'huge' (or any non-enum value)

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

insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, reauthentication_token)
values
  ('70000001-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','ts_a@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('70000002-2222-2222-2222-222222222222','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','ts_b@test','', now(),
   '{}','{}', now(), now(), '','','','','','');

insert into public.profile_public (user_id, display_name) values
  ('70000001-1111-1111-1111-111111111111', 'TS A'),
  ('70000002-2222-2222-2222-222222222222', 'TS B');

set local role authenticated;

-- Case 1: own update with valid enum.
select pg_temp.become('70000001-1111-1111-1111-111111111111');

do $$
declare rows_affected int;
begin
  update public.profile_public
     set text_size = 'large'
   where user_id = '70000001-1111-1111-1111-111111111111';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 1 then
    raise exception 'FAIL: own text_size UPDATE rows=%', rows_affected;
  end if;
  raise notice 'PASS: own text_size UPDATE applied';
end;
$$;

select pg_temp.test_assert(
  'case 1: own row reflects large',
  (select text_size from public.profile_public
    where user_id = '70000001-1111-1111-1111-111111111111') = 'large');

-- Case 2: cross-user update blocked.
do $$
declare rows_affected int;
begin
  update public.profile_public
     set text_size = 'large'
   where user_id = '70000002-2222-2222-2222-222222222222';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 0 then
    raise exception 'FAIL: cross-user text_size UPDATE rows=% (RLS hole)', rows_affected;
  end if;
  raise notice 'PASS: cross-user text_size UPDATE blocked (rows=0)';
end;
$$;

reset role;
select pg_temp.test_assert(
  'case 2: cross-user row still medium',
  (select text_size from public.profile_public
    where user_id = '70000002-2222-2222-2222-222222222222') = 'medium');

-- Case 3: CHECK rejects non-enum value (run as postgres so RLS doesn't
-- short-circuit the constraint check).
do $$
begin
  update public.profile_public
     set text_size = 'huge'
   where user_id = '70000001-1111-1111-1111-111111111111';
  raise exception 'FAIL: CHECK did not reject text_size=huge';
exception
  when sqlstate '23514' then
    raise notice 'PASS: CHECK rejected text_size=huge (23514)';
end;
$$;

rollback;
