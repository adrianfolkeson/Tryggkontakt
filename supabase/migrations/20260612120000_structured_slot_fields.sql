-- §F5: structured per-slot fields.
-- period_note + meal_note are net-new columns; mood + energy
-- convert from enum to text; the per-slot non-null CHECK is dropped
-- (all four structured fields are now optional). Snabbnotering still
-- requires free_text via a slot-conditional CHECK.
--
-- Legacy columns sleep / meal_eaten / period_summary stay on the
-- table — they hold existing rows from the slot-redesign migration
-- and named-slot inserts no longer write to them. They can be
-- dropped in a future cleanup once no row references them.

-- 1. Drop the per-slot non-null gate.
alter table public.daily_update
  drop constraint daily_update_slot_fields_check;

-- 2. free_text was NOT NULL. Named slots will no longer write to it,
-- but snabbnotering still does. Replace the table-wide NOT NULL with
-- a slot-conditional CHECK.
alter table public.daily_update
  alter column free_text drop not null;

alter table public.daily_update
  add constraint daily_update_snabbnotering_free_text_check check (
    slot <> 'snabbnotering' or free_text is not null
  );

-- 3. Convert mood + energy from enum to text. Existing enum labels
-- survive the cast as their string form (e.g. 'calm' stays 'calm').
alter table public.daily_update
  alter column mood   type text using mood::text,
  alter column energy type text using energy::text;

-- 4. The two genuinely new columns.
alter table public.daily_update
  add column period_note text,
  add column meal_note   text;
