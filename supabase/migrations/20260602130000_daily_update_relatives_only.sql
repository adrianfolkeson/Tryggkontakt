-- §5.1 daily_update: optional relatives-only visibility.
-- Adds relatives_only column; existing rows default to false (whole
-- krets visible, matching prior behavior). RLS SELECT predicate is
-- replaced to filter restricted rows from non-relative viewers.
-- INSERT/UPDATE/DELETE policies stay as-is — author-self gate still
-- applies, and a non-relative writing relatives_only=true would just
-- be writing something they can't read back, which is allowed.

alter table public.daily_update
  add column relatives_only boolean not null default false;

drop policy daily_update_select on public.daily_update;

create policy daily_update_select on public.daily_update
  for select to authenticated
  using (
    public.is_active_circle_member(daily_update.circle_id)
    and (
      not daily_update.relatives_only
      or public.has_active_circle_role(
        daily_update.circle_id,
        array['relative']::member_role[]
      )
    )
  );
