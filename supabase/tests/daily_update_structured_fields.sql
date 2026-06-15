-- Tests for §F5 structured per-slot fields.
--
-- 4 cases:
--   1. Relative inserts morgon update with all 4 structured fields
--      populated → row visible to all members per existing RLS.
--   2. Insert with period_note only (other 3 null) → succeeds, nulls
--      preserved on select.
--   3. Snabbnotering insert with free_text only (no structured
--      fields) → succeeds; named-slot insert with free_text=null
--      also succeeds (no more per-slot CHECK).
--   4. relatives_only=true update with structured fields → visible
--      to relatives only, not to staff (existing relatives_only RLS
--      rides on the new columns).

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
-- Fixtures: relative + staff in krets X.
-- ================================================================

insert into auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, reauthentication_token)
values
  ('f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','f5_rel@test','', now(),
   '{}','{}', now(), now(), '','','','','',''),
  ('f5000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','f5_staff@test','', now(),
   '{}','{}', now(), now(), '','','','','','');

insert into public.person (id, display_name) values
  ('f5111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Testperson F5');

insert into public.circle (id, person_id, name) values
  ('f5222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'f5111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Krets F5');

insert into public.circle_member (circle_id, user_id, role, valid_from, valid_to) values
  ('f5222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'relative',
   now() - interval '1 day', null),
  ('f5222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'f5000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'staff',
   now() - interval '1 day', null);

set local role authenticated;

-- ================================================================
-- Case 1: relative inserts morgon with all 4 structured fields.
-- ================================================================

select pg_temp.become('f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

do $$
begin
  insert into public.daily_update
    (id, circle_id, author_user_id, slot,
     period_note, meal_note, mood, energy)
  values
    ('f5333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'morgon',
     'Sov bra till 06:30', 'Åt frukost ordentligt',
     'Glad', 'Hög');
  raise notice 'PASS: morgon insert with all 4 fields succeeded';
exception when others then
  raise exception 'FAIL: morgon insert raised %', sqlerrm;
end;
$$;

select pg_temp.test_assert(
  'case 1: relative sees own morgon row',
  (select count(*) from public.daily_update
    where id = 'f5333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 1);

select pg_temp.become('f5000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select pg_temp.test_assert(
  'case 1: staff (active member) also sees morgon row',
  (select count(*) from public.daily_update
    where id = 'f5333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 1);

-- ================================================================
-- Case 2: insert with period_note only — other 3 nullable.
-- ================================================================

select pg_temp.become('f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

do $$
begin
  insert into public.daily_update
    (id, circle_id, author_user_id, slot, period_note)
  values
    ('f5444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'lunch', 'Lugn förmiddag');
  raise notice 'PASS: lunch insert with only period_note succeeded';
exception when others then
  raise exception 'FAIL: lunch period_note-only insert raised %', sqlerrm;
end;
$$;

reset role;
select pg_temp.test_assert(
  'case 2: meal_note / mood / energy / free_text all null',
  (select meal_note is null and mood is null
            and energy is null and free_text is null
     from public.daily_update
    where id = 'f5444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa'));

-- ================================================================
-- Case 3: snabbnotering with free_text only; named slot with
-- free_text null — both must succeed (no more per-slot non-null
-- gate; only snabbnotering still requires free_text).
-- ================================================================

set local role authenticated;
select pg_temp.become('f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

do $$
begin
  insert into public.daily_update
    (id, circle_id, author_user_id, slot, free_text)
  values
    ('f5555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'snabbnotering', 'Snabb anteckning');
  raise notice 'PASS: snabbnotering with free_text inserted';
exception when others then
  raise exception 'FAIL: snabbnotering insert raised %', sqlerrm;
end;
$$;

do $$
begin
  insert into public.daily_update
    (id, circle_id, author_user_id, slot, free_text)
  values
    ('f5666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'snabbnotering', null);
  raise exception 'FAIL: snabbnotering accepted NULL free_text';
exception
  when sqlstate '23514' then
    raise notice 'PASS: snabbnotering CHECK rejects NULL free_text';
end;
$$;

-- ================================================================
-- Case 4: relatives_only=true update with structured fields.
-- ================================================================

do $$
begin
  insert into public.daily_update
    (id, circle_id, author_user_id, slot,
     period_note, mood, relatives_only)
  values
    ('f5777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'f5000001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'eftermiddag',
     'Tuff eftermiddag', 'Orolig', true);
  raise notice 'PASS: relatives_only insert with structured fields';
exception when others then
  raise exception 'FAIL: relatives_only insert raised %', sqlerrm;
end;
$$;

select pg_temp.test_assert(
  'case 4: relative author sees own relatives_only row',
  (select count(*) from public.daily_update
    where id = 'f5777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 1);

select pg_temp.become('f5000002-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select pg_temp.test_assert(
  'case 4: staff cannot see relatives_only row',
  (select count(*) from public.daily_update
    where id = 'f5777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = 0);

reset role;
rollback;
