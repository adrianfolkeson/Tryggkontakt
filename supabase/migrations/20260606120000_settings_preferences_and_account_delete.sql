-- §settings: per-user default visibility for new daily updates,
-- plus an atomic delete_user_account RPC for GDPR Art 17 erasure.
--
-- The new column rides on existing profile_public RLS (own-row
-- read, own-row write) — no policy change required. Default false
-- matches the current per-update default ("Alla i kretsen").
--
-- delete_user_account is SECURITY DEFINER + explicit auth.uid()
-- check so only the caller can erase themselves. The function is
-- owned by postgres (default for migration-created functions),
-- which has full privileges on auth.users, so no extra GRANT on
-- auth schema is needed.

alter table public.profile_public
  add column default_relatives_only boolean not null default false;

create or replace function public.delete_user_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_user_id is null or auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  delete from public.daily_update     where author_user_id     = p_user_id;
  delete from public.schedule_item    where created_by_user_id = p_user_id;
  delete from public.reminder         where created_by_user_id = p_user_id;
  delete from public.circle_invite    where invited_by_user_id = p_user_id;
  delete from public.access_log       where actor_user_id     = p_user_id;
  delete from public.circle_member    where user_id           = p_user_id;
  delete from public.profile_contact  where user_id           = p_user_id;
  delete from public.profile_public   where user_id           = p_user_id;
  delete from auth.users              where id                = p_user_id;

  -- Clean up orphan circles whose last member just left.
  delete from public.circle
   where id not in (select circle_id from public.circle_member);
end;
$$;

revoke all on function public.delete_user_account(uuid) from public;
revoke all on function public.delete_user_account(uuid) from anon;
grant execute on function public.delete_user_account(uuid) to authenticated;
