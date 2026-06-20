-- §0.6: drop columns and types left orphaned by F5 (structured
-- slot fields). These have not been written to since F5 shipped
-- and the application no longer reads them. Removing them now
-- prevents confusion for future contributors and frees the schema
-- to evolve cleanly.
--
-- Pre-condition: nothing in app code or tests references these
-- columns or types. F5's structured fields (period_note,
-- meal_note, mood, energy as text) fully replaced them.

alter table public.daily_update
  drop column if exists sleep,
  drop column if exists meal_eaten,
  drop column if exists period_summary;

drop type if exists update_mood;
drop type if exists update_energy;
drop type if exists update_sleep;
drop type if exists meal_eaten;
drop type if exists period_summary;
