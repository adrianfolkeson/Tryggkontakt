-- Tests for profile_public.default_relatives_only column + RLS.
--
-- Runs inside one transaction; rolls back at the end.
--
-- 2 cases:
--   1. user can UPDATE own default_relatives_only
--   2. user cannot UPDATE another user's default_relatives_only

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
  ('a1111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','vis_a@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('a2222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','vis_b@test','', now(),
   '{}','{}', now(), now(), '','','','','','');

insert into public.profile_public (user_id, display_name, default_relatives_only) values
  ('a1111111-1111-1111-1111-111111111111', 'Vis A', false),
  ('a2222222-2222-2222-2222-222222222222', 'Vis B', false);

set local role authenticated;

-- Case 1: own update works.
select pg_temp.become('a1111111-1111-1111-1111-111111111111');

do $$
declare rows_affected int;
begin
  update public.profile_public
     set default_relatives_only = true
   where user_id = 'a1111111-1111-1111-1111-111111111111';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 1 then
    raise exception 'FAIL: own UPDATE rows=%', rows_affected;
  end if;
  raise notice 'PASS: own default_relatives_only UPDATE works';
end;
$$;

select pg_temp.test_assert(
  'own row reflects new value',
  (select default_relatives_only from public.profile_public
    where user_id = 'a1111111-1111-1111-1111-111111111111') = true);

-- Case 2: cannot update another user's row.
do $$
declare rows_affected int;
begin
  update public.profile_public
     set default_relatives_only = true
   where user_id = 'a2222222-2222-2222-2222-222222222222';
  get diagnostics rows_affected = row_count;
  if rows_affected <> 0 then
    raise exception 'FAIL: cross-user UPDATE rows=% (RLS hole)', rows_affected;
  end if;
  raise notice 'PASS: cross-user default_relatives_only UPDATE blocked (rows=0)';
end;
$$;

reset role;
select pg_temp.test_assert(
  'cross-user row value unchanged',
  (select default_relatives_only from public.profile_public
    where user_id = 'a2222222-2222-2222-2222-222222222222') = false);

rollback;
