-- §F1: relatives can revoke non-relative members of their krets.
-- Implemented as a SECURITY DEFINER RPC so the policy lives in one
-- place and can be audited later. Direct UPDATE on circle_member from
-- the authenticated role stays blocked.
--
-- Rules enforced inside the function:
--   * caller must be authenticated
--   * target member row must exist AND currently be active
--   * caller cannot revoke themselves (separate "leave" flow exists)
--   * caller cannot revoke a relative this pass (out of scope; more
--     safeguards required before relatives can revoke each other)
--   * caller must be an active relative of the same krets
--
-- Audit trail for now: the valid_to timestamp + RPC-only write path
-- is the audit. A separate access_log entry can be added later when
-- we wire access_log app-layer writes (§13 PROJECT.md).

create or replace function public.revoke_circle_member(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller uuid := auth.uid();
  v_circle_id uuid;
  v_target_user_id uuid;
  v_target_role member_role;
begin
  if v_caller is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select cm.circle_id, cm.user_id, cm.role
    into v_circle_id, v_target_user_id, v_target_role
    from public.circle_member cm
   where cm.id = p_member_id
     and cm.valid_to is null;

  if v_circle_id is null then
    raise exception 'member not found or already revoked' using errcode = 'P0002';
  end if;

  if v_target_user_id = v_caller then
    raise exception 'cannot revoke yourself' using errcode = '42501';
  end if;

  if v_target_role = 'relative' then
    raise exception 'cannot revoke a relative' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.circle_member cm
     where cm.circle_id = v_circle_id
       and cm.user_id = v_caller
       and cm.role = 'relative'
       and cm.valid_from <= now()
       and (cm.valid_to is null or cm.valid_to > now())
  ) then
    raise exception 'caller is not an active relative of this circle'
      using errcode = '42501';
  end if;

  update public.circle_member
     set valid_to = now()
   where id = p_member_id;
end;
$$;

revoke all on function public.revoke_circle_member(uuid) from public;
revoke all on function public.revoke_circle_member(uuid) from anon;
grant execute on function public.revoke_circle_member(uuid) to authenticated;
