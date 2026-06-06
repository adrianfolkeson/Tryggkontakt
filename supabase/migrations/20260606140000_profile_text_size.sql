-- §F3: per-user UI text size preference.
-- Values map to a CSS --text-scale multiplier in globals.css:
--   small  → 0.9
--   medium → 1.0  (default)
--   large  → 1.15
--
-- RLS: rides on the existing profile_public own-row policies
-- (own-row read, own-row write). No new policy required.

alter table public.profile_public
  add column text_size text not null default 'medium'
  check (text_size in ('small', 'medium', 'large'));
