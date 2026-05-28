-- Bootstrap function for the first-time user flow.
-- Atomically creates profile_public + person + circle + circle_member
-- in a single transaction.
--
-- SECURITY INVOKER (default). EXECUTE is granted only to service_role,
-- which bypasses RLS by default. The caller's user_id is passed
-- explicitly so the function knows whom to attach as the founding
-- relative, and the function validates that the user has no active
-- membership yet (this is the "first circle" path, not coordinator
-- onboarding).

create or replace function public.create_first_circle(
  p_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_person_first_name text,
  p_person_date_of_birth date default null
) returns uuid
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_person_id uuid;
  v_circle_id uuid;
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

  insert into public.profile_public (user_id, display_name)
  values (p_user_id, trim(p_first_name) || ' ' || trim(p_last_name))
  on conflict (user_id)
    do update set display_name = excluded.display_name,
                  updated_at = now();

  insert into public.person (display_name, date_of_birth)
  values (trim(p_person_first_name), p_person_date_of_birth)
  returning id into v_person_id;

  insert into public.circle (person_id, ai_summary_enabled, retention_months)
  values (v_person_id, true, null)
  returning id into v_circle_id;

  insert into public.circle_member (circle_id, user_id, role, valid_from, valid_to)
  values (v_circle_id, p_user_id, 'relative', now(), null);

  return v_circle_id;
end;
$$;

-- Lock the function down to service_role only. Supabase's default
-- ACLs grant EXECUTE on new public-schema functions to anon and
-- authenticated as well as PUBLIC; revoke from each explicitly so
-- the only caller is a server action holding the service_role key.
revoke all on function public.create_first_circle(uuid, text, text, text, date) from public;
revoke all on function public.create_first_circle(uuid, text, text, text, date) from anon;
revoke all on function public.create_first_circle(uuid, text, text, text, date) from authenticated;
grant execute on function public.create_first_circle(uuid, text, text, text, date) to service_role;
