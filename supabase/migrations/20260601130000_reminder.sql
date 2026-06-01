-- §5.4 Påminnelser.
-- One row per reminder. RLS mirrors schedule_item: SELECT by active
-- membership; INSERT / UPDATE / DELETE additionally require author =
-- self. Helper is the shared is_active_circle_member.

create table public.reminder (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null
    references public.circle(id) on delete cascade,
  created_by_user_id uuid not null
    references auth.users(id) on delete restrict,
  title text not null
    check (char_length(title) between 1 and 80),
  due_at timestamptz not null,
  is_urgent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reminder_circle_due_idx
  on public.reminder (circle_id, due_at);

create trigger reminder_touch_updated_at
  before update on public.reminder
  for each row execute function public.touch_updated_at();

alter table public.reminder enable row level security;

create policy reminder_select on public.reminder
  for select to authenticated
  using (public.is_active_circle_member(reminder.circle_id));

create policy reminder_insert on public.reminder
  for insert to authenticated
  with check (
    created_by_user_id = auth.uid()
    and public.is_active_circle_member(reminder.circle_id)
  );

create policy reminder_update on public.reminder
  for update to authenticated
  using (
    created_by_user_id = auth.uid()
    and public.is_active_circle_member(reminder.circle_id)
  )
  with check (
    created_by_user_id = auth.uid()
    and public.is_active_circle_member(reminder.circle_id)
  );

create policy reminder_delete on public.reminder
  for delete to authenticated
  using (
    created_by_user_id = auth.uid()
    and public.is_active_circle_member(reminder.circle_id)
  );
