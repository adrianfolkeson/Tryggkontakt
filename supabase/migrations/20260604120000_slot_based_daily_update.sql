-- §slot-based daily_update: rolling journal with three time-of-day
-- slots (Morgon / Lunch / Eftermiddag) plus a free-form Snabbnotering
-- path. Existing rows backfill to 'snabbnotering' (extra fields like
-- mood/sleep/energy stay populated on those rows — harmless, just
-- not required by the new check).

create type daily_update_slot as enum (
  'morgon', 'lunch', 'eftermiddag', 'snabbnotering'
);
create type meal_eaten as enum ('ja', 'nej', 'lite');
create type period_summary as enum ('bra', 'okej', 'tuff');

alter table public.daily_update
  add column slot daily_update_slot not null default 'snabbnotering',
  add column meal_eaten meal_eaten,
  add column period_summary period_summary;

alter table public.daily_update
  alter column slot drop default;

-- Slot-specific fields can be null on slots that don't need them.
-- The per-slot check below enforces what's actually required.
alter table public.daily_update alter column mood drop not null;
alter table public.daily_update alter column sleep drop not null;
alter table public.daily_update alter column energy drop not null;

alter table public.daily_update
  add constraint daily_update_slot_fields_check check (
    case slot
      when 'morgon' then
        mood is not null
        and sleep is not null
        and energy is not null
        and meal_eaten is not null
        and free_text is not null
      when 'lunch' then
        mood is not null
        and energy is not null
        and meal_eaten is not null
        and period_summary is not null
        and free_text is not null
      when 'eftermiddag' then
        mood is not null
        and energy is not null
        and meal_eaten is not null
        and period_summary is not null
        and free_text is not null
      when 'snabbnotering' then
        free_text is not null
    end
  );

-- At most one row per (circle_id, slot, Stockholm day) for the three
-- structured slots. Snabbnotering append-only (no limit).
create unique index daily_update_slot_per_day_unique
  on public.daily_update (
    circle_id,
    slot,
    (timezone('Europe/Stockholm', created_at)::date)
  )
  where slot in ('morgon', 'lunch', 'eftermiddag');

create index daily_update_circle_today_idx
  on public.daily_update (circle_id, created_at desc, slot);
