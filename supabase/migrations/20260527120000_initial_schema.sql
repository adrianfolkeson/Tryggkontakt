-- Initial schema for TryggKontakt MVP.
-- See PROJECT.md §5, §8, §13, §18 and CLAUDE.md for rationale.
--
-- Decisions baked into this schema:
--   - One person ↔ one circle (§18). Enforced by unique fk.
--   - Time-bounded memberships; valid_to NULL = currently active.
--   - RLS evaluates the requester's active membership at
--     current_timestamp, so former staff cannot read updates they wrote.
--   - profile_public / profile_contact split lets samordnare read
--     contact info but blocks writes (§8: read=all, write=not contacts).
--   - circle_member writes (invite accept / revoke / role change) run
--     only inside server actions with the service_role key. There is
--     no client INSERT/UPDATE/DELETE policy for circle_member.
--   - access_log is provisioned now with anhörig-only SELECT; writes
--     are wired in Sprint 2.
--
-- Enum value naming: English identifiers in the DB
-- (relative / staff / coordinator); Swedish UI mapping lives in the
-- app layer per CLAUDE.md "code in English, copy in Swedish".

create extension if not exists "pgcrypto";

-- =========================================================
-- Enums
-- =========================================================

create type member_role as enum ('relative', 'staff', 'coordinator');

create type update_mood as enum ('happy', 'calm', 'tired', 'worried');
create type update_sleep as enum ('good', 'okay', 'poor');
create type update_energy as enum ('high', 'medium', 'low');

-- =========================================================
-- Tables
-- =========================================================

-- person: the individual the circle exists for (§18).
-- auth_user_id reserved for §17 future "person as active user".
-- Not consulted by MVP RLS.
create table public.person (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  date_of_birth date,
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- circle: 1:1 with person. ON DELETE RESTRICT so the server action
-- must tear down a circle and its dependents before removing a person.
create table public.circle (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null unique
    references public.person(id) on delete restrict,
  name text,
  ai_summary_enabled boolean not null default true,
  retention_months int check (retention_months is null or retention_months > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- profile_public: display info; visible to any shared-circle member.
create table public.profile_public (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- profile_contact: contact info; same SELECT scope as profile_public,
-- but WRITE is self-only (samordnare can read, not write — §8).
create table public.profile_contact (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- circle_member: time-bounded membership.
-- valid_to NULL = currently active.
-- auth_method reserved for later shared-device PIN work.
create table public.circle_member (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null
    references public.circle(id) on delete cascade,
  user_id uuid not null
    references auth.users(id) on delete cascade,
  role member_role not null,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  auth_method text,
  notify_daily_updates boolean not null default true,
  created_at timestamptz not null default now(),
  check (valid_to is null or valid_to > valid_from)
);

-- One ACTIVE row per (user, circle, role). History unrestricted.
create unique index circle_member_active_unique
  on public.circle_member (user_id, circle_id, role)
  where valid_to is null;

create index circle_member_circle_idx
  on public.circle_member (circle_id, valid_to);

create index circle_member_user_idx
  on public.circle_member (user_id, valid_to);

-- daily_update: §5.1.
create table public.daily_update (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null
    references public.circle(id) on delete cascade,
  author_user_id uuid not null
    references auth.users(id) on delete restrict,
  mood update_mood not null,
  sleep update_sleep not null,
  energy update_energy not null,
  free_text text not null check (char_length(free_text) <= 280),
  image_path text,
  created_at timestamptz not null default now()
);

create index daily_update_circle_recent_idx
  on public.daily_update (circle_id, created_at desc);

-- access_log: §13. Anhörig (relative) can SELECT.
-- App-layer writes are wired in Sprint 2.
create table public.access_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null
    references auth.users(id) on delete restrict,
  action text not null,
  target_table text not null,
  target_row_id uuid,
  circle_id uuid references public.circle(id) on delete cascade,
  occurred_at timestamptz not null default now()
);

create index access_log_circle_recent_idx
  on public.access_log (circle_id, occurred_at desc);

-- =========================================================
-- Helper functions for RLS
-- =========================================================

create or replace function public.has_active_circle_role(
  p_circle_id uuid,
  p_roles member_role[]
) returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.circle_member cm
    where cm.circle_id = p_circle_id
      and cm.user_id = auth.uid()
      and cm.role = any(p_roles)
      and cm.valid_from <= now()
      and (cm.valid_to is null or cm.valid_to > now())
  );
$$;

create or replace function public.is_active_circle_member(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.has_active_circle_role(
    p_circle_id,
    array['relative','staff','coordinator']::member_role[]
  );
$$;

create or replace function public.shares_active_circle_with(p_target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.circle_member cm_self
    join public.circle_member cm_other
      on cm_other.circle_id = cm_self.circle_id
    where cm_self.user_id = auth.uid()
      and cm_other.user_id = p_target_user_id
      and cm_self.valid_from <= now()
      and (cm_self.valid_to is null or cm_self.valid_to > now())
      and cm_other.valid_from <= now()
      and (cm_other.valid_to is null or cm_other.valid_to > now())
  );
$$;

revoke all on function public.has_active_circle_role(uuid, member_role[]) from public;
revoke all on function public.is_active_circle_member(uuid) from public;
revoke all on function public.shares_active_circle_with(uuid) from public;
grant execute on function public.has_active_circle_role(uuid, member_role[]) to authenticated;
grant execute on function public.is_active_circle_member(uuid) to authenticated;
grant execute on function public.shares_active_circle_with(uuid) to authenticated;

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.person enable row level security;
alter table public.circle enable row level security;
alter table public.profile_public enable row level security;
alter table public.profile_contact enable row level security;
alter table public.circle_member enable row level security;
alter table public.daily_update enable row level security;
alter table public.access_log enable row level security;

-- person: visible to any active member of the person's (single) circle.
create policy person_select on public.person
  for select to authenticated
  using (
    exists (
      select 1 from public.circle c
      where c.person_id = person.id
        and public.is_active_circle_member(c.id)
    )
  );
-- No client INSERT/UPDATE/DELETE policy. Server action only.

-- circle: visible to active members.
create policy circle_select on public.circle
  for select to authenticated
  using (public.is_active_circle_member(circle.id));
-- No client INSERT/UPDATE/DELETE policy. Server action only.

-- profile_public
create policy profile_public_select on public.profile_public
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.shares_active_circle_with(user_id)
  );

create policy profile_public_insert on public.profile_public
  for insert to authenticated
  with check (user_id = auth.uid());

create policy profile_public_update on public.profile_public
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy profile_public_delete on public.profile_public
  for delete to authenticated
  using (user_id = auth.uid());

-- profile_contact
create policy profile_contact_select on public.profile_contact
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.shares_active_circle_with(user_id)
  );

create policy profile_contact_insert on public.profile_contact
  for insert to authenticated
  with check (user_id = auth.uid());

create policy profile_contact_update on public.profile_contact
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy profile_contact_delete on public.profile_contact
  for delete to authenticated
  using (user_id = auth.uid());

-- circle_member: visible to active members of the same circle.
-- All membership writes happen in server actions via service_role.
create policy circle_member_select on public.circle_member
  for select to authenticated
  using (public.is_active_circle_member(circle_member.circle_id));

-- daily_update
create policy daily_update_select on public.daily_update
  for select to authenticated
  using (public.is_active_circle_member(daily_update.circle_id));

create policy daily_update_insert on public.daily_update
  for insert to authenticated
  with check (
    author_user_id = auth.uid()
    and public.is_active_circle_member(daily_update.circle_id)
  );

create policy daily_update_update on public.daily_update
  for update to authenticated
  using (
    author_user_id = auth.uid()
    and public.is_active_circle_member(daily_update.circle_id)
  )
  with check (
    author_user_id = auth.uid()
    and public.is_active_circle_member(daily_update.circle_id)
  );

create policy daily_update_delete on public.daily_update
  for delete to authenticated
  using (
    author_user_id = auth.uid()
    and public.is_active_circle_member(daily_update.circle_id)
  );

-- access_log: anhörig (relative) of the circle only (§13).
create policy access_log_select on public.access_log
  for select to authenticated
  using (
    circle_id is not null
    and public.has_active_circle_role(
      access_log.circle_id,
      array['relative']::member_role[]
    )
  );
-- No client INSERT policy. App writes via server actions / service_role.

-- =========================================================
-- updated_at triggers
-- =========================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger person_touch_updated_at
  before update on public.person
  for each row execute function public.touch_updated_at();

create trigger circle_touch_updated_at
  before update on public.circle
  for each row execute function public.touch_updated_at();

create trigger profile_public_touch_updated_at
  before update on public.profile_public
  for each row execute function public.touch_updated_at();

create trigger profile_contact_touch_updated_at
  before update on public.profile_contact
  for each row execute function public.touch_updated_at();
