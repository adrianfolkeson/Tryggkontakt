-- §invite flow. circle_invite table + accept_invite RPC.
-- SELECT visible to active relatives only; all writes via service_role.

create table public.circle_invite (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null
    references public.circle(id) on delete cascade,
  invited_by_user_id uuid not null
    references auth.users(id) on delete restrict,
  invited_email text not null
    check (char_length(invited_email) between 3 and 320),
  role member_role not null,
  token text not null unique,
  status text not null default 'pending'
    check (status in ('pending','accepted','expired','revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by_user_id uuid
    references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index circle_invite_circle_idx
  on public.circle_invite (circle_id);
create index circle_invite_token_idx
  on public.circle_invite (token);
create index circle_invite_email_status_idx
  on public.circle_invite (lower(invited_email), status);

create trigger circle_invite_touch_updated_at
  before update on public.circle_invite
  for each row execute function public.touch_updated_at();

alter table public.circle_invite enable row level security;

create policy circle_invite_select on public.circle_invite
  for select to authenticated
  using (public.has_active_circle_role(
    circle_invite.circle_id,
    array['relative']::member_role[]
  ));

-- No INSERT/UPDATE/DELETE policies. All writes go through server
-- actions using the service_role key.

-- ============================================================
-- accept_invite(p_token, p_user_id)
-- Atomic pending → accepted flip with profile + membership bootstrap.
-- SECURITY INVOKER; EXECUTE granted to service_role only.
-- Raises domain exceptions the server action maps to UI copy.
-- ============================================================
create or replace function public.accept_invite(
  p_token text,
  p_user_id uuid
) returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_invite record;
  v_email text;
begin
  if p_token is null or p_user_id is null then
    raise exception 'invite_not_found';
  end if;

  select * into v_invite
  from public.circle_invite
  where token = p_token
    and status = 'pending'
  for update;

  if not found then
    raise exception 'invite_not_found';
  end if;

  -- NOTE: we don't flip status='expired' here. A `raise exception`
  -- aborts the current transaction (including any UPDATE we did just
  -- now in the same function call), so the status flip wouldn't
  -- persist. Expired invites stay status='pending' in the table but
  -- are functionally dead — any accept attempt re-raises. A separate
  -- cleanup job can sweep status to 'expired' later if needed.
  if v_invite.expires_at < now() then
    raise exception 'invite_expired';
  end if;

  select email into v_email
  from auth.users
  where id = p_user_id;

  if v_email is null then
    raise exception 'user_not_found';
  end if;

  if lower(v_email) <> lower(v_invite.invited_email) then
    raise exception 'email_mismatch';
  end if;

  if exists (
    select 1 from public.circle_member cm
    where cm.circle_id = v_invite.circle_id
      and cm.user_id = p_user_id
      and cm.valid_from <= now()
      and (cm.valid_to is null or cm.valid_to > now())
  ) then
    raise exception 'already_member';
  end if;

  insert into public.profile_public (user_id, display_name)
  values (p_user_id, '')
  on conflict (user_id) do nothing;

  insert into public.circle_member
    (circle_id, user_id, role, valid_from, valid_to)
  values
    (v_invite.circle_id, p_user_id, v_invite.role, now(), null);

  update public.circle_invite
     set status = 'accepted',
         accepted_at = now(),
         accepted_by_user_id = p_user_id,
         updated_at = now()
   where id = v_invite.id;
end;
$$;

revoke all on function public.accept_invite(text, uuid) from public;
revoke all on function public.accept_invite(text, uuid) from anon;
revoke all on function public.accept_invite(text, uuid) from authenticated;
grant execute on function public.accept_invite(text, uuid) to service_role;
