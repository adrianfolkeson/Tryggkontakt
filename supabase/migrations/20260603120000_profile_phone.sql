-- §profile_phone: optional emergency contact phone on profile_public.
-- Backfill: existing rows stay null. Format check is permissive
-- (digits, +, space, paren, hyphen) — Swedish/international typing
-- varies and we'd rather store what the user typed than reject
-- "070-123 45 67" / "+46 70 123 45 67" / "0701234567".

alter table public.profile_public
  add column phone_number text
    check (phone_number is null or
           (char_length(phone_number) between 4 and 32
            and phone_number ~ '^[0-9+\s()-]+$'));

-- Extend create_first_circle to also accept a phone number. Drop the
-- old 5-arg signature so the resolver isn't ambiguous; the new 6-arg
-- version has p_phone_number defaulted to null, so callers that pass
-- 5 args (the legacy server action during the deploy window) still
-- resolve correctly via Postgres default-arg handling.

drop function if exists public.create_first_circle(
  uuid, text, text, text, date
);

create or replace function public.create_first_circle(
  p_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_person_first_name text,
  p_person_date_of_birth date default null,
  p_phone_number text default null
) returns uuid
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_person_id uuid;
  v_circle_id uuid;
  v_phone text;
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'user not found';
  end if;

  if exists (
    select 1 from public.circle_member cm
    where cm.user_id = p_user_id
      and cm.valid_from <= now()
      and (cm.valid_to is null or cm.valid_to > now())
  ) then
    raise exception 'user already has an active circle membership';
  end if;

  if length(trim(coalesce(p_first_name, ''))) = 0
     or length(trim(coalesce(p_last_name, ''))) = 0
     or length(trim(coalesce(p_person_first_name, ''))) = 0 then
    raise exception 'first_name, last_name, and person_first_name are required';
  end if;

  v_phone := nullif(trim(coalesce(p_phone_number, '')), '');

  insert into public.profile_public (user_id, display_name, phone_number)
  values (
    p_user_id,
    trim(p_first_name) || ' ' || trim(p_last_name),
    v_phone
  )
  on conflict (user_id)
    do update set display_name = excluded.display_name,
                  phone_number = excluded.phone_number,
                  updated_at = now();

  insert into public.person (display_name, date_of_birth)
  values (trim(p_person_first_name), p_person_date_of_birth)
  returning id into v_person_id;

  insert into public.circle (person_id, ai_summary_enabled, retention_months)
  values (v_person_id, true, null)
  returning id into v_circle_id;

  insert into public.circle_member
    (circle_id, user_id, role, valid_from, valid_to)
  values
    (v_circle_id, p_user_id, 'relative', now(), null);

  return v_circle_id;
end;
$$;

revoke all on function public.create_first_circle(uuid, text, text, text, date, text) from public;
revoke all on function public.create_first_circle(uuid, text, text, text, date, text) from anon;
revoke all on function public.create_first_circle(uuid, text, text, text, date, text) from authenticated;
grant execute on function public.create_first_circle(uuid, text, text, text, date, text) to service_role;
