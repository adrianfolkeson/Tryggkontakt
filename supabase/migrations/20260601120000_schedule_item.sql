-- §5.3 Gemensamt schema.
-- One row per scheduled activity in a circle. RLS mirrors
-- daily_update: SELECT gated by active membership; INSERT / UPDATE /
-- DELETE additionally require author = self. All policies use the
-- shared is_active_circle_member helper from the initial schema.

create table public.schedule_item (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null
    references public.circle(id) on delete cascade,
  created_by_user_id uuid not null
    references auth.users(id) on delete restrict,
  title text not null
    check (char_length(title) between 1 and 80),
  starts_at timestamptz not null,
  ends_at timestamptz
    check (ends_at is null or ends_at > starts_at),
  notes text
    check (notes is null or char_length(notes) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index schedule_item_circle_starts_idx
  on public.schedule_item (circle_id, starts_at);

create trigger schedule_item_touch_updated_at
  before update on public.schedule_item
  for each row execute function public.touch_updated_at();

alter table public.schedule_item enable row level security;

create policy schedule_item_select on public.schedule_item
  for select to authenticated
  using (public.is_active_circle_member(schedule_item.circle_id));

create policy schedule_item_insert on public.schedule_item
  for insert to authenticated
  with check (
    created_by_user_id = auth.uid()
    and public.is_active_circle_member(schedule_item.circle_id)
  );

create policy schedule_item_update on public.schedule_item
  for update to authenticated
  using (
    created_by_user_id = auth.uid()
    and public.is_active_circle_member(schedule_item.circle_id)
  )
  with check (
    created_by_user_id = auth.uid()
    and public.is_active_circle_member(schedule_item.circle_id)
  );

create policy schedule_item_delete on public.schedule_item
  for delete to authenticated
  using (
    created_by_user_id = auth.uid()
    and public.is_active_circle_member(schedule_item.circle_id)
  );
